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

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    console.log(`Full Name: ${fullname}, Username: ${username}, Email: ${email}, Password: ${password}`);
    console.log("Request Body: ", req.body);
    console.log('Request file:', req.files); // This should be req.files
    console.log('Avtar file:', req.files?.avtar); // This should be req.files.avtar
    console.log('Coverimage file:', req.files?.coverimage); // This should be req.files.coverimage

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (existingUser) {
        throw new ApiError(409, "Email or Username already exists");
    }

    const avtarLocalPath = req.files?.avtar && req.files.avtar[0]?.path;
    const coverLocalPath = req.files?.coverimage && req.files.coverimage[0]?.path; //code commented below does the same thing as this code
    // let coverLocalPath
    // if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
    //     coverLocalPath = req.files.coverimage[0].path;
    // }

    if (!avtarLocalPath) {
        throw new ApiError(400, "No avtar image provided");
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath);
    const coverimage = await uploadOnCloudinary(coverLocalPath);
    if (!avtar) {
        throw new ApiError(400, "Failed to upload avtar image");
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avtar: avtar.url,
        coverimage: coverimage?.url || "",
    });

    const createdUserFinal = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUserFinal) {
        throw new ApiError(500, "Something went wrong while creating the user");
    }

    return res.status(201).json(new ApiResponse(200, createdUserFinal, "User created successfully"));
});


export  {registerUser}