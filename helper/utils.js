const { AuthorModel } = require("../models");

/**
 * Fetches author details by author_id with optional field selection
 * @param {string} author_id - The ID of the author
 * @param {string|string[]} fields - Fields to select (e.g., "name profileUrl")
 * @returns {Promise<Object|null>}
 */
const getAuthorDetails = async (author_id, fields) => {
  try {
    const query = AuthorModel.findOne({ author_id });

    if (fields) {
      query.select(fields);
    }
    const result = await query.lean(); // lean() for plain JS object (optional)
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports={
    getAuthorDetails
}