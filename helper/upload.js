const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload/")
    },
    filename: (req, file, cb) => {
        console.log(file)
        const uniqueFileSuffix = Date.now() + '-' + Math.random(Math.random * 99999)
        cb(null, uniqueFileSuffix + path.extname(file.originalname))
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }//10MB
})
module.exports=upload