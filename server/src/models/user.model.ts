import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

export interface IUserData {
    _id: mongoose.Types.ObjectId;
    name: string;
    username: string;
    email: string;
    password: string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    profilePicture: {
        secure_url: string;
        public_id: string;
    };
    bio: string;
}

export interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

export type UserModel = mongoose.Model<IUserData, {}, IUserMethods>;

const userSchema = new Schema<IUserData, UserModel, IUserMethods>(
    {
        name: { type: String, required: true },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 4,
            maxlength: 32,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: { type: String, required: true, minlength: 6 },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        profilePicture: {
            secure_url: { type: String, default: "" },
            public_id: { type: String, default: "" },
        },
        bio: { type: String, default: "" },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (
    password: string
): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

    if (!accessTokenSecret || !accessTokenExpiry) {
        throw new Error(
            "Access token secret or expiry is not defined in environment variables."
        );
    }

    return jwt.sign({ _id: this._id }, accessTokenSecret, {
        expiresIn: Number(accessTokenExpiry),
    });
};

userSchema.methods.generateRefreshToken = function (): string {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

    if (!refreshTokenSecret || !refreshTokenExpiry) {
        throw new Error(
            "Refresh token secret or expiry is not defined in environment variables."
        );
    }

    return jwt.sign({ _id: this._id }, refreshTokenSecret, {
        expiresIn: Number(refreshTokenExpiry),
    });
};

export const User = mongoose.model<IUserData, UserModel>("User", userSchema);
