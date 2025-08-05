const { Schema, } = require("mongoose");
const RoleAssignmentSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blog_id: {
      type: Schema.Types.ObjectId,
      ref: "blogs",
      required: true,
    },
    role: {
      type: String,
      enum: ['author', 'editor'],
      required: true,
      default: "author"
    },
  },
  { timestamps: true }
);


RoleAssignmentSchema.index({ user_id: 1, blog_id: 1 }, { unique: true });

module.exports = RoleAssignmentSchema
