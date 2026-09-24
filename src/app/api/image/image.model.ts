import mongoose, { Document, Types } from "mongoose";

export interface ImageInterface extends Document {
  url: string;
  imageId: string;
  uploadedBy?: Types.ObjectId;
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new mongoose.Schema<ImageInterface>(
  {
    url: { type: String, required: true },
    imageId: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true },
);
export const ImageModel =
  mongoose.models.Image || mongoose.model<ImageInterface>("Image", imageSchema);
