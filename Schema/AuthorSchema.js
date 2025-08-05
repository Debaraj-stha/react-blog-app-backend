const { Schema } = require('mongoose')

const AuthorSchema = new Schema(
  {
    user_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    details: {
      type: new Schema(
        {
          username: { type: String, required: true, unique: true },
          bio: String,
          location: String,
          education: String,
          profession: String,
          hobbies: { type: [String], default: [] },
          skills: { type: [String], default: [] },
          experience: [
            {
              company: String,
              role: String,
              duration: String,
            },
          ],
          languages: { type: [String], default: [] },
          joined: { type: Date, default: Date.now },
          website: String,
          social: {
            github: String,
            twitter: String,
            linkedin: String,
            instagram: String,
          },
        },
        { _id: false } // prevent nested _id for details
      ),
      default: {},
    },
  },
  { timestamps: true }
)

module.exports = AuthorSchema
