import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import MongoDB from "@/lib/mongodb";
import { NotFoundError, ValidationError } from "@/lib/errors";

import { UpdateOrderStatusSchema } from "../orderSchema";
import { getOrderById, updateOrderStatus } from "../order.service";

type Params = { params: Promise<{ id: string }> };

const validateOrderId = (id: string): void => {
  if (!id || id.length > 200 || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw new ValidationError("Invalid Order ID format");
  }
};

export const GET = async (_request: NextRequest, { params }: Params) => {
  try {
    await MongoDB();
    const { id } = await params;
    validateOrderId(id);
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Order fetched successfully", data: order },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const PATCH = async (_request: NextRequest, { params }: Params) => {
  try {
    await MongoDB();
    const { id } = await params;
    validateOrderId(id);

    const body = await _request.json();
    const parsed = UpdateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues.map((issue) => issue.message).join(", ") },
        { status: 400 },
      );
    }

    const order = await updateOrderStatus(id, parsed.data.productionStatus);
    return NextResponse.json(
      { message: "Order status updated successfully", data: order },
      { status: 200 },
    );
  } catch (error) {
    const mongoError = error as {
      code?: number;
    } | null;
    if (mongoError?.code === 11000) {
      return NextResponse.json(
        { message: "An order with this identifier already exists." },
        { status: 409 },
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues.map((err) => err.message).join(", ") },
        { status: 400 },
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};