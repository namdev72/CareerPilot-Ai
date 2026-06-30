import mongoose from "mongoose";

async function connectToDB() {
    
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connect to database");
    } catch (error) {
        console.log(`mongodb connection error ${error.message}`);
        
    } 
}

export default connectToDB