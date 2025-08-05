const { Schema } = require("mongoose");

const SubscriberSchema = new Schema({
    author_id: {
        type: Schema.Types.ObjectId,
        ref: "Authors",
        // required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isSubscribedToAll:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })


module.exports = SubscriberSchema