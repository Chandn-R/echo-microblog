import { Request, Response } from "express";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";


export const fetchFriends = asyncHandler(async (req: Request, res: Response) => {
    const curUser = req.user._id;

    const friends = await User.aggregate([

        { $match: { _id: curUser } },

        {
            $project: {
                mutuals: { $setIntersection: ["$following", "$followers"] },
                _id: 0
            }
        },

        { $unwind: "$mutuals" },

        {
            $lookup: {
                from: "user",
                localField: "mutuals",
                foreignField: "_id",
                as: "mutual_user_details"
            }
        },

        { $replaceRoot: { newRoot: { $arrayElemAt: ["$mutual_user_details", 0] } } }
    ]);

    res.status(200).json(
        new ApiResponses(
            200,
            { friends },
            "Fetched friends successfully"
        )
    );
});

// @desc    Access an existing 1-on-1 chat or create a new one
// @route   POST /api/chat
export const accessOrCreateChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "UserId param not sent with request");
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "_id name username profilePicture")
        .populate("latestMessage");

    isChat = await Chat.populate(isChat, {
        path: "latestMessage.sender",
        select: "name profilePicture username",
    });

    if (isChat.length > 0) {
        res.status(200).json(new ApiResponses(200, isChat[0], "Chat accessed"));
    } else {
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
            "users",
            "-password"
        );
        res.status(201).json(new ApiResponses(201, fullChat, "Chat created"));
    }
});

// @route   GET /api/chat
export const fetchChats = asyncHandler(async (req, res) => {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });

    chats = await Chat.populate(chats, {
        path: "latestMessage.sender",
        select: "name profilePicture email",
    });

    res.status(200).json(new ApiResponses(200, chats, "Chats fetched successfully"));
});