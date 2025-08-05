const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogReadSchema = new Schema({
  blog_id: { type: Schema.Types.ObjectId, ref: 'blogs', required: true },
  ip: { type: String, required: true },
  readAt: { type: Date, default: Date.now }
});

BlogReadSchema.index({ blog_id: 1, ip: 1 }, { unique: true });

module.exports = BlogReadSchema
