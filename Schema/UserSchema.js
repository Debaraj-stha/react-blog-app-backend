const { Schema } = require('mongoose')
const UserSchema = new Schema({
    name: {
        type: String,
        default: null,
        index:true
    },
    email: {
        type: String,
        default: null,
        index:true
    },
    profile: {
        type: String,
        default: null
    },
    authId: { //id from firebase
        type: String,
        required: true
    }
},{timestamps:true})
module.exports = UserSchema