const { ActivityModel } = require("../models");


const getAuthorActivities = async (req, res) => {
  try {
    const { author_id } = req.params;
    const limit=parseInt(req.query.limit)||5
    if (!author_id)
      return res.status(400).json({ message: 'Author ID is required' });
    const activities = await ActivityModel.find({author_id})
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAuthorActivities
};
