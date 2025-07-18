import express from "express";
import { protectRoute } from "../middlewares/protectRoutes.js";
import {
    followUser,
    getAllUsers,
    getUser,
    unfollowUser,
    updateProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.patch("/:id/follow", protectRoute, followUser);
router.patch("/:id/unfollow", protectRoute, unfollowUser);
router.patch(
    "/profile",
    protectRoute,
    upload.single("profilePicture"),
    updateProfile
);
router.get("/search", protectRoute, getAllUsers);
router.get("/:id", protectRoute, getUser);

export default router;
