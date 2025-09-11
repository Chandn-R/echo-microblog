import { Request, Response } from "express";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";

export const accessOrCreateChat = asyncHandler(async (req: Request, res: Response) => {
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


export const getSidebarData = asyncHandler(async (req: Request, res: Response) => {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "_id name username profilePicture")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });

    chats = await Chat.populate(chats, {
        path: "latestMessage.sender",
        select: "name",
    });

    const userIdsInChats = new Set();
    chats.forEach(chat => {
        chat.users.forEach(user => {
            if (user._id.toString() !== req.user._id.toString()) {
                userIdsInChats.add(user._id.toString());
            }
        });
    });

    const friends = await User.find({ _id: { $in: req.user.following } })
        .where('followers').equals(req.user._id)
        .select("_id name username profilePicture");

    const friendsToChatWith = friends.filter(friend => !userIdsInChats.has(friend._id.toString()));

    res.status(200).json(
        new ApiResponses(200, { chats, friendsToChatWith }, "Sidebar data fetched successfully")
    );
});