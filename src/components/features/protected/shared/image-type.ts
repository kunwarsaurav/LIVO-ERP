export type ImageUploadMode = "single" | "multiple";

/** Mirrors MediaImage returned by POST /api/image. */
export interface ImageUploadResult {
  id: string;
  legacyMongoId: string | null;
  cloudinaryPublicId: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImageUploadError {
  file: string;
  reason: string;
}