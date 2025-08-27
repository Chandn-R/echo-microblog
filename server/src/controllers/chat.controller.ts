import { Request, Response } from "express";
import asyncHandler from "../utilities/asyncHandler.js";
import ApiError from "../utilities/apiErrors.js";
import ApiResponses from "../utilities/apiResponses.js";
import { User } from "../models/user.model.js";


export const fetchFriends = asyncHandler(async (req: Request, res: Response) => {
    const curUser = req.user._id;

    const friends = await User.aggregate([

        { $match: { _id: curUser } },

        // 2. Find the intersection (common IDs) between the 'following' and 'followers' arrays
        {
            $project: {
                mutuals: { $setIntersection: ["$following", "$followers"] },
                _id: 0
            }
        },

        // 3. Unwind the array of mutual IDs
        { $unwind: "$mutuals" },

        // 4. Look up the full user documents for those IDs
        {
            $lookup: {
                from: "user",
                localField: "mutuals",
                foreignField: "_id",
                as: "mutual_user_details"
            }
        },

        // 5. Replace the root to show just the user document
        { $replaceRoot: { newRoot: { $arrayElemAt: ["$mutual_user_details", 0] } } }
    ]);
});