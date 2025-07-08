import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const TOTAL_USERS = 1000;
const PASSWORD = "password123";

async function createUsers() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGO_URI environment variable is not defined.");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingCount = await User.countDocuments({
      email: /testuser\d+@example\.com/,
    });
    if (existingCount >= TOTAL_USERS) {
      console.log(`Test users already exist (${existingCount} found)`);
      return;
    }

    for (let i = 1; i <= TOTAL_USERS; i++) {
      const newUser = new User({
        username: `testuser${i}`,
        email: `testuser${i}@example.com`,
        password: PASSWORD,
        name: `Test User ${i}`,
      });

      await newUser.save();
    }

    console.log(`${TOTAL_USERS} test users created successfully.`);
    process.exit(0);
  } catch (err) {
    console.error("Error creating users:", err);
    process.exit(1);
  }
}

createUsers();
