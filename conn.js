const mongoose=require("mongoose")
const connString=process.env.MONGODB_URL
let url="mongodb+srv://jeevanstha989:eCcGUVQIe4PgYKZU@cluster0.elgbq5e.mongodb.net/"


const conn=mongoose.connect(url).then((_)=>{
    console.log("successfully connected to database")
}).catch((e)=>{
    console.log("error connetcing to database",e)
})
module.exports =conn