import mongoose from "mongoose";

export interface IPost extends mongoose.Document {
    user: mongoose.Schema.Types.ObjectId;
    content: {
        type: "text" | "image";
        value: string;
    }[];
    likes: number;
    comments: {
        user: mongoose.Schema.Types.ObjectId;
        content: string;
        userProfilePicture: string;
        username: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: [
        {
            type: {
                type: String,
                enum: ['text', 'image'],
                required: true,
            },
            value: {
                type: String,
                required: true,
            },
        },
    ],
    likes: {
        type: Number,
        default: 0,
    },
    comments: [{
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        userProfilePicture: {
            type: String,
            default: "",
        },
        username: {
            type: String,
            default: "",
        }
    }],
}, { timestamps: true });

export const Post = mongoose.model<IPost>("Post", postSchema); 
