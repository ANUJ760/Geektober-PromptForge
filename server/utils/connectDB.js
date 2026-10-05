import mongoose from "mongoose";

const connectDB = async (retries = 5, delay = 2000) => {
    if (mongoose.connections[0]?.readyState) {
        console.log("DB already connected.");
        return;
    }

    const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/promptforge";

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(dbUrl, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log("DB Connected");
            return;
        } catch (err) {
            console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
            if (attempt === retries) {
                console.error("All MongoDB connection attempts exhausted.");
                throw err;
            }
            console.log(`Retrying MongoDB connection in ${delay / 1000}s...`);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
};

export default connectDB;