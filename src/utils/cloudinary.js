import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload file on cloudinary server
        const response = await cloudinary.uploader
        .upload(
            localFilePath, {
                resource_type: "auto"
            }
        )
        console.log("upload successful: ", response);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlink(localFilePath)//remove the locally saved file in case upload fails
        console.log(error);
        return null;
    }
    
} 

export {uploadOnCloudinary}