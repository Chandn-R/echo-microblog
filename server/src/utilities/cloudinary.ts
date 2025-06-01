import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";

if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary environment variables are missing!");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string
});

if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
    throw new Error("Cloudinary configuration is missing. Please check your environment variables.");
}

const cloudinaryUpload = (fileBuffer: Buffer, folder: string): Promise<{ secure_url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Upload failed"));
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

export default cloudinaryUpload;