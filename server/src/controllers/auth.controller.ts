import { Request, Response } from "express";
import { User } from '../models/user.model';
import asyncHandler from '../utilities/asyncHandler';

export const signup = asyncHandler( async (req: Request, res: Response) => {

        const { name, username, email, password } = req.body

        if (!name || !username || !email || !password) {
            res.status(400).json({
                message: "Please fill all the fields"
            });
            return;
        }

        const user = await User.findOne({ $or: [{ username }, { email }] })
        if (user){
            res.status(400).json({
                message:"User already exists"
            });
        }

        const newUser = await User.create({
            name,
            username,
            email,
            password,
        })

        res.status(201).json({
            message:"User created succussfully",
            user: {
                id: newUser._id,
                name:newUser.name,
                username:newUser.username,
                email:newUser.email
            }
        })


});


export const login = async (req: Request, res: Response) => {
    res.send("login");
}
export const logout = async (req: Request, res: Response) => {
    res.send("logout");
}