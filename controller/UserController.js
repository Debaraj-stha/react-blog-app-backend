const { UserModel, AuthorModel, BlogModel } = require("../models");


// Create new user
const saveUser = async (req, res) => {
    try {
        const { authId, name, email, profile } = req.body;
        if (!authId) {
            return res.status(400).json({ message: "authId is required" });
        }
        const result = await UserModel.findOneAndUpdate(
            { authId },
            {
                $setOnInsert: {
                    name: name || null,
                    email: email || null,
                    profile: profile || null,
                    authId
                }
            },
            {
                new: true,
                upsert: true,
            }
        );

        res.status(200).json({
            message: "User inserted",
            user: result.toObject({ versionKey: false })
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }


};

// Optional: get user by authId
const getUserByAuthId = async (req, res) => {
    try {
        const { authId } = req.params;
        const user = await UserModel.findOne({ authId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: user.toObject({ versionKey: false }) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Search users by name or email (case-insensitive, partial match)
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Search query is required" });
        }
        const searchRegex = new RegExp(query, "i"); // case-insensitive

        const users = await UserModel.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        });

        res.status(200).json({
            count: users.length,
            users: users.map(user => user.toObject({ versionKey: false })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getUserId = async (req, res) => {
    try {
        const { author_id } = req.params;
        if (!author_id) {
            return res.status(400).json({ message: "author_id is required" });
        }
        const user = await UserModel.findOne({ authId: author_id }).select("_id");
        if (!user) {
            return res.status(200).json({ author_id: null, userId: null, message: "User not found" });
        }
        const author = await AuthorModel.findOne({ user_id: user._id }).select("_id")
        res.status(200).json({ userId: user._id, author_id: author ? author._id : null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteAccount = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await UserModel.findByIdAndDelete(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const author = await AuthorModel.findOne({ user_id });
    if (author) {
      // Delete ALL blogs by this author
      await BlogModel.deleteMany({ author_id: author._id });
      // Delete the author entry
      await AuthorModel.findByIdAndDelete(author._id);
    }

    res.status(200).json({
      message: "Account and associated data deleted successfully",
      user,
    });

  } catch (error) {
    res
      .status(500)
      .json({ message: `Error while deleting account: ${error.message}` });
  }
};
const checkIfUserIsEditorToSomeBlogs=async()=>{
    try {
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}



module.exports = {
    saveUser,
    getUserByAuthId,
    searchUsers,
    getUserId,
    deleteAccount
};
