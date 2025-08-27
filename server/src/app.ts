import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestLogger, errorLogger } from "./middlewares/logging.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.use(
    cors({
        origin: "http://localhost:5173", // Your frontend URL
        // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        // allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// import routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";

app.use(requestLogger);
// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use(errorLogger);

export default app;
