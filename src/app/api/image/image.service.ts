import cloudinary from "@/utils/lib/cloudinary";
import { db } from "@/utils/lib/database";
import { IMAGES_TABLE, imageRowToEntity } from "@/lib/utils/schema";
import type { ImageRow, MediaImage } from "@/lib/utils/types";
import sharp from "sharp";
import { UploadApiResponse } from "cloudinary";
import validateImageFile from "@/middlewares/imageValidator";


/* ==========================================================================
   POSTGRESQL RAW SQL IMPLEMENTATION (WITHOUT ORM)
   ========================================================================== */

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> => {
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

/**
 * Uploads image to Cloudinary and stores record in PostgreSQL table `images`
 */
export const uploadImage = async (
  file: File,
  _uploadedBy?: string,
): Promise<MediaImage> => {
  const { buffer } = await validateImageFile(file);
  const result = await uploadToCloudinary(buffer, "livo_furniture/images");

  const query = `
    INSERT INTO "${IMAGES_TABLE}" (
      "cloudinary_public_id",
      "url",
      "mime_type",
      "size_bytes"
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    result.public_id,
    result.secure_url,
    "image/webp",
    result.bytes,
  ];

  const dbResult = await db.query<ImageRow>(query, values);
  return imageRowToEntity(dbResult.rows[0]);
};

/**
 * Retrieves all images ordered by newest first from PostgreSQL
 */
export async function getAllImages(): Promise<MediaImage[]> {
  const query = `
    SELECT * FROM "${IMAGES_TABLE}"
    ORDER BY "created_at" DESC;
  `;

  const result = await db.query<ImageRow>(query);
  return result.rows.map(imageRowToEntity);
}

/**
 * Retrieves an image by id (integer bigint id, legacy_mongo_id, or cloudinary_public_id)
 */
export async function getImageById(id: string): Promise<MediaImage | null> {
  const isNumeric = /^\d+$/.test(id);
  const query = isNumeric
    ? `SELECT * FROM "${IMAGES_TABLE}" WHERE "id" = $1 OR "legacy_mongo_id" = $1 LIMIT 1;`
    : `SELECT * FROM "${IMAGES_TABLE}" WHERE "legacy_mongo_id" = $1 OR "cloudinary_public_id" = $1 LIMIT 1;`;

  const result = await db.query<ImageRow>(query, [id]);
  if (result.rows.length === 0) return null;

  return imageRowToEntity(result.rows[0]);
}

/**
 * Deletes an image by ID from PostgreSQL and removes the file from Cloudinary
 */
export async function deleteImageById(id: string): Promise<MediaImage | null> {
  const existingImage = await getImageById(id);
  if (!existingImage) return null;

  const isNumeric = /^\d+$/.test(id);
  const query = isNumeric
    ? `DELETE FROM "${IMAGES_TABLE}" WHERE "id" = $1 OR "legacy_mongo_id" = $1 RETURNING *;`
    : `DELETE FROM "${IMAGES_TABLE}" WHERE "legacy_mongo_id" = $1 OR "cloudinary_public_id" = $1 RETURNING *;`;

  const result = await db.query<ImageRow>(query, [id]);
  if (result.rows.length === 0) return null;

  // Cleanup Cloudinary asset
  if (existingImage.cloudinaryPublicId) {
    try {
      await cloudinary.uploader.destroy(existingImage.cloudinaryPublicId);
    } catch (err) {
      console.error("Cloudinary destruction error:", err);
    }
  }

  return imageRowToEntity(result.rows[0]);
}

/**
 * Replaces an image file on Cloudinary and updates PostgreSQL record
 */
export async function updateImageById(
  id: string,
  file: File,
): Promise<MediaImage | null> {
  const existingImage = await getImageById(id);
  if (!existingImage) return null;

  const { buffer } = await validateImageFile(file);
  const result = await uploadToCloudinary(buffer, "livo_furniture/images");

  // Destroy previous Cloudinary image
  if (existingImage.cloudinaryPublicId) {
    try {
      await cloudinary.uploader.destroy(existingImage.cloudinaryPublicId);
    } catch (err) {
      console.error("Cloudinary old image cleanup error:", err);
    }
  }

  const isNumeric = /^\d+$/.test(id);
  const query = isNumeric
    ? `
      UPDATE "${IMAGES_TABLE}"
      SET
        "cloudinary_public_id" = $1,
        "url" = $2,
        "mime_type" = $3,
        "size_bytes" = $4,
        "updated_at" = NOW()
      WHERE "id" = $5 OR "legacy_mongo_id" = $5
      RETURNING *;
    `
    : `
      UPDATE "${IMAGES_TABLE}"
      SET
        "cloudinary_public_id" = $1,
        "url" = $2,
        "mime_type" = $3,
        "size_bytes" = $4,
        "updated_at" = NOW()
      WHERE "legacy_mongo_id" = $5 OR "cloudinary_public_id" = $5
      RETURNING *;
    `;

  const values = [
    result.public_id,
    result.secure_url,
    "image/webp",
    result.bytes,
    id,
  ];

  const dbResult = await db.query<ImageRow>(query, values);
  if (dbResult.rows.length === 0) return null;

  return imageRowToEntity(dbResult.rows[0]);
}
