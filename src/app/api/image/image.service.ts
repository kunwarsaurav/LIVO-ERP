import { ImageModel } from "./image.model";
import cloudinary from "@/lib/cloudinary";
import { NotFoundError } from "@/lib/errors";
import sharp from "sharp";
import { UploadApiResponse } from "cloudinary";
import validateImageFile from "@/middlewares/imageValidator";

export const uploadToCloudinary = async (buffer: Buffer, folder: string) => {
  const compressedImage = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .toColorspace("srgb")
    .webp({ quality: 80 })
    .toBuffer();
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) reject(error);
        else resolve(result as UploadApiResponse);
      })
      .end(compressedImage);
  });
};
export const uploadImage = async (file: File, uploadedBy?: string) => {
  const { buffer, mimeType } = await validateImageFile(file);

  const result = await uploadToCloudinary(buffer, "livo_furniture/images");

  const image = await ImageModel.create({
    imageId: result.public_id,
    url: result.secure_url,
    mimeType: "image/webp",
    size: result.bytes,
    uploadedBy,
  });
  return image;
};
export async function getAllImages() {
  const image = ImageModel.find()
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name email");
  return image;
}

export async function getImageById(id: string) {
  const image = (ImageModel as any).findById(id).populate("uploadedBy", "name email");
  return (await image) as any;
}

export async function deleteImageById(id: string) {
  const image = await (ImageModel as any).findByIdAndDelete(id);
  if (!image) return null;
  await cloudinary.uploader.destroy(image.imageId);
  return image;
}

export async function updateImageById(id: string, file: File) {
  const existingimage = await (ImageModel as any).findByIdAndUpdate(id);
  if (!existingimage) return null;
  const { buffer, mimeType } = await validateImageFile(file);
  const result = await uploadToCloudinary(buffer, "livo_furniture/images");
  await cloudinary.uploader.destroy(existingimage.imageId);

  existingimage.imageId = result.public_id;
  existingimage.url = result.secure_url;
  existingimage.mimeType = "image/webp";
  existingimage.size = result.bytes;

  return existingimage;
}
