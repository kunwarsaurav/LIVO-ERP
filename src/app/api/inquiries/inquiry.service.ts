import { db } from "@/utils/lib/database";
import {
  INQUIRIES_TABLE,
  inquiryRowToEntity,
  buildPaginationMeta,
  generateBusinessId,
} from "@/lib/utils/schema";
import type { Inquiry, InquiryRow, InquiryStatus } from "@/lib/utils/types";
import { INQUIRY_STATUSES } from "@/lib/utils/types";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { PaginationInterface } from "@/lib/utils/pagination";



/* ==========================================================================
   POSTGRESQL RAW SQL IMPLEMENTATION (WITHOUT ORM)
   ========================================================================== */

/**
 * Creates a new inquiry in PostgreSQL using raw SQL.
 */
export const createInquiry = async (inquiryData: {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  date?: Date | null;
  status?: InquiryStatus;
  productName?: string;
  productPrice?: number | null;
  message?: string;
  totalAmount?: number;
  items?: Record<string, unknown>[];
  legacyMongoId?: string | null;
}): Promise<Inquiry> => {
  const id = inquiryData.id?.trim() || generateBusinessId("INQ");
  const query = `
    INSERT INTO "${INQUIRIES_TABLE}" (
      "id",
      "name",
      "phone",
      "email",
      "date",
      "status",
      "product_name",
      "product_price",
      "message",
      "total_amount",
      "items",
      "legacy_mongo_id"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;

  const values = [
    id,
    inquiryData.name,
    inquiryData.phone,
    inquiryData.email || "",
    inquiryData.date || new Date(),
    inquiryData.status || "pending",
    inquiryData.productName || "",
    inquiryData.productPrice ?? null,
    inquiryData.message || "",
    inquiryData.totalAmount || 0,
    JSON.stringify(inquiryData.items || []),
    inquiryData.legacyMongoId || null,
  ];

  const result = await db.query<InquiryRow>(query, values);
  return inquiryRowToEntity(result.rows[0]);
};

/**
 * Retrieves paginated and filtered inquiries using raw SQL.
 */
export const getAllInquiries = async (
  { page, limit, skip }: PaginationInterface,
  search: string,
  status?: string,
): Promise<{
  data: Inquiry[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> => {
  const whereClauses: string[] = [];
  const values: unknown[] = [];

  if (search && search.trim()) {
    values.push(`%${search.trim()}%`);
    const searchParamIndex = values.length;
    whereClauses.push(`(
      "name" ILIKE $${searchParamIndex} OR
      "phone" ILIKE $${searchParamIndex} OR
      "email" ILIKE $${searchParamIndex} OR
      "product_name" ILIKE $${searchParamIndex} OR
      "message" ILIKE $${searchParamIndex} OR
      "id" ILIKE $${searchParamIndex}
    )`);
  }

  if (status && status.trim()) {
    if (!INQUIRY_STATUSES.includes(status as InquiryStatus)) {
      throw new ValidationError("Invalid inquiry status");
    }
    values.push(status);
    whereClauses.push(`"status" = $${values.length}`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Count query
  const countQuery = `SELECT COUNT(*) as total FROM "${INQUIRIES_TABLE}" ${whereSql};`;
  const countResult = await db.query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  // Data query
  const dataValues = [...values, limit, skip];
  const limitParamIndex = dataValues.length - 1;
  const skipParamIndex = dataValues.length;

  const dataQuery = `
    SELECT * FROM "${INQUIRIES_TABLE}"
    ${whereSql}
    ORDER BY "created_at" DESC
    LIMIT $${limitParamIndex} OFFSET $${skipParamIndex};
  `;

  const result = await db.query<InquiryRow>(dataQuery, dataValues);
  const inquiries = result.rows.map(inquiryRowToEntity);

  return {
    data: inquiries,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Retrieves an inquiry by ID or legacy_mongo_id using raw SQL.
 */
export const getInquiryById = async (id: string): Promise<Inquiry | null> => {
  const query = `
    SELECT * FROM "${INQUIRIES_TABLE}"
    WHERE "id" = $1 OR "legacy_mongo_id" = $1
    LIMIT 1;
  `;

  const result = await db.query<InquiryRow>(query, [id]);
  if (result.rows.length === 0) return null;

  return inquiryRowToEntity(result.rows[0]);
};

/**
 * Updates status of an inquiry by ID using raw SQL.
 */
export const updateInquiryStatus = async (
  id: string,
  status: InquiryStatus,
): Promise<Inquiry> => {
  if (!INQUIRY_STATUSES.includes(status)) {
    throw new ValidationError("Invalid inquiry status");
  }

  const query = `
    UPDATE "${INQUIRIES_TABLE}"
    SET "status" = $1, "updated_at" = NOW()
    WHERE "id" = $2 OR "legacy_mongo_id" = $2
    RETURNING *;
  `;

  const result = await db.query<InquiryRow>(query, [status, id]);
  if (result.rows.length === 0) {
    throw new NotFoundError("Inquiry");
  }

  return inquiryRowToEntity(result.rows[0]);
};
