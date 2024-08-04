import mongoose, {Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema = new Schema({
    videoFile:{
        type:String, //cloudinary only
        required:true
    },
    thumbnail:{
        type:String, //cloudinary only
        required:true
    },
    title:{
        type:String, //cloudinary only
        required:true
    },
    description:{
        type:String, //cloudinary only
        required:true
    },
    duration:{
        type:Number, //cloudinary only
        required:true
    },
    views:{
        type:Number, 
        default:0
    },
    isPublished:{
        type:Boolean, 
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref: "User"
    },

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video',videoSchema);