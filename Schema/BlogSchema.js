

const Schema = require("mongoose").Schema

const BlogSchema = new Schema({
    author_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Authors"
    },
    content: Array,
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: " ",
        index: true
    },
    tags: {
        type: Array,
        default: []
    },
    isPublished: {
        default: true,
        type: Boolean
    },
    isScheduled: {
        default: false,
        type: Boolean
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

BlogSchema.index({ authorId: 1, category: 1, title: "text", content: "text" });
BlogSchema.post("findOneAndDelete", async function (doc) {
    const { ActivityModel } = require("../models");
    if (doc) {
        const activity = new ActivityModel({
            type: "BLOG_DELETED",
            message: `You deleted the blog: ${doc.title}`,
            author_id: doc.author_id
        });
        await activity.save();
    }
});



module.exports = BlogSchema