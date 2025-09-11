import mongoose, { Schema, Document } from "mongoose";
import { IUserData } from "./user.model";
import { IChatData } from "./chat.model";

export interface IMessageData extends Document {
    sender: mongoose.Types.ObjectId | IUserData;
    content: string;
    chat: mongoose.Types.ObjectId | IChatData;
}

const messageSchema = new Schema<IMessageData>(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: { type: String, trim: true, required: true },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

export const Message = mongoose.model<IMessageData>("Message", messageSchema);