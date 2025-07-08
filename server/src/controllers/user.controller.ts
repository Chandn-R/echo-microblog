import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import { User } from "../models/user.model.js";
import cloudinaryUpload from "../utilities/cloudinary.js";

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

  res
    .status(200)
    .json(new ApiResponses(200, null, `Following ${userToFollow.username}`));
});

export const unfollowUser = asyncHandler(
  async (req: Request, res: Response) => {
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

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === userToUnfollowId
    );
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

    res
      .status(200)
      .json(
        new ApiResponses(200, null, `Unfollowed ${userToUnfollow.username}`)
      );
  }
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.user._id;
    const { name, username, bio, email } = req.body;
    const profilePicture = req.file as Express.Multer.File;

    const user = await User.findById(currentUserId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (
        existingUser &&
        (existingUser._id as mongoose.Types.ObjectId).toString() !==
          currentUserId.toString()
      ) {
        throw new ApiError(400, "Username is already taken");
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (
        existingEmail &&
        (existingEmail._id as mongoose.Types.ObjectId).toString() !==
          currentUserId.toString()
      ) {
        throw new ApiError(400, "Email is already in use");
      }
    }

    if (profilePicture) {
      try {
        console.log(profilePicture.buffer);

        const uploadedImageUrl = await cloudinaryUpload(
          profilePicture.buffer,
          "profile_pictures"
        );
        user.profilePicture = uploadedImageUrl;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new ApiError(500, "Failed to upload profile picture");
      }
    }

    if (name) user.name = name;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (email) user.email = email;

    await user.save();

    res
      .status(200)
      .json(new ApiResponses(200, user, "Profile updated successfully"));
  }
);

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const currentUserId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const userData = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },

    {
      $project: {
        password: 0,
        __v: 0,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "followers",
        foreignField: "_id",
        as: "followers",
        pipeline: [{ $project: { username: 1, profilePicture: 1 } }],
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "following",
        foreignField: "_id",
        as: "following",
        pipeline: [{ $project: { username: 1, profilePicture: 1 } }],
      },
    },

    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "user",
        as: "posts",
      },
    },
  ]);
  const user = userData[0];
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isFollowing = user.followers.some(
    (follower: any) => follower._id.toString() === currentUserId.toString()
  );

  res
    .status(200)
    .json(
      new ApiResponses(
        200,
        { ...user, isFollowing },
        "User retrieved successfully"
      )
    );
});
