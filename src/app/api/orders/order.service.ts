import mongoose from "mongoose";

import { NotFoundError, ValidationError } from "@/lib/errors";
import { buildPaginationMeta, PaginationInterface } from "@/lib/utils/pagination";
import { searchFilter } from "@/lib/utils/search";

import { OrderStatus, ORDER_STATUSES } from "./orderSchema";
import { IOrderDocument, OrderModel } from "./order.model";

const orderFilter = (id: string) =>
  mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };

export const getAllOrders = async (
  { page, limit, skip }: PaginationInterface,
  search: string,
  status?: string,
) => {
  const userSearch = searchFilter<IOrderDocument>(
    [
      "orderNumber",
      "customerName",
      "customerPhone",
      "customerEmail",
      "deliveryAddress",
      "projectType",
      "id",
    ],
    search,
  );
  const query: mongoose.QueryFilter<IOrderDocument> = {
    ...userSearch,
  };
  if (status) {
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      throw new ValidationError("Invalid order status");
    }
    query.productionStatus = status as OrderStatus;
  }
  const [orders, total] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit),
    OrderModel.countDocuments(query),
  ]);
  return {
    data: orders,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getOrderById = async (id: string) => {
  return OrderModel.findOne(orderFilter(id));
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new ValidationError("Invalid order status");
  }
  const updatedOrder = await OrderModel.findOneAndUpdate(
    orderFilter(id),
    { productionStatus: status },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
  if (!updatedOrder) {
    throw new NotFoundError("Order");
  }
  return updatedOrder;
};