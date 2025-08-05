const Router = require("express").Router()
const path=require("path")
const upload = require("../helper/upload")
Router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"public"))
})

Router.post("/upload/single", upload.single("file"), (req, res) => {
    console.log(req.file); // Uploaded file metadata
    res.json({ message: 'File uploaded successfully!', file: req.file });

})
Router.post("/upload/multiple", upload.array("file"), (req, res) => {
    console.log(req.file); // Uploaded file metadata
    res.json({ message: 'File uploaded successfully!', file: req.files });

})



module.exports = Router