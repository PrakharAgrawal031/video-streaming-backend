import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
//steps for registering a new user
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

const generateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log(
    `Full Name: ${fullname}, Username: ${username}, Email: ${email}, Password: ${password}`
  );
  console.log("Request Body: ", req.body);
  console.log("Request file:", req.files); // This should be req.files
  console.log("Avtar file:", req.files?.avtar); // This should be req.files.avtar
  console.log("Coverimage file:", req.files?.coverimage); // This should be req.files.coverimage

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
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

  const createdUserFinal = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUserFinal) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUserFinal, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  //console.log(req);
  if (!(username || email)) {
    throw new ApiError(400, "Username and Email are required");
  }
  //check if user exists
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) throw new ApiError(400, "User does not exists");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Password incorrect");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log("User: " + user.username + " is authenticated");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log(`User: ${req.user.username} logged out successfully`);
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        {},
        `User: ${req.user.username} logged out successfully`
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshToken(user._id, options);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "New access token generated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Failed to generate access token"
    );
  }
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Password incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  console.log(`User: ${user.username} password changed successfully`);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateAvtar = asyncHandler(async (req, res) => {
  const avtarLocalPath = req.file?.path;
  if (!avtarLocalPath) {
    throw new ApiError(400, "No avtar image provided");
  }
  const avtar = await uploadOnCloudinary(avtarLocalPath);

  if (!avtar.url) {
    throw new ApiError(400, "Failed to upload avtar image");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avtar: avtar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avtar updated successfully"));
});

const updateCoverimage = asyncHandler(async (req, res) => {
  const coverimageLocalPath = req.file?.path;
  if (!coverimageLocalPath) {
    throw new ApiError(400, "No avtar image provided");
  }
  const coverimage = await uploadOnCloudinary(coverimageLocalPath);

  if (!coverimage.url) {
    throw new ApiError(400, "Failed to upload cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverimage: coverimage.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  console.log(req.params)
  console.log(req)
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },

        channelsSubscribedToCount: {
          $size: "$subscribeTo",
        },

        isSubscribed:{
          $cond:{
            if:{$in: [req.user?._id, "$subscribers.subscriber"]},
            then:true,
            else:false,
          }
        }
      },
    },
    {
      $project:{
        fullname:1,
        username:1,
        avtar:1,
        coverimage:1,
        isSubscribed:1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404, "channel does not exist")
  }
  console.log(channel);
  return res.status(200)
  .json(
    new ApiResponse(
      200,
      channel[0],
      "User profile fetched successfully"
    )
  )
});

export {
  registerUser,
  logoutUser,
  loginUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvtar,
  updateCoverimage,
  getUserProfile,
};
