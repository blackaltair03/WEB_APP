import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resource_type?: "image" | "video" | "raw" } = {}
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: options.folder ?? process.env.CLOUDINARY_FOLDER ?? "campo",
          resource_type: options.resource_type ?? "image",
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      )
      .end(buffer);
  });
}

export async function deleteFromCloudinary(public_id: string): Promise<void> {
  await cloudinary.uploader.destroy(public_id);
}
