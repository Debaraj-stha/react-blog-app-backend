const { getSimilarDocument } = require("../helper/apiHelper")
const { getAuthorDetails } = require("../helper/utils")
const mongoose = require("mongoose");
const { BlogModel, BlogReadModel, AuthorModel, FeedbackModel, SubscriberModel, RoleAssignmentModel, UserModel } = require("../models");
const logActivity = require("../helper/activityLoager");
const checkPermission = require("./RoleController");
const sendMail = require("../helper/emailHelper");
const { blogMailTemplet, roleRevokedEmailTemplate, RoleAssignmentMailTemplate } = require("../helper/mailHTML");
/**
 * 
 * @param {*} editors -editors id array
 * @param {*} blogTitle -title of blog
 * @param {*} blogId  -id of blog
 * @param {*} isUpdate  - a flag to represent update operation default flase
 */
const assignEditor = async (editors, blogTitle, blogId, authorId) => {
    try {
        console.log(editors,blogId,authorId,blogTitle)
        // Convert to Set for easier comparison
        const newEditorSet = new Set(editors?.map(String));

        // Fetch old editors from DB
        const oldAssignments = await RoleAssignmentModel.find({ blog_id: blogId, role: 'editor' }).select('user_id');
        const oldEditorSet = new Set(oldAssignments.map((e) => e.user_id.toString()));

        // Find removed editors
        const removedEditors = [...oldEditorSet].filter((id) => !newEditorSet.has(id));
        const addedEditors = [...newEditorSet].filter((id) => !oldEditorSet.has(id));
        const from = `React-Blog-App.${process.env.EMAIL}`
        const blogURL = `http://localhost:3000/blogs/${blogId}`
        // Remove roles for removed editors
        if (removedEditors.length) {
            await RoleAssignmentModel.deleteMany({ blog_id: blogId, user_id: { $in: removedEditors }, role: 'editor' });
            const removedEditorNames = await Promise.all(
                removedEditors.map((id) => UserModel.findById(id).select('name email'))
            );
            for (const editor of removedEditorNames) {
                const html = roleRevokedEmailTemplate(editor.name, blogTitle, blogURL);
                await sendMail({
                    to: editor.email,
                    from,
                    subject: 'Editor Role Revoked',
                    html
                });
            }
        }

        // Add roles for new editors
        if (addedEditors.length) {
            const roleArray = addedEditors.map((editor) => ({
                blog_id: blogId,
                user_id: editor,
                role: 'editor',
            }));

            await RoleAssignmentModel.insertMany(roleArray);

            const addedEditorNames = await Promise.all(
                addedEditors.map((id) => UserModel.findById(id).select('name email'))
            );
            for (const editor of addedEditorNames) {
                const html = RoleAssignmentMailTemplate(editor.name, blogTitle, blogURL);
                await sendMail({
                    to: editor.email,
                    from,
                    subject: 'You have been assigned as an Editor',
                    html
                });
            }
            await logActivity({
                type: 'EDITOR_ASSIGNED',
                author_id: authorId,
                message: `You assigned ${addedEditorNames.map(
                    (n) => `<span class="font-semibold text-blue-400">${n.name}</span>`
                ).join(', ')} as editor${addedEditorNames.length > 1 ? 's' : ''} to your blog titled
        <a href='/blogs/${blogId}'><span class="font-medium text-green-400">${blogTitle}</span></a>.`
            });
        }

    } catch (error) {
        console.error("Error assigning editor:", error);
        throw error;
    }
};

