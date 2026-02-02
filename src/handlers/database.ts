//-Path: "Choco-Developer-Bot/src/handlers/database.ts"
import mongoose from "mongoose";

/**
 * ฟังก์ชันสำหรับเชื่อมต่อฐานข้อมูล MongoDB
 */
export const connectDatabase = async () => {
    const mongodbUri = process.env.MONGODB_URI;

    if (!mongodbUri)
        return console.error("🥭 MONGODB_URI is not defined in .env");

    try {
        await mongoose.connect(mongodbUri);
        console.log("🥭 Connected to MongoDB");
    } catch (error) {
        console.error("🥭 MongoDB connection error:", error);
    }
};
