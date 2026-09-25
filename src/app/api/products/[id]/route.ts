import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import MongoDB from "@/lib/mongodb";
import {
  deleteProductById,
  getProductById,
  updateProductById,
} from "../product.service";
import { ProductSchema } from "@/lib/schema";
import { ValidationError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

const validateProductId = (id: string): void => {
  if (!id || id.length > 200 || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw new ValidationError("Invalid Product ID format");
  }
};

export const GET = async (request: NextRequest, { params }: Params) => {
  try {
    await MongoDB();
    const { id } = await params;
    validateProductId(id);
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Product fetched successfully", data: product },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const PATCH = async (request: NextRequest, { params }: Params) => {
  return updateProduct(request, params);
};

export const PUT = async (request: NextRequest, { params }: Params) => {
  return updateProduct(request, params);
};

const updateProduct = async (
  request: NextRequest,
  params: Promise<{ id: string }>,
) => {
  try {
    await MongoDB();
    const { id } = await params;
    validateProductId(id);

    const body = await request.json();
    const validatedData = ProductSchema.partial().safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, error: validatedData.error.message },
        { status: 400 },
      );
    }

    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const updatedProduct = await updateProductById(id, validatedData.data);
    return NextResponse.json(
      { message: "Product updated successfully", data: updatedProduct },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const combinedErrorMessage = error.issues
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json(
        { message: combinedErrorMessage },
        { status: 400 },
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const DELETE = async (request: NextRequest, { params }: Params) => {
  try {
    await MongoDB();
    const { id } = await params;
    validateProductId(id);
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    await deleteProductById(id);
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};