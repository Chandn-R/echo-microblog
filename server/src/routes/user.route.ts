import express from "express";
import { protectRoute } from "../middlewares/protectRoutes.js";
import { createPost, followUser, unfollowUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/follow/:id", protectRoute, followUser);
router.post("/unfollow/:id", protectRoute, unfollowUser);
router.post("/post", protectRoute, upload.fields([
    {
        name: "file",
        maxCount: 3
    }
]), createPost);

export default router;