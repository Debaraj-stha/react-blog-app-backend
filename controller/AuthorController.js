const { mongoose } = require("mongoose");
const { totalDocumentLength } = require("../helper/apiHelper");
const { AuthorModel, BlogModel, BlogReadModel, UserModel, SubscriberModel } = require("../models");
const logActivity = require("../helper/activityLoager");
;

// Create new author
const saveAuthor = async (req, res) => {
    try {
        const data = req.body || req.data;
        const author = new AuthorModel(data);
        const user = await UserModel.findById(author.user_id)
        const result = await author.save();
        await logActivity({
            type: 'NEW_AUTHOR',
            author_id: author._id,
            message: `Welcome  ${user.name}.Now you became author`
        })

        res.status(200).json({ message: "Author created successfully", author: result.toObject({ versionKey: false }) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAuthor = async (req, res) => {
    try {
        const newAuthor = req.body || req.data;
        const author_id = req.params.author_id;
        const userUpdates = newAuthor.user;
        const authorDetails = newAuthor.details;

        // Get author and its linked user_id
        const author = await AuthorModel.findById(author_id).select("user_id");
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        const user_id = author.user_id;
        // Update author.details if provided
        if (authorDetails) {
            await AuthorModel.findByIdAndUpdate(
                author_id,
                { details: authorDetails },
                { new: true, runValidators: true }
            );
        }

        // Update linked user if user data is provided
        if (userUpdates) {
            const user = await UserModel.findById(user_id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            await UserModel.findByIdAndUpdate(
                user_id,
                { $set: userUpdates },
                { new: true, runValidators: true }
            );
        }
        await logActivity({
            type: 'AUTHOR_UPDATED',
            author_id: author_id,
            message: `You update your profile details`
        })

        res.status(200).json({ message: "Author updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete author by author_id
const deleteAuthor = async (req, res) => {
    try {
        const author_id = req.params.author_id;
        const deletedAuthor = await AuthorModel.findOneAndDelete({ author_id });

        if (!deletedAuthor) {
            return res.status(404).json({ message: "Author not found" });
        }

        res.status(200).json({ message: "Author deleted successfully", author_id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all authors
const getAuthors = async (req, res) => {
    try {
        const authors = await AuthorModel.find({}).populate("user_id")
        const cleanedAuthors = authors.map(author => {
            const authorObj = author.toObject({ versionKey: false });
            const { user_id, ...rest } = authorObj
            return {
                ...rest,
                user: user_id
            }
        }
        );
        res.status(200).json({ authors: cleanedAuthors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single author by author_id
const getAuthor = async (req, res) => {
    try {
        const author_id = req.params.author_id;

        const author = await AuthorModel.findById(author_id).lean();

        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        const user = await UserModel.findById(author.user_id).lean()
        if (!user)
            return res.status(404).json({ message: "user not found" })
        const cleanedAuthor = {
            details: {
                ...author.details,
                email: user.email,
            }
        };
        const authorWithUser = {
            ...user,
            ...cleanedAuthor

        }
        res.status(200).json({ author: authorWithUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getBlogsWithAuthor = async (req, res) => {
    try {
        const author_id = req.params.author_id;
        const skip = parseInt(req.query.skip, 10) || 0;
        const limit = parseInt(req.query.limit, 10) || 10;
        const fetchBlogsOnly = req.query.fetchBlogsOnly === 'true';
       

        let authorDetails = null;
        let details = null;
        let user_id=null

        if (!fetchBlogsOnly) {
            authorDetails = await AuthorModel.findById(author_id).populate("user_id");
            if (!authorDetails) {
                return res.status(404).json({ message: "Invalid Author ID" });
            }
            user_id = authorDetails.user_id;
            details = authorDetails.details;
        }

        const authorBlogs = await BlogModel.find({ author_id })
            .skip(skip)
            .limit(limit)
            .lean();

        const blogWithReaderCount = await Promise.all(
            authorBlogs.map(async (blog) => {
                const readerCount = await BlogReadModel.countDocuments({ blog_id: blog._id });
                return {
                    ...blog,
                    readerCount,
                };
            })
        );

        const totalBlogs = await BlogModel.countDocuments({ author_id })

        return res.status(200).json({
            author: fetchBlogsOnly
                ? null
                : {
                    name: user_id?.name,
                    email: user_id?.email,
                    profile: user_id?.profile,
                    details,
                    _id: authorDetails?._id,
                },
            blogs: blogWithReaderCount,
            totalBlogs,
            message: 'Author and blogs loaded successfully',
        });

    } catch (error) {
        console.error("Error in getBlogsWithAuthor:", error);
        res.status(500).json({ message: error.message });
    }
};

const authorTotalBlogs = async (req, res) => {
    try {
        const author_id = req.params.author_id;
        const totalBlogs = await BlogModel.countDocuments({ author_id: author_id });

        if (totalBlogs === 0) {
            return res.status(200).json({ message: "No blogs found for this author" });
        }

        res.status(200).json({ totalBlogs });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAuthorBlogsFeedback = async (req, res) => {
    try {
        const author_id = req.query.author_id;
        const objectId = new mongoose.Types.ObjectId(author_id)
        const author = await AuthorModel.findById(objectId)
        if (!author)
            return res.status(404).json({ message: "Author not found" })
        const result = await BlogModel.aggregate([
            {
                $match: { author_id: objectId }
            },
            {
                $lookup: {
                    from: "feedbacks",
                    localField: "_id",
                    foreignField: "blog_id",
                    as: "feedbacks"
                }
            },
            {
                $facet: {
                    blogsWithFeedbacks: [
                        {
                            $project: {
                                title: 1,
                                feedbacks: {
                                    $map: {
                                        input: "$feedbacks",
                                        as: "fb",
                                        in: {
                                            name: "$$fb.name",
                                            message: "$$fb.message",
                                            createdAt: "$$fb.createdAt",
                                            profile: "$$fb.profile",
                                            blog_id: "$$fb.blog_id"
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    totalFeedbacks: [
                        {
                            $project: {
                                feedbackCount: { $size: "$feedbacks" }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$feedbackCount" }
                            }
                        }
                    ]
                }
            }
        ]);


        res.status(200).json({
            feedbacks: result[0]?.blogsWithFeedbacks,
            totalFeedbacks: result[0]?.totalFeedbacks[0]?.total,
            message: "feedback fetched successfully"
        })
    } catch (error) {
        res.status(500).json({ message: `Error while getting author blogs feedbacks:${error}` })
    }
}
const getScheduledDraftBlogs = async (req, res) => {
    try {
        const { author_id } = req.params;

        // Ensure author exists
        const author = await AuthorModel.findById(author_id);
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }

        // Fetch scheduled and draft blogs in parallel
        const [scheduledBlogs, draftBlogs] = await Promise.all([
            BlogModel.find({
                author_id: author_id,
                isScheduled: true,
                isPublished: false
            }).select("_id title scheduledAt").lean(),
            BlogModel.find({
                author_id: author_id,
                isScheduled: false,
                isPublished: false
            }).select("_id title updatedAt").lean()
        ]);


        res.status(200).json({
            scheduledBlogs,
            draftBlogs,
            message: "Draft and scheduled blogs fetched successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: `Error while getting author draft and scheduled blogs: ${error.message}`
        });
    }
};



module.exports = {
    saveAuthor,
    updateAuthor,
    deleteAuthor,
    getAuthors,
    getAuthor,
    getBlogsWithAuthor,
    authorTotalBlogs,
    getAuthorBlogsFeedback,
    getScheduledDraftBlogs
};
