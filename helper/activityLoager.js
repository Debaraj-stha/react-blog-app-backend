const { ActivityModel } = require("../models")


const logActivity = async ({ type, author_id, message }) => {
  try {
    await ActivityModel.create({ type, author_id, message })
  } catch (err) {
    console.error("Failed to log activity:", err)
  }
}

module.exports = logActivity
