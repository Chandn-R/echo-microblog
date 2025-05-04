import mongoose from "mongoose";

export interface IPost extends mongoose.Document {
    user: mongoose.Schema.Types.ObjectId;
    content: string;
    image: string;
    likes: number;
    comments: [{
        user: mongoose.Schema.Types.ObjectId;
        content: string;
        userProfilePicture: string;
        username: string;
    }];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        trim: true,
        maxlength: 300,
    },
    image: {
        type: String,
        default: "",
    },
    likes: {
        type: Number,
        default: 0,
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
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
        }
    }],
}, { timestamps: true });

export const Post = mongoose.model<IPost>("Post", postSchema); 
