const { Schema } = require('mongoose')

const ActivitySchema = new Schema({
    author_id: {
        type: Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'BLOG_EDITED',
            'BLOG_PUBLISHED',
            'NEW_COMMENT',
            'NEW_LIKE',
            'NEW_SUBSCRIBER',
            'NEW_FEEDBACK',
            'BLOG_SCHEDULED',
            'BLOG_CREATED',
            'NEW_MESSAGE',
            'BLOG_DELETED',
            'AUTHOR_UPDATED',
            'NEW_AUTHOR',
            'UNSUBSCRIBED',
            'BLOG_RESCHEDULED',
            'BLOG_UNPUBLISHED',
            'EDITOR_ASSIGNED'
        ]
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = ActivitySchema
