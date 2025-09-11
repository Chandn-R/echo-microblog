import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { io } from "../app.js";

// @route   POST /api/message
export const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        throw new ApiError(400, "Content and chatId are required");
    }

    const newMessageData = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    let message = await Message.create(newMessageData);

    message = await message.populate("sender", "name profilePicture");
    message = await message.populate("chat");
    message = await Message.populate(message, {
        path: "chat.users",
        select: "name profilePicture email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    (message.chat as any).users.forEach((user: any) => {
        if (user._id.toString() === req.user._id.toString()) return;

        io.to(user._id.toString()).emit("receiveMessage", message);
    });

    res.status(201).json(new ApiResponses(201, message, "Message sent successfully"));
});

// @route   GET /api/message/:chatId
export const fetchMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
        .populate("sender", "name profilePicture email")
        .populate("chat");

    res.status(200).json(new ApiResponses(200, messages, "Messages fetched successfully"));
});