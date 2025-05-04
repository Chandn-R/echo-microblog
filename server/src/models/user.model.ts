import mongoose from "mongoose";
import bcrypt from "bcryptjs"

export interface IUser extends mongoose.Document {
    name: string;
    username: string;
    email: string;
    password: string;
    followers: [mongoose.Schema.Types.ObjectId];
    following: [mongoose.Schema.Types.ObjectId];
    profilePicture: string;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
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

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);

    next();
});

userSchema.methods.comparePasword = async function (password:string) {
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model<IUser>("User", userSchema);

