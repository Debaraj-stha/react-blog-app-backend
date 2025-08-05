const mongoose=require("mongoose")
const connString=process.env.MONGODB_URL


const conn=mongoose.connect(connString).then((_)=>{
    console.log("successfully connected to database")
}).catch((e)=>{
    console.log("error connetcing to database",e)
})
module.exports =conn