const saveBlog = async (req, res) => {
    try {
        const data = req.body || req.data;
        const blog = new BlogModel(data);
        const result = await blog.save();
        const editors = blog.editors;
        console.log("editors",data.editors)
        if (blog) {
            await assignEditor(data.editors, result.title, result._id)
        }
        const author = await AuthorModel.findById(data.author_id).select("user_id")
        const user = await UserModel.findById(author.user_id).select('name')

        const [subscriberToAuthor, subscriberInGeneral] = await Promise.all([
            SubscriberModel.find({ author_id: data.author_id, isSubscribedToAll: false }).select("user_id"),
            SubscriberModel.find({ isSubscribedToAll: true }).select("user_id"),
        ]);

        const [subscriberToAuthorEmail, generalSubscriberEmail] = await Promise.all([
            Promise.all(
                subscriberToAuthor.map((subscriber) =>
                    UserModel.findById(subscriber.user_id).select("email")
                )
            ),
            Promise.all(
                subscriberInGeneral.map((subscriber) =>
                    UserModel.findById(subscriber.user_id).select("email")
                )
            ),
        ]);

        // Extract and flatten emails, filtering out nulls
        const authorEmail = subscriberToAuthorEmail.map((user) => user?.email).filter(Boolean);
        const generalEmail = generalSubscriberEmail.map((user) => user?.email).filter(Boolean);

        const subscribersEmails = [...new Set([...generalEmail, ...authorEmail])];
        const from = `React-Blog-App.${process.env.EMAIL}`
        const blogURL = `http://localhost:3000/blogs/${result._id}`
        const html = blogMailTemplet(user.name, result.title, blogURL)
        const subject = `New Blog: ${result.title}`

        sendMail({ from, to: subscribersEmails, subject, html })

        await logActivity({
            type: "BLOG_CREATED",
            author_id: result.author_id,
            message: `You created a new blog:<a href='/blogs/${result._id}'>
        <span class="font-medium text-green-400">${result.title}</span></a>`,
        });

        res.status(200).json({
            message: "Blog posted successfully",
            blog: result.toObject({ versionKey: false }),
            subscribersEmails,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBlog = async (req, res) => {
    try {
        const newBlog = req.data || req.body;
        const { user_id } = req.query
        const blogId = req.params.id;
        const editors = newBlog.editors
        if (!user_id)
            return res.status(400).json({ message: "You user id is required" })
        const isEligible = await checkPermission(user_id.trim(), blogId, 'UPDATE')
        if (!isEligible)
            return res.status(400).json({ message: "You are not eligible to perfome this action" })
        delete newBlog.editor_email
        const editor_email = newBlog.editor_email
        if (editors) {
            await assignEditor(editors, newBlog.title, blogId,newBlog.author_id)
        }
        const updatedBlog = await BlogModel.findByIdAndUpdate(blogId, newBlog, {
            new: true,
            runValidators: true
        })

        // EDITOR_ASIGNED
        await logActivity({
            type: 'BLOG_EDITED',
            author_id: updatedBlog.author_id,
            message: editor_email ? `${editor_email} your blog edited blog: <a href='/blogs/${updatedBlog._id}'>
             <span class="font-medium text-green-400">${newBlog.title}</span></a>`
                : `You edited blog: <a href='/blogs/${updatedBlog._id}'>
             <span class="font-medium text-green-400">${newBlog.title}</span></a>`
        })

        res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog.toObject({ versionKey: false }) })

    } catch (error) {
        console.log("error",error)
        res.status(500).json({ message: error.message })
    }
}
const deleteBlog = async (req, res) => {
    try {
        const { author_id } = req.params;
        const { blog_id } = req.body
        const { user_id } = req.query
        if (!user_id)
            return res.status(400).json({ message: "You user id is required" })
        const isEligible = await checkPermission(user_id.trim(), blog_id, 'DELETE')
        if (!isEligible)
            return res.status(400).json({ message: "You are not eligible to perfome this action" })
        const author = await AuthorModel.findById(author_id)
        if (!author) {
            return res.staus(404).json({ message: "Author not found" })
        }

        const blog = await BlogModel.findById(blog_id)
        if (!blog) {
            return res.staus(404).json({ message: "Blog not found" })
        }
        await BlogModel.findOneAndDelete({ _id: blog_id, author_id: author_id })
        res.status(200).json({ message: "Blog deleted successfully", blog_id, author_id })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getTotalBlogsLength = async (req, res) => {
    try {
        const { category } = req.query;
        let total = null;
        if (category) {
            total = await BlogModel.countDocuments({ isPublished: true, category: category })
        }
        else {
            total = await BlogModel.countDocuments({ isPublished: true })
        }
        res.status(200).json({ total })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getBlogs = async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const { category } = req.query
        let blogs = null;
        if (category) {
            blogs = await BlogModel.find({
                $and: [
                    { isPublished: true },
                    { category }
                ]
            }).skip(skip).limit(limit)

        }
        else {
            blogs = await BlogModel.find({ isPublished: true }).skip(skip).limit(limit)

        }
        const cleanedBlogs = blogs.map(blog => blog.toObject({ versionKey: false }))
        res.status(200).json({ blogs: cleanedBlogs })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}
const getBlog = async (req, res) => {
    try {
        const id = req.params.id;
        let { fetch_editors = "false", fetch_similar = "true" } = req.query
        const boolFetchEditors = fetch_editors === "true"
        const boolFetchSimilar = fetch_similar === "true"
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const blog = await BlogModel.findById(id);
        const author=await AuthorModel.findById(blog.author_id).select("user_id")
        const user=await UserModel.findById(author.user_id).select("name")

        await BlogReadModel.updateOne(
            { blog_id: id, ip },
            { $setOnInsert: { blog_id: id, ip } },
            { upsert: true }
        )
        await BlogModel.findByIdAndUpdate(id, { $inc: { views: 1 } })
        let readerCounts = null;
        let authorDetails = null
        let cleanedBlogs = blog.toObject({ versionKey: false });
        if (boolFetchEditors) {
            const editors = await RoleAssignmentModel.find({ blog_id: id }).select('user_id')
            const editorsDetails = await Promise.all(editors.map(async (editor) => await UserModel.findById(editor.user_id).select('name profile _id email')))
            cleanedBlogs.editors = editorsDetails
        }
        // Create filter fields dynamically, including all tags
        const filterFields = [];
        let similarBlogs = null
        if (boolFetchSimilar) {
            readerCounts = await BlogReadModel.countDocuments({ blog_id: id })
            authorDetails = await getAuthorDetails(cleanedBlogs.authorId, 'name profile _id');
            if (cleanedBlogs.title?.trim()) {
                filterFields.push(['title', cleanedBlogs.title]);
            }
            if (cleanedBlogs.category?.trim()) {
                filterFields.push(['category', cleanedBlogs.category]);
            }
            if (Array.isArray(cleanedBlogs.tags) && cleanedBlogs.tags.length > 0) {
                cleanedBlogs.tags.forEach(tag => {
                    filterFields.push(['tags', tag]);
                });
            }
        }
        if (boolFetchSimilar) {
            similarBlogs = await getSimilarDocument({ ModelName: BlogModel, filterFields, arrayFields: ["tags"] });
            const similarBlogsId = similarBlogs.map((blog) => ({ id: blog.id, title: blog.title }))
            const filteredSimilarBlogs = similarBlogsId.filter(b => b.toString() !== id);
            cleanedBlogs.similarBlogs = filteredSimilarBlogs,
            cleanedBlogs.author_name=user.name
        }
        res.status(200).json({
            blog: cleanedBlogs,
            authorDetails,
            readerCounts
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};



const searchBlogs = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Query is required" });
        }

        const words = query.trim().split(/\s+/); // Split by space
        const regexArray = words.map((word) => new RegExp(word, "i")); // Case-insensitive regex
        const orConditions = [];

        // For each word, push search conditions for multiple fields
        for (const regex of regexArray) {
            orConditions.push(
                // Match title field (case-insensitive partial match)
                { title: { $regex: regex } },

                // Match category field
                { category: { $regex: regex } },

                // Match any tag in the tags array
                { tags: { $in: [regex] } },

                // Match content where any paragraph contains the word in a child text node
                {
                    content: {
                        /*
                        elemMatch is a query operator used to match at least one element in an 
                        array that satisfies multiple conditions simultaneously.*/
                        $elemMatch: {
                            children: {
                                $elemMatch: {
                                    text: { $regex: regex }
                                }
                            }
                        }
                    }
                }
            );
        }
        const blogs = await BlogModel.find({ $or: orConditions });
        res.status(200).json({ blogs: blogs, message: "Search successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const allowedFilterFields = ["title", "category", "tags", "authorId"];
const allowedSortFields = ["title", "createdAt", "updatedAt"];

const filterAndSortBlogs = async (req, res) => {
    try {
        const { field, value, sortField, sortOrder = "asc" } = req.query;
        const filter = {};
        const limit = parseInt(req.query.limit) || 10
        // Filtering
        if (field && value) {
            if (!allowedFilterFields.includes(field)) {
                return res.status(400).json({ message: `Invalid filter field: ${field}` });
            }

            const valueArray = value.trim().split(/\s+/);
            const regexArray = valueArray.map((val) => new RegExp(val.toLowerCase(), "i"));

            // Tags field supports $in, others support regex
            if (field === "tags") {
                filter.tags = { $in: regexArray };
            } else {
                filter[field] = { $in: regexArray };
            }
        }

        // Sorting
        let sort = {};
        if (sortField) {
            if (!allowedSortFields.includes(sortField)) {
                return res.status(400).json({ message: `Invalid sort field: ${sortField}` });
            }
            sort[sortField] = sortOrder === "desc" ? -1 : 1;
        }

        const blogs = await BlogModel.find(filter).limit(limit).sort(sort);

        res.status(200).json({
            blogs,
            message: `Filtered${field ? ` by ${field}` : ""} and sorted${sortField ? ` by ${sortField} (${sortOrder})` : ""} successfully.`,
        });
    } catch (error) {
        console.log("error",error)
        res.status(500).json({ message: error.message });
    }
};
const getBlogTags = async (req, res) => {
    try {
        const tagsDocs = await BlogModel.find({}).select('tags').lean();

        const normalizeTag = (tag) => {
            tag = tag.toLowerCase().trim();
            if (["node", "nodejs"].includes(tag)) return "nodejs";
            if (["js", "javascript"].includes(tag)) return "javascript";
            return tag;
        };

        // Apply normalization + deduplication
        const normalizedTags = tagsDocs.flatMap(doc => (doc.tags || []).map(normalizeTag));
        //removing duplicates  and converting set back to array
        const uniqueTags = Array.from(new Set(normalizedTags));
        res.status(200).json({ tags: uniqueTags, message: "Tags loaded successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getPopularBlogsByAuthor = async (author_id, limit = 5) => {
    try {
        const popularBlogs = await BlogModel.find({ author_id, isPublished: true })
            .sort({ views: -1 })  // descending by views
            .limit(limit)
            .select('title views createdAt') // select only needed fields

        return popularBlogs
    } catch (error) {
        throw error
    }
}
const getMostUsedTagByAuthor = async (author_id) => {
    const result = await BlogModel.aggregate([
        { $match: { author_id } },
        { $unwind: "$tags" },
        {
            $group: {
                _id: "$tags",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);

    return result[0]?._id || null;
};
const getCountsForAuthorHelper = async (author_id) => {
    try {
        const [totalBlogs, totalPublished, totalUnpublished, totalFeedbacks, totalReader, totalViews, popularBlog,
            scheduledBlosCount, mostUsedTag,
            subscriberCount
        ] = await Promise.all([
            BlogModel.countDocuments({ author_id }),
            BlogModel.countDocuments({ isPublished: true, author_id }),
            BlogModel.countDocuments({ isPublished: false, author_id }),
            FeedbackModel.countDocuments({
                blog_id: { $in: await BlogModel.find({ author_id }).distinct('_id') }
            }),
            BlogReadModel.countDocuments({
                blog_id: { $in: await BlogModel.find({ author_id }).distinct('_id') }
            }),
            //total views
            await BlogModel.aggregate([
                {
                    $match: { author_id: author_id }
                },
                {
                    $group: {
                        "_id": null,
                        "totalViews": { $sum: "$views" }
                    }
                }

            ]),
            //popular blog
            await getPopularBlogsByAuthor(author_id, 1),
            BlogModel.countDocuments({
                isScheduled: true,
                isPublished: false,
                author_id,
            }),
            //must used tags
            await getMostUsedTagByAuthor(author_id),
            await SubscriberModel.countDocuments({
                author_id
            })



        ])
        return {
            totalBlogs,
            totalPublished,
            totalUnpublished,
            totalFeedbacks,
            totalReader,
            totalViews: totalViews[0]?.totalViews || 0,
            popularBlog,
            scheduledBlosCount,
            mostUsedTag,
            subscriberCount
        }
    } catch (error) {
        throw error
    }
}

const getCountsForAuthor = async (req, res) => {
    try {
        const { author_id } = req.query
        if (!author_id)
            return res.status(400).json({ message: "Author id is required" });
        const author = await AuthorModel.findById(author_id)
        if (!author)
            return res.status(404).json({ message: "Author not found" });
        const objectAuthorId = new mongoose.Types.ObjectId(author_id)
        const counts = await getCountsForAuthorHelper(objectAuthorId)
        res.status(200).json({ counts, message: "counts fetched successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTotalBlogCounts = async (req, res) => {
    try {
        const { author_id } = req.query
        const isPublished = req.query.isPublished === "true"
        if (!author_id)
            return res.status(400).json({ message: "Author id is required" });
        const author = await AuthorModel.findOne({ author_id })
        if (!author)
            return res.status(404).json({ message: "Author not found" });
        const totalCounts = await BlogModel.countDocuments({ isPublished: isPublished, authorId: author_id })
        res.status(200).json({ totalCounts, message: `${isPublished ? 'published' : "unpublished"} blogs count fetch successfully` })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getMostPopularBlogsByAuthor = async (req, res) => {
    try {
        const { author_id } = req.params;
        const limit = parseInt(req.query.limit) || 5;

        if (!author_id) {
            return res.status(400).json({ message: "Author ID is required" });
        }
        const ObjectId = new mongoose.Types.ObjectId(author_id)
        const blogFeedbacks = await BlogModel.aggregate([
            {
                $match: {
                    author_id: ObjectId
                }
            },
            {
                $sort: { views: -1 }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: "Feedbacks",
                    localField: "_id",
                    foreignField: "blog_id",
                    as: "feedbacks"
                }
            },
            {
                $addFields: {
                    feedbackCount: { $size: "$feedbacks" }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    views: 1,
                    createdAt: 1,
                    feedbackCount: 1
                }
            }
        ])

        res.status(200).json({
            message: "Most popular blogs fetched successfully",
            count: blogFeedbacks.length,
            blogs: blogFeedbacks

        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const handleBlogAction = async (req, res) => {
    try {

        const { author_id, blog_id, action_type } = req.params;
        const { scheduledAt } = req.body; // only needed for schedule/reschedule
        const { user_id } = req.query
        if (!user_id)
            return res.status(400).json({ message: "You user id is required" })
        const isEligible = await checkPermission(user_id.trim(), blog_id, 'UPDATE')
        if (!isEligible)
            return res.status(400).json({ message: "You are not eligible to perfome this action" })
        const blog = await BlogModel.findOne({ _id: blog_id, author_id });
        if (!blog) {
            return res.status(404).json({ message: `Blog not found for given author.` });
        }

        let updateFields = {};
        let activityType = "";
        let activityMessage = "";

        switch (action_type) {
            case "publish":
                updateFields = { isPublished: true, isScheduled: false, scheduledAt: null };
                activityType = "BLOG_PUBLISHED";
                activityMessage = `You published blog: <a href='/blogs/${blog_id}'>
             <span class="font-medium text-green-400">${blog.title}</span></a>`;
                break;

            case "unpublish":
                updateFields = { isPublished: false, isScheduled: false, scheduledAt: null };
                activityType = "BLOG_UNPUBLISHED";
                activityMessage = `You unpublished blog: <a href='/blogs/${blog_id}'>
             <span class="font-medium text-green-400">${blog.title}</span></a>`
                break;

            case "schedule":
                if (!scheduledAt) {
                    return res.status(400).json({ message: "Missing scheduledAt for scheduling." });
                }
                updateFields = {
                    isPublished: false,
                    isScheduled: true,
                    scheduledAt,
                };
                activityType = "BLOG_SCHEDULED";
                activityMessage = `You scheduled blog <a href='/blogs/${blog_id}'>
                 <span class="font-medium text-green-400">${blog.title}</span></a>for ${new Date(scheduledAt).toLocaleString()}`;
                break;

            case "reschedule":
                if (!scheduledAt) {
                    return res.status(400).json({ message: "Missing scheduledAt for rescheduling." });
                }
                updateFields = {
                    isPublished: false,
                    isScheduled: true,
                    scheduledAt,
                };
                activityType = "BLOG_RESCHEDULED";
                activityMessage = `You rescheduled blog <a href='/blogs/${blog_id}'>
             <span class="font-medium text-green-400">${blog.title}</span></a> to ${new Date(scheduledAt).toLocaleString()}`;
                break;

            default:
                return res.status(400).json({ message: "Invalid action_type." });
        }

        const updated = await BlogModel.findByIdAndUpdate(blog_id, updateFields, {
            new: true,
        });
        await logActivity({
            type: activityType,
            author_id,
            message: activityMessage,
        });

        res.status(200).json({
            message: `Blog ${action_type} action successful`,
            blog: updated,
        });
    } catch (error) {
        res.status(500).json({
            message: `Server error. Error: ${error.message}`,
        });
    }
};

const blogsIcanEdit = async (req, res) => {
    try {
        const { user_id } = req.params
        const validBlogsId = await RoleAssignmentModel.find({ user_id }).select('blog_id')
        if (validBlogsId.length == 0) {
            return res.status(200).json({ message: "You are not editor on any of blogs" })
        }
        const blogs = await Promise.all(validBlogsId.map(async (blogs) => await BlogModel.findById(blogs.blog_id)))
        res.status(200).json({ message: "Blogs you elligible to edit are fteched successfully", blogs })
    } catch (error) {
        res.status(500).json({ message: `Error while getting blog i can  edit.${error.message}` })
    }
}



module.exports = {
    saveBlog,
    deleteBlog,
    updateBlog,
    getBlogs,
    getBlog,
    // getBlogByAuthor,
    searchBlogs,
    filterAndSortBlogs,
    getBlogTags,
    getTotalBlogsLength,
    getTotalBlogCounts,
    getCountsForAuthor,
    getMostPopularBlogsByAuthor,
    handleBlogAction,
    blogsIcanEdit
    // recentBlogs
}