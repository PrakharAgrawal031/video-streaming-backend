import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MOGODB_URL}/${DB_NAME}`);
        // console.log(connectionInstance)
        console.log(`Connected to MongoDB. DB_HOST: ${connectionInstance.connection.host}`);
    } catch(error){
        console.log("MONGODB connection failure: ", error)
        process.exit(1);
    }
}

export default connect
