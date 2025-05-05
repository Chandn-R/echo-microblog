import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";

export interface IUser extends mongoose.Document {
    name: string;
    username: string;
    email: string;
    password: string;
    followers: mongoose.Schema.Types.ObjectId[];
    following: mongoose.Schema.Types.ObjectId[];
    profilePicture: string;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
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
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 32,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    profilePicture: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
}, { timestamps: true });

userSchema.pre("save", async function (this: IUser, next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);

    next();
});

userSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function (this: IUser): string {
    return Jwt.sign(
        {
            _id: this._id,
            name: this.name,
            username: this.username,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRY)
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return Jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRY)
        }
    )
}

export const User = mongoose.model<IUser>("User", userSchema);

