import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongo db connected");
  } catch (err) {
    console.log(`failed to coonnect mongodb ${err}`);
    process.exit(1);
  }
};
