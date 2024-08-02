import connect from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js"
dotenv.config({
    path: "./.env"
});
// console.log(typeof app)
// if (typeof app.listen === "function") {
//     console.log("app is an instance of Express");
//   } else {
//     console.log("app is not an instance of Express");
//   }
connect()
.then(()=>{
    try {
        
        app.on("error",(error)=>{
            console.log("Error starting server: ", error);
            throw(error);
        })
        
        app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);

        app.get("/", (req, res)=>{
            res.send("Server is running!")
        })
    });
    } catch(error){
        console.log("Server error: ", error);
        process.exit(1);
     }
})
.catch((error)=>{
    console.log("MongoDB error: ",error)
})








// // Connect to MongoDB
// import express from "express";
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