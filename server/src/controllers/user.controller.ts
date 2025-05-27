import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import cloudinaryUpload from "../utilities/cloudinary.js";


type blockType = {
    type: "text" | "image";
    value: string;
}

export const followUser = asyncHandler(async (req: Request, res: Response) => {
    const userToFollowId = req.params.id;
    const currentUserId = req.user._id; // protectRoute middleware attaches user to req

    if (userToFollowId === currentUserId.toString()) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const userToFollow = await User.findById(userToFollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
        throw new ApiError(404, "User not found");
    }

    if (currentUser.following.some((id) => id.toString() === userToFollowId)) {
        throw new ApiError(400, "You are already following this user");
    }

    userToFollow.followers.push(currentUserId);

    currentUser.following.push(new mongoose.Types.ObjectId(userToFollowId));

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json(
        new ApiResponses(200, null, `Following ${userToFollow.username}`)
    );
});

export const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.user._id;

    if (userToUnfollowId === currentUserId.toString()) {
        throw new ApiError(400, "You cannot unfollow yourself");
    }

    const userToUnfollow = await User.findById(userToUnfollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
        throw new ApiError(404, "User not found");
    }

    const isFollowing = currentUser.following.some(id => id.toString() === userToUnfollowId);
    if (!isFollowing) {
        throw new ApiError(400, "You are not following this user");
    }

    currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userToUnfollowId
    );

    userToUnfollow.followers = userToUnfollow.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json(
        new ApiResponses(200, null, `Unfollowed ${userToUnfollow.username}`)
    );
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const { content } = JSON.parse(req.body);
    const currentUserId = req.user._id;

    if (!Array.isArray(content) || content.length === 0) {
        throw new ApiError(400, "Content is required");
    }

    const blocks = content.map((block: blockType) => {
        if (block.type === 'image') {
            const file = (req.files as { [fieldname: string]: Express.Multer.File[] })?.[block.value]?.[0];
            if (!file) throw new ApiError(400, `Image ${block.value} not uploaded`);
            return { type: 'image', value: `/uploads/${file.filename}` };
        } else if (block.type === 'text') {
            return { type: 'text', value: block.value };
        } else {
            throw new ApiError(400, "Invalid block type");
        }
    });

    const post = await Post.create({
        user: currentUserId,
        content: blocks
    });

    res.status(201).json(
        new ApiResponses(201, post, "Post created successfully")
    );
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {

    const currentUserId = req.user._id;
    const { name, username, bio, email } = req.body;
    const profilePicture = req.file as Express.Multer.File;

    const user = await User.findById(currentUserId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser && (existingUser._id as mongoose.Types.ObjectId).toString() !== currentUserId.toString()) {
            throw new ApiError(400, "Username is already taken");
        }
    }

    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail && (existingEmail._id as mongoose.Types.ObjectId).toString() !== currentUserId.toString()) {
            throw new ApiError(400, "Email is already in use");
        }
    }

    if (profilePicture) {
        try {
            const uploadedImageUrl = await cloudinaryUpload(profilePicture.buffer);
            user.profilePicture = uploadedImageUrl;
        } catch (error) {
            throw new ApiError(500, "Failed to upload profile picture");
        }
    }

    if (name) user.name = name;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (email) user.email = email;

    await user.save();

    res.status(200).json(
        new ApiResponses(200, user, "Profile updated successfully")
    );
});
