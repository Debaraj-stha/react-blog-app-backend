const { Schema } = require("mongoose")
const ContactSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v),
            message: (props) => `${props.value} is not a valid email address!`
        }

    },
    message: {
        type: String,
        required: true
    },

}, { timestamps: true })


module.exports = ContactSchema