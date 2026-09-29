import { z } from "zod";

export const ORDER_STATUSES = [
  "Ordered",
  "In Production / Procurement",
  "Warehouse Ready",
  "Out for Delivery",
  "Installed & Signed Off",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const UpdateOrderStatusSchema = z.object({
  productionStatus: z.enum(ORDER_STATUSES, {
    message: "Invalid order status",
  }),
});

export type UpdateOrderStatusInput = z.infer<
  typeof UpdateOrderStatusSchema
>;