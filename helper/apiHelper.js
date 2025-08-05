
const fs= require('fs');
const path = require('path');
/**
 * 
 * @param {*} ModelName  -name of model whose total documenet length to find
 * @returns 
 */
const totalDocumentLength = async (ModelName) => {
    try {
        const total = await ModelName.countDocuments();
        return total;
    } catch (error) {
        throw error;
    }
};

/**
 * 
 * @param {*} ModelName - Mongoose model class
 * @param {Array} filterFields - Array of [field, value] pairs
 * @param {Array} arrayFields - Fields that are arrays (e.g. tags, categories)
 */
const getSimilarDocument = async ({ModelName, filterFields, limit=6, arrayFields = []}) => {
    try {
        const orFilters = filterFields.map(([field, value]) => {
            if (arrayFields.includes(field)) {
                // Use $in with regex for array fields
                return {
                    [field]: { $in: [new RegExp(value, "i")] }
                };
            } else {
                return {
                    [field]: { $regex: new RegExp(value, "i") }
                };
            }
        });

        const res = await ModelName.find({ $or: orFilters }).limit(limit);
        return res;
    } catch (error) {
        throw error;
    }
};
const deleteImage = async (imgPath) => {
    try {
        if (profile && profile.image) {
            const imagePath = path.join(__dirname, '..', 'upload', imgPath);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
    } catch (error) {
        throw error;
    }
};


module.exports={
    totalDocumentLength,
    getSimilarDocument,
    deleteImage
}