import mongoose, {Schema} from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String //cloudinary only

    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    coverimage: {
        type: String //cloudinary only
    },
    watchHistory:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    refreshToken: {
        type: String
    }
},{timestamps:true})

userSchema.pre('save', async function(next){
    if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10)
    next()} else return next();
})

userSchema.Schema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
    })
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
        _id: this._id
    })
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
}

export const User = mongoose.model('User', userSchema)