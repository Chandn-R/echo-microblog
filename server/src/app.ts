import express from "express";
import cors from "cors"; 
import cookieParser from "cookie-parser";
import multer from "multer"


const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(multer().any()); // middleware to be done in seperate file


// import routes 
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";



// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
 



export default app;
