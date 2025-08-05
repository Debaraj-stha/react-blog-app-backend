const logActivity = require("../helper/activityLoager")
const { FeedbackModel, BlogModel } = require("../models")

const saveFeedback = async (req, res) => {
    try {
        const data = req.body || req.data
        const { blog_id } = data
        const blog = await BlogModel.findById(blog_id)
        if (!blog)
            return res.status(400).json({ message: "Blog not found" })
        const newFeedback = new FeedbackModel(data)
        const info = await newFeedback.save()
        await logActivity({
            type: 'NEW_FEEDBACK',
            author_id: blog.author_id,
            message: `A new comment was added on your blog <a href='/blogs/${blog_id}'>
             <span class="font-medium text-green-400">${blog.title}</span></a>`
        })

        res.status(200).json({ message: "Feedback send successing", feedback: info })
    } catch (error) {
        res.status(500).json({ message: `Error in saving  feedback in database.${error.message}` })
    }
}
const getFeedback = async (req, res) => {
    try {
        const { blog_id } = req.params
        const skip = parseInt(req.query.skip) || 0
        const limit = parseInt(req.query.limit) || 10
        if (!blog_id)
            return res.status(400).json({ message: "Blog ID is required" })
        const feedbacks = await FeedbackModel.find({ blog_id }).skip(skip).limit(limit).sort({ createdAt: -1 })
        if (!feedbacks || feedbacks.length === 0)
            return res.status(200).json({ feedbacks: [], message: "No feedbacks yet" });
        res.status(200).json({ feedbacks, message: "Feedbacks fetched successfully" })
    } catch (error) {
        res.status(500).json({ message: `Error in fetching feedbacks from database.${error.message}` })
    }
}
const getTotalFeedbackCount = async (req, res) => {
    try {
        const { blog_id } = req.params
        if (!blog_id)
            return res.status(400).json({ message: "Blog ID is required" })
        const count = await FeedbackModel.countDocuments({ blog_id })
        res.status(200).json({ count, message: "Total feedback count fetched successfully" })
    } catch (error) {
        res.status(500).json({ message: `Error in fetching total feedback count from database.${error.message}` })
    }
}

module.exports = {
    saveFeedback,
    getFeedback,
    getTotalFeedbackCount

}