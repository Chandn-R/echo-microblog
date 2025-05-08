import { Request, Response } from "express";
import { User } from '../models/user.model';
import asyncHandler from '../utilities/asyncHandler.js';
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import jwt from "jsonwebtoken";

export const signup = asyncHandler(async (req: Request, res: Response) => {

    const { name, username, email, password } = req.body

    if (!name || !username || !email || !password) {
        throw new ApiError(404, "Please fill all the fields");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] })
    if (user) {
        throw new ApiError(400, "User already exists");
    }

    const newUser = await User.create({
        name,
        username,
        email,
        password,
    })
    if (!newUser) {
        throw new ApiError(400, "User not created");
    }

    res.status(201).json(
        new ApiResponses(201, {
            _id: newUser._id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email
        }, "User created")
    )

});

export const login = asyncHandler(async (req: Request, res: Response) => {

    const { username, email, password } = req.body

    if ((!username && !email) || !password) {
        throw new ApiError(404, "Please fill all the fields");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] })

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const isMatch = await user?.comparePassword(password);

    if (!isMatch) {
        throw new ApiError(404, "Invalid Credentials")
    }

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
    });

    res.status(200).json(
        new ApiResponses(200, {
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            accessToken: accessToken
        }, "Login successful")

    );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {

    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        path: "/api/auth/refresh",
    });

    res.status(200).json(
        new ApiResponses(200, null, "Logout successful")
    );
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {

    const token = req.cookies?.refreshToken;

    if (!token) {
        throw new ApiError(401, "Refresh token missing");
    }
    let verifiedToken: any;
    try {
        verifiedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
    } catch (err) {
        throw new ApiError(403, "Invalid or expired refresh token");
    }

    const user = await User.findById(verifiedToken._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const newAccessToken = user.generateAccessToken();

    res.status(200).json(
        new ApiResponses(200, {
            accessToken: newAccessToken
        }, "New access token generated")
    );
});