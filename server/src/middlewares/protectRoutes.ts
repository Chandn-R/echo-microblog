import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import ApiError from "../utilities/apiErrors.js";
import asyncHandler from "../utilities/asyncHandler";

export const protectRoute = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Not authorized, no token");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Not authorized, user not found");
        }

        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401, "Not authorized, token failed");
    }
});
