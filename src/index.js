import connect from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

connect()








// // Connect to MongoDB
//import express from "express";
// const app = express();
// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MOGODB_URL}/${DB_NAME}`);
//         app.on('error',(error)=>{
//             console.log("Error connecting to MongoDB: ", error);
//             throw error;
//         })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     }catch(error){
//         console.error("Failed to connect to MongoDB", error);
//         throw error;
//     }
// })()