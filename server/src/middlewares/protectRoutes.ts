import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import ApiError from "../utilities/apiErrors.js";
import asyncHandler from "../utilities/asyncHandler";

interface DecodedToken extends JwtPayload {
    _id: string;
}

export const protectRoute = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        if (!accessTokenSecret) {
            console.error("ACCESS_TOKEN_SECRET is not defined in .env file");
            throw new ApiError(500, "Internal server error: Missing server configuration");
        }

        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        try {
            const decoded = jwt.verify(token, accessTokenSecret) as DecodedToken;

            const user = await User.findById(decoded._id).select("-password");

            if (!user) {
                throw new ApiError(401, "Invalid access token: User not found");
            }
            console.log(user);
            
            req.user = user;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new ApiError(401, "Session expired. Please log in again.");
            }
            throw new ApiError(401, "Invalid access token.");
        }
    }
);