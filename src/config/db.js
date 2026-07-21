import mongoose from "mongoose";
import { config } from "./config.js";

const connectDB = async ()=>{
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log("Connected successfully");
        
    } catch (error) {
        console.log("failed to connect",error);
    }
}

export default connectDB