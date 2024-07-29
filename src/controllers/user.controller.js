import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
//recieve post request from user which includes data about user
//validate the data
//check if user already exists
//check for images and avtar
//upload them to cloudinary server
//create user object - create entry in database
//remove all sensitive data before sending response such as password and refresh token
//check for user creation
//send response
//redirect user to login page

const registerUser = asyncHandler(async (req,res)=>{
     const {fullname, email, username, password}= req.body
     console.log(`Full Name:${fullname},Username:${username},Email:${email},Password:${password}`);
     if(
        [fullname, email, username, password].some((field)=>{
            field?.trim()===""
        })
    ){
        throw new ApiError(400, "All fields are required")
     }

     const existingUser = User.findOne({
        $or: [{email}, {username}]
    })
    if(existingUser){
        throw new ApiError(409, "Email or Username already exists")
    }

    const avtarLocalPath = req.file?.avtar[0]?.path;
    const coverLocalPath = req.file?.coverimage[0]?.path;

    if(!avtarLocalPath){
        throw new ApiError(400, "No avtar image provided")
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath)
    const coverimage = await uploadOnCloudinary(coverLocalPath)
    if(!avtar){
        throw new ApiError(400, "Failed to upload avtar image")
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avtar: avtar.url,
        coverimage: coverimage?.url||"",
     }, (error, user)=>{
    })

    const createdUserFinal = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUserFinal){
        throw new ApiError(500, "Something went wrong while creating the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUserFinal, "User created successfully")
    )

})

export  {registerUser}