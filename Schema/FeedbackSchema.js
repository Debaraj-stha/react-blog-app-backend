const { Schema } = require('mongoose');

const FeedbackSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v),
            message: (props) => `${props.value} is not a valid email`
        }
    },
    profile: {
        type: String,
        default: null
    },
    message: {
        type: String,
        required: true,
    },
    blog_id: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "blogs"
    }

}, { timestamps: true })


module.exports = FeedbackSchema