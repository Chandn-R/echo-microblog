import express from "express";
import { fetchFriends } from "../controllers/chat.controller";
import { protectRoute } from "../middlewares/protectRoutes";

const router = express.Router();

router.get("/", protectRoute, fetchFriends);

export default router;