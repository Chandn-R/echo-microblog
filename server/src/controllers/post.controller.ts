import { Request, Response } from "express";
import asyncHandler from '../utilities/asyncHandler.js';
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import { Post } from "../models/post.model.js";
import mongoose from "mongoose";
import cloudinaryUpload from "../utilities/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

type blockType = {
    type: "text" | "image";
    value: string;
    public_id?: string;
}

export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const { content } = JSON.parse(req.body.body);
    const currentUserId = req.user._id;

    if (!Array.isArray(content) || content.length === 0) {
        throw new ApiError(400, "Content is required");
    }

    const files = req.files as Express.Multer.File[];
    let fileindex = 0;

    const blocks: blockType[] = [];

    for (const block of content) {
        if (block.type === 'image') {
            if (!files || !files[fileindex]) {
                throw new ApiError(400, `Image is not uploaded at index ${fileindex}`);
            }

            try {
                const uploadedImageUrl = await cloudinaryUpload(files[fileindex].buffer, "post_images");
                blocks.push({ type: 'image', value: uploadedImageUrl.secure_url, public_id: uploadedImageUrl.public_id });
                fileindex++;
            } catch (error) {
                console.error("Cloudinary upload failed:", error);
                throw new ApiError(500, "Failed to upload image");
            }
        } else if (block.type === 'text') {
            if (!block.value || typeof block.value !== "string") {
                throw new ApiError(400, "Text block is missing a valid value");
            }
            blocks.push({ type: 'text', value: block.value });
        } else {
            throw new ApiError(400, "Invalid block type");
        }
    }

    console.log("Blocks after processing:", blocks);

    const post = await Post.create({
        user: currentUserId,
        content: blocks
    });

    res.status(201).json(
        new ApiResponses(201, post, "Post created successfully")
    );
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId)
        .populate("user", "username profilePicture")
        .populate("comments.user", "username profilePicture")
        .select("-__v");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    res.status(200).json(
        new ApiResponses(200, post, "Post retrieved successfully")
    );
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const imageBlocks = post.content.filter((block: blockType) => block.type === 'image');
    await Promise.all(
        imageBlocks.map((block: blockType) => {
            if (block.public_id) {
                cloudinary.uploader.destroy(block.public_id).catch((error) => {
                    console.error("Failed to delete image: ${block.public_id}", error);
                });
            }
        })
    );

    await Post.findByIdAndDelete(postId);

    res.status(200).json(
        new ApiResponses(200, "Post deleted successfully")
    );
});

export const likeUnlikePost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
        post.likes.push(userId);
    }

    await post.save();

    res.status(200).json(
        new ApiResponses(200, {
            likesCount: post.likes.length,
            liked: !alreadyLiked
        },
            alreadyLiked ? "Post unliked" : "Post liked",)
    );
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.id;
    const content = req.body.content;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    if (!content || typeof content !== "string") {
        throw new ApiError(400, "Comment content is required");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const user = req.user; // assuming middleware added this

    const newComment = {
        user: user._id,
        content,
        username: user.username,
        userProfilePicture: user.profilePicture.secure_url || "",
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json(new ApiResponses(200, post.comments, "Comment added successfully"));
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const { postId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid Post or Comment ID");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const commentIndex = post.comments.findIndex(
        (comment) => comment._id?.toString() === commentId
    );

    if (commentIndex === -1) {
        throw new ApiError(404, "Comment not found");
    }

    const comment = post.comments[commentIndex];
    const userId = req.user._id.toString();

    if (comment.user.toString() !== userId) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json(new ApiResponses(200, "Comment deleted successfully"));
});

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find()
        .populate("user", "username profilePicture")
        .populate("comments.user", "username profilePicture")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .select("-__v");

    const totalPosts = await Post.countDocuments();

    res.status(200).json(
        new ApiResponses(200, {
            posts,
            totalPosts,
            currentPage: Number(page),
            totalPages: Math.ceil(totalPosts / Number(limit))
        }, "Posts retrieved successfully")
    );

});
