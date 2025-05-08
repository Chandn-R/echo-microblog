import express from "express";
import { protectRoute } from "../middlewares/protectRoutes.js";
import { followUser, unfollowUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/follow/:id", protectRoute, followUser);
router.post("/unfollow/:id", protectRoute, unfollowUser);


export default router;