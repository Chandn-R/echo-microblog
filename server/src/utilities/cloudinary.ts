import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string

});

const cloudinaryUpload = (fileBuffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "profile_pictures",
                resource_type: "image"

            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Upload failed"));
                resolve(result.secure_url);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

export default cloudinaryUpload;