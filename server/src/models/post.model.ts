import mongoose from "mongoose";

export interface IPost extends Document {
    user: mongoose.Types.ObjectId;
    content: {
        type: "text" | "image";
        value: string;
        public_id?: string;
    }[];
    likes: mongoose.Types.ObjectId[];
    comments: {
        _id?: mongoose.Types.ObjectId;
        user: mongoose.Types.ObjectId;
        content: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
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
            public_id:{
                type: String,
            }
        },
    ],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],

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
    }],
}, { timestamps: true });

export const Post = mongoose.model<IPost>("Post", postSchema); 
