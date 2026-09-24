export type ImageUploadMode = "single" | "multiple";

export interface ImageUploadResult {
  _id: string;
  url: string;
  imageId: string;
  mimeType: string;
  size: number;
}

export interface ImageUploadError {
  file: string;
  reason: string;
}