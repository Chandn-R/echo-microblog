import mongoose, { Schema, Document } from "mongoose";
import { IUserData } from "./user.model";
import { IMessageData } from "./message.model";

export interface IChatData extends Document {
    chatName: string;
    isGroupChat: boolean;
    users: mongoose.Types.ObjectId[] | IUserData[];
    latestMessage?: mongoose.Types.ObjectId | IMessageData;
    groupAdmin?: mongoose.Types.ObjectId | IUserData;
}

const chatSchema = new Schema<IChatData>(
    {
        chatName: { type: String, trim: true },
        isGroupChat: { type: Boolean, default: false },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                index: true,
            },
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Chat = mongoose.model<IChatData>("Chat", chatSchema);