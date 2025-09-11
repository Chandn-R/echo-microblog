import { Request, Response } from "express";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import { Post } from "../models/post.model.js";
import mongoose, { Types } from "mongoose";
import cloudinaryUpload from "../utilities/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import logger from "../utilities/logger.js";

type blockType = {
  type: "text" | "image";
  value: string;
  public_id?: string;
};

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user._id;
  const files = req.files as Express.Multer.File[];
  const blocks: blockType[] = [];

  if (Array.isArray(req.body.content)) {
    for (let i = 0; i < req.body.content.length; i++) {
      const block = req.body.content[i];
      if (block.type === "image") {
        const file = files.find((f) => f.fieldname === `content[${i}][value]`);
        if (!file) throw new ApiError(400, `Image missing for block ${i}`);

        const uploadedImage = await cloudinaryUpload(
          file.buffer,
          "post_images"
        );
        blocks.push({
          type: "image",
          value: uploadedImage.secure_url,
          public_id: uploadedImage.public_id,
        });
      } else if (block.type === "text") {
        if (!block.value || typeof block.value !== "string") {
          throw new ApiError(400, "Text block requires valid string");
        }
        blocks.push({ type: "text", value: block.value });
      } else {
        throw new ApiError(400, "Invalid block type");
      }
    }
  } else {
    const indexes = Array.from(
      new Set(
        Object.keys(req.body)
          .map((key) => key.match(/content\[(\d+)\]/)?.[1])
          .filter(Boolean)
      )
    );

    for (const index of indexes) {
      const type = req.body[`content[${index}][type]`];
      const value = req.body[`content[${index}][value]`];

      if (type === "image") {
        const file = files.find(
          (f) => f.fieldname === `content[${index}][value]`
        );
        if (!file) throw new ApiError(400, `Image missing for block ${index}`);

        const uploadedImage = await cloudinaryUpload(
          file.buffer,
          "post_images"
        );
        blocks.push({
          type: "image",
          value: uploadedImage.secure_url,
          public_id: uploadedImage.public_id,
        });
      } else if (type === "text") {
        if (!value || typeof value !== "string") {
          throw new ApiError(400, "Text block requires valid string");
        }
        blocks.push({ type: "text", value });
      } else {
        throw new ApiError(400, "Invalid block type");
      }
    }
  }

  const post = await Post.create({
    user: currentUserId,
    content: blocks,
  });

  res
    .status(201)
    .json(new ApiResponses(201, post, "Post created successfully"));
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

  res
    .status(200)
    .json(new ApiResponses(200, post, "Post retrieved successfully"));
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const user = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const imageBlocks = post.content.filter(
    (block: blockType) => block.type === "image"
  );
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
  logger.info(`Post ${postId} deleted by ${user._id}`);
  res.status(200).json(new ApiResponses(200, "Post deleted successfully"));
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
    new ApiResponses(
      200,
      {
        likesCount: post.likes.length,
        liked: !alreadyLiked,
      },
      alreadyLiked ? "Post unliked" : "Post liked"
    )
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
  };

  post.comments.push(newComment);
  await post.save();

  res
    .status(200)
    .json(new ApiResponses(200, post.comments, "Comment added successfully"));
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(postId) ||
    !mongoose.Types.ObjectId.isValid(commentId)
  ) {
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
  const { lastPostId, limit = 10 } = req.query;
  const userId = req.user?._id;

  const limitNum = Number(limit);

  if (isNaN(limitNum) || limitNum < 1) {
    throw new ApiError(400, "Invalid limit value");
  }

  const matchStage: any = {};

  if (lastPostId && typeof lastPostId === "string") {
    matchStage._id = { $lt: new Types.ObjectId(lastPostId) };
  }

  const posts = await Post.aggregate([
    { $sort: { _id: -1 } },
    { $match: matchStage },
    { $limit: limitNum },

    {
      $addFields: {
        likeCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
        // Add isLiked if user is authenticated
        isLiked: userId ? { $in: [userId, "$likes"] } : false,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              username: 1,
              profilePicture: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$user" }, // Convert user array to object

    {
      $lookup: {
        from: "users",
        localField: "comments.user",
        foreignField: "_id",
        as: "commentUsers",
        pipeline: [
          {
            $project: {
              username: 1,
              profilePicture: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              $mergeObjects: [
                "$$comment",
                {
                  user: {
                    $arrayElemAt: [
                      "$commentUsers",
                      {
                        $indexOfArray: ["$commentUsers._id", "$$comment.user"],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },

    { $project: { __v: 0, commentUsers: 0 } },
  ]);

  const totalPosts = await Post.countDocuments();


  res.status(200).json(
    new ApiResponses(
      200,
      {
        posts,
        totalPosts,
        hasNextPage: posts.length === limitNum,
        nextCursor: posts.length > 0 ? posts[posts.length - 1]._id : null,
      },
      "Posts retrieved successfully"
    )
  );
});
