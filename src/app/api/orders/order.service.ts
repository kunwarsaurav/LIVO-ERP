import { db } from "@/utils/lib/database";
import {
  ORDERS_TABLE,
  orderRowToEntity,
  buildPaginationMeta,
} from "@/lib/utils/schema";
import type { Order, OrderRow, OrderStatus } from "@/lib/utils/types";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { PaginationInterface } from "@/lib/utils/pagination";
import { ORDER_STATUSES } from "@/lib/utils/types";



/* ==========================================================================
   POSTGRESQL RAW SQL IMPLEMENTATION (WITHOUT ORM)
   ========================================================================== */

/**
 * Retrieves paginated and filtered orders using raw SQL.
 */
export const getAllOrders = async (
  { page, limit, skip }: PaginationInterface,
  search: string,
  status?: string,
): Promise<{
  data: Order[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> => {
  const whereClauses: string[] = [];
  const values: unknown[] = [];

  if (search && search.trim()) {
    values.push(`%${search.trim()}%`);
    const searchParamIndex = values.length;
    whereClauses.push(`(
      "order_number" ILIKE $${searchParamIndex} OR
      "customer_name" ILIKE $${searchParamIndex} OR
      "customer_phone" ILIKE $${searchParamIndex} OR
      "customer_email" ILIKE $${searchParamIndex} OR
      "delivery_address" ILIKE $${searchParamIndex} OR
      "project_type" ILIKE $${searchParamIndex} OR
      "id" ILIKE $${searchParamIndex}
    )`);
  }

  if (status && status.trim()) {
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      throw new ValidationError("Invalid order status");
    }
    values.push(status);
    whereClauses.push(`"production_status" = $${values.length}`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Count query
  const countQuery = `SELECT COUNT(*) as total FROM "${ORDERS_TABLE}" ${whereSql};`;
  const countResult = await db.query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  // Data query
  const dataValues = [...values, limit, skip];
  const limitParamIndex = dataValues.length - 1;
  const skipParamIndex = dataValues.length;

  const dataQuery = `
    SELECT * FROM "${ORDERS_TABLE}"
    ${whereSql}
    ORDER BY "created_at" DESC
    LIMIT $${limitParamIndex} OFFSET $${skipParamIndex};
  `;

  const result = await db.query<OrderRow>(dataQuery, dataValues);
  const orders = result.rows.map(orderRowToEntity);

  return {
    data: orders,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Retrieves an order by ID or legacy_mongo_id using raw SQL.
 */
export const getOrderById = async (id: string): Promise<Order | null> => {
  const query = `
    SELECT * FROM "${ORDERS_TABLE}"
    WHERE "id" = $1 OR "legacy_mongo_id" = $1
    LIMIT 1;
  `;

  const result = await db.query<OrderRow>(query, [id]);
  if (result.rows.length === 0) return null;

  return orderRowToEntity(result.rows[0]);
};

/**
 * Updates productionStatus of an order by ID using raw SQL.
 */
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<Order> => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new ValidationError("Invalid order status");
  }

  const query = `
    UPDATE "${ORDERS_TABLE}"
    SET "production_status" = $1, "updated_at" = NOW()
    WHERE "id" = $2 OR "legacy_mongo_id" = $2
    RETURNING *;
  `;

  const result = await db.query<OrderRow>(query, [status, id]);
  if (result.rows.length === 0) {
    throw new NotFoundError("Order");
  }

  return orderRowToEntity(result.rows[0]);
};
