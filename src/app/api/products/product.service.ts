import { db } from "@/utils/lib/database";
import {
  PRODUCT_TABLE,
  productInputToRow,
  productRowToEntity,
  productUpdateToRow,
} from "@/lib/utils/schema";
import type {
  CreateProductInput,
  Product,
  ProductRow,
  UpdateProductInput,
} from "@/lib/utils/types";



/* ==========================================================================
   POSTGRESQL RAW SQL IMPLEMENTATION (WITHOUT ORM)
   ========================================================================== */

/**
 * Inserts a new product into PostgreSQL using raw SQL.
 */
export const createProduct = async (
  productInput: CreateProductInput,
): Promise<Product> => {
  const row = productInputToRow(productInput);
  const keys = Object.keys(row);
  const columns = keys.map((key) => `"${key}"`).join(", ");
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const values = Object.values(row);

  const query = `
    INSERT INTO "${PRODUCT_TABLE}" (${columns})
    VALUES (${placeholders})
    RETURNING *;
  `;

  const result = await db.query<ProductRow>(query, values);
  return productRowToEntity(result.rows[0]);
};

/**
 * Retrieves all products with optional case-insensitive search using raw SQL.
 */
export const getAllProducts = async (search?: string): Promise<Product[]> => {
  let query = `SELECT * FROM "${PRODUCT_TABLE}"`;
  const values: unknown[] = [];

  if (search && search.trim()) {
    values.push(`%${search.trim()}%`);
    query += `
      WHERE "name" ILIKE $1
         OR "sku" ILIKE $1
         OR "brand" ILIKE $1
         OR "category" ILIKE $1
    `;
  }

  query += ` ORDER BY "created_at" DESC;`;

  const result = await db.query<ProductRow>(query, values);
  return result.rows.map(productRowToEntity);
};

/**
 * Retrieves a product by ID or legacyMongoId using raw SQL.
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const query = `
    SELECT * FROM "${PRODUCT_TABLE}"
    WHERE "id" = $1 OR "legacy_mongo_id" = $1
    LIMIT 1;
  `;

  const result = await db.query<ProductRow>(query, [id]);
  if (result.rows.length === 0) return null;

  return productRowToEntity(result.rows[0]);
};

/**
 * Updates a product by ID using raw SQL parameterization.
 */
export const updateProductById = async (
  id: string,
  validatedData: UpdateProductInput,
): Promise<Product | null> => {
  const row = productUpdateToRow(validatedData);
  const keys = Object.keys(row);

  if (keys.length === 0) {
    return getProductById(id);
  }

  const setClauses = keys.map((key, index) => `"${key}" = $${index + 1}`);
  const values = Object.values(row);

  // Add updatedAt timestamp
  setClauses.push(`"updated_at" = NOW()`);

  // Target identifier parameter
  const idPlaceholderIndex = values.length + 1;
  values.push(id);

  const query = `
    UPDATE "${PRODUCT_TABLE}"
    SET ${setClauses.join(", ")}
    WHERE "id" = $${idPlaceholderIndex} OR "legacy_mongo_id" = $${idPlaceholderIndex}
    RETURNING *;
  `;

  const result = await db.query<ProductRow>(query, values);
  if (result.rows.length === 0) return null;

  return productRowToEntity(result.rows[0]);
};

/**
 * Deletes a product by ID or legacyMongoId using raw SQL.
 */
export const deleteProductById = async (
  id: string,
): Promise<Product | null> => {
  const query = `
    DELETE FROM "${PRODUCT_TABLE}"
    WHERE "id" = $1 OR "legacy_mongo_id" = $1
    RETURNING *;
  `;

  const result = await db.query<ProductRow>(query, [id]);
  if (result.rows.length === 0) return null;

  return productRowToEntity(result.rows[0]);
};

/**
 * Validates whether all given product IDs exist in PostgreSQL using raw SQL.
 */
export const validateProductsByIds = async (
  ids: string[],
): Promise<boolean> => {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return true;

  const query = `
    SELECT COUNT(DISTINCT "id") as count
    FROM "${PRODUCT_TABLE}"
    WHERE "id" = ANY($1::text[]) OR "legacy_mongo_id" = ANY($1::text[]);
  `;

  const result = await db.query<{ count: string }>(query, [uniqueIds]);
  const count = parseInt(result.rows[0]?.count || "0", 10);
  return count === uniqueIds.length;
};
