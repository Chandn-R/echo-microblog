import mongoose from "mongoose";
import logger from "../utilities/logger";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info(`MongoDB Connected ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    logger.error("Error connecting to MongoDB:", { error });
    process.exit(1);
  }
};

export default connectDB;
