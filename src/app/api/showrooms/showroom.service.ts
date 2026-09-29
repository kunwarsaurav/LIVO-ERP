import { z } from "zod";
import { db } from "@/utils/lib/database";
import cloudinary from "@/utils/lib/cloudinary";
import {
  SHOWROOMS_TABLE,
  IMAGES_TABLE,
  showroomRowToEntity,
  buildPaginationMeta,
  generateBusinessId,
  showroomSchema,
} from "@/lib/utils/schema";
import type { Showroom, ShowroomRow } from "@/lib/utils/types";
import { ValidationError } from "@/lib/errors";
import { PaginationInterface } from "@/lib/utils/pagination";

/* ==========================================================================
   POSTGRESQL RAW SQL IMPLEMENTATION (WITHOUT ORM)
   ========================================================================== */

const extractCloudinaryPublicId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("res.cloudinary.com")) return null;
    const segments = parsed.pathname.split("/");
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex < 1 || segments[uploadIndex - 1] !== "image") return null;
    const raw = segments.slice(uploadIndex + 1).join("/");
    return raw.replace(/^v\d+\//, "").replace(/\.[^./]+$/, "");
  } catch {
    return null;
  }
};

export const validateShowroomImage = (url: string): void => {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) {
    throw new ValidationError(`Invalid showroom image URL: ${url}`);
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (
    cloudName &&
    !url.includes(`res.cloudinary.com/${cloudName}/image/upload/`)
  ) {
    throw new ValidationError(`Invalid Cloudinary image URL: ${url}`);
  }
};

async function destroyCloudinaryImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const publicIds = urls
    .map(extractCloudinaryPublicId)
    .filter((publicId): publicId is string => Boolean(publicId));
  await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
  );
  await db.query(
    `DELETE FROM "${IMAGES_TABLE}" WHERE "url" = ANY($1::text[]);`,
    [urls],
  );
}

/**
 * Creates a new showroom in PostgreSQL using raw SQL.
 */
export const createShowroom = async (showroom: {
  name: string;
  room: string;
  image: string;
  description: string;
  piecesFeatured?: string[];
  id?: string;
  legacyMongoId?: string | null;
}): Promise<Showroom> => {
  validateShowroomImage(showroom.image);
  const id = showroom.id?.trim() || generateBusinessId("SHW");

  const query = `
    INSERT INTO "${SHOWROOMS_TABLE}" (
      "id",
      "name",
      "room",
      "image",
      "description",
      "pieces_featured",
      "legacy_mongo_id"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    id,
    showroom.name,
    showroom.room,
    showroom.image,
    showroom.description,
    showroom.piecesFeatured || [],
    showroom.legacyMongoId || null,
  ];

  const result = await db.query<ShowroomRow>(query, values);
  return showroomRowToEntity(result.rows[0]);
};

/**
 * Retrieves paginated and filtered showrooms using raw SQL.
 */
export const getAllShowrooms = async (
  { page, limit, skip }: PaginationInterface,
  search: string,
  room?: string,
): Promise<{
  data: Showroom[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> => {
  const whereClauses: string[] = [];
  const values: unknown[] = [];

  if (search && search.trim()) {
    values.push(`%${search.trim()}%`);
    const searchParamIndex = values.length;
    whereClauses.push(`(
      "name" ILIKE $${searchParamIndex} OR
      "room" ILIKE $${searchParamIndex} OR
      "description" ILIKE $${searchParamIndex} OR
      "id" ILIKE $${searchParamIndex} OR
      EXISTS (SELECT 1 FROM unnest("pieces_featured") p WHERE p ILIKE $${searchParamIndex})
    )`);
  }

  if (room && room.trim()) {
    values.push(room.trim());
    whereClauses.push(`"room" = $${values.length}`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Count query
  const countQuery = `SELECT COUNT(*) as total FROM "${SHOWROOMS_TABLE}" ${whereSql};`;
  const countResult = await db.query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  // Data query
  const dataValues = [...values, limit, skip];
  const limitParamIndex = dataValues.length - 1;
  const skipParamIndex = dataValues.length;

  const dataQuery = `
    SELECT * FROM "${SHOWROOMS_TABLE}"
    ${whereSql}
    ORDER BY "created_at" DESC
    LIMIT $${limitParamIndex} OFFSET $${skipParamIndex};
  `;

  const result = await db.query<ShowroomRow>(dataQuery, dataValues);
  const showrooms = result.rows.map(showroomRowToEntity);

  return {
    data: showrooms,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Retrieves a showroom by ID or legacy_mongo_id using raw SQL.
 */
export const getShowroomById = async (id: string): Promise<Showroom | null> => {
  const query = `
    SELECT * FROM "${SHOWROOMS_TABLE}"
    WHERE "id" = $1 OR "legacy_mongo_id" = $1
    LIMIT 1;
  `;

  const result = await db.query<ShowroomRow>(query, [id]);
  if (result.rows.length === 0) return null;

  return showroomRowToEntity(result.rows[0]);
};

/**
 * Updates a showroom by ID using raw SQL.
 */
export const updateShowroomById = async (
  id: string,
  validatedData: Partial<z.infer<typeof showroomSchema>>,
): Promise<Showroom | null> => {
  const nextImage = validatedData.image ?? undefined;
  if (nextImage) {
    validateShowroomImage(nextImage);
  }

  const existingShowroom = await getShowroomById(id);
  const removedImages =
    existingShowroom &&
    existingShowroom.image &&
    existingShowroom.image !== nextImage
      ? [existingShowroom.image]
      : [];

  const row: Record<string, unknown> = {};
  if (validatedData.name !== undefined) row.name = validatedData.name;
  if (validatedData.room !== undefined) row.room = validatedData.room;
  if (validatedData.image !== undefined) row.image = validatedData.image;
  if (validatedData.description !== undefined)
    row.description = validatedData.description;
  if (validatedData.piecesFeatured !== undefined)
    row.pieces_featured = validatedData.piecesFeatured;

  const keys = Object.keys(row);
  if (keys.length === 0) {
    return existingShowroom;
  }

  const setClauses = keys.map((key, index) => `"${key}" = $${index + 1}`);
  const values = Object.values(row);

  setClauses.push(`"updated_at" = NOW()`);

  const idPlaceholderIndex = values.length + 1;
  values.push(id);

  const query = `
    UPDATE "${SHOWROOMS_TABLE}"
    SET ${setClauses.join(", ")}
    WHERE "id" = $${idPlaceholderIndex} OR "legacy_mongo_id" = $${idPlaceholderIndex}
    RETURNING *;
  `;

  const result = await db.query<ShowroomRow>(query, values);
  if (result.rows.length === 0) return null;

  await destroyCloudinaryImages(removedImages);

  return showroomRowToEntity(result.rows[0]);
};

/**
 * Deletes a showroom by ID or legacy_mongo_id using raw SQL.
 */
export const deleteShowroomById = async (
  id: string,
): Promise<Showroom | null> => {
  const query = `
    DELETE FROM "${SHOWROOMS_TABLE}"
    WHERE "id" = $1 OR "legacy_mongo_id" = $1
    RETURNING *;
  `;

  const result = await db.query<ShowroomRow>(query, [id]);
  if (result.rows.length === 0) return null;

  const deletedShowroom = showroomRowToEntity(result.rows[0]);
  if (deletedShowroom?.image) {
    await destroyCloudinaryImages([deletedShowroom.image]);
  }

  return deletedShowroom;
};
