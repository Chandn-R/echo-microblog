import { Request, Response } from "express";
import asyncHandler from "../utilities/asyncHandler";
import ApiError from "../utilities/apiErrors";
import { User } from "../models/user.model";
import ApiResponses from "../utilities/apiResponses";
import mongoose from "mongoose";

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


