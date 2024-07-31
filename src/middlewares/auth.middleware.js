import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _ ,next)=>{
    try {
        req.cookies?.accesstoken|| req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Not authorized")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid Acces Token")
    }
})