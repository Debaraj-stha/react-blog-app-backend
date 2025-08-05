const cloudinary = require('cloudinary').v2;
require('dotenv').config()
const Router = require('express').Router()
const clounaryDetails = {
    cloud_name: process.env.CLOUNIARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}
cloudinary.config(clounaryDetails);
Router.delete('/api/image/:public_id', async (req, res) => {
    const { public_id } = req.params;
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = Router