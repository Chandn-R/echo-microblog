import express from "express";
import { protectRoute } from "../middlewares/protectRoutes";
import {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  addComment,
  deleteComment,
  getPosts,
} from "../controllers/post.controller";
import { upload } from "../middlewares/multer.js";
import { fetchFriends } from "../controllers/chat.controller";

const router = express.Router();

router.post("/", protectRoute, upload.any(), createPost);
router.get("/:id", protectRoute, getPost);
router.delete("/:id", protectRoute, deletePost);
router.patch("/:id/like", protectRoute, likeUnlikePost);
router.patch("/:id/comment", protectRoute, addComment);
router.delete("/:postId/comment/:commentId", protectRoute, deleteComment);
router.get("/", getPosts);

export default router;
