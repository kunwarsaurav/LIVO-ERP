import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createProduct, getAllProducts } from "./product.service";
import MongoDB from "@/lib/mongodb";
import { CreateProductInput, ProductSchema } from "@/lib/schema";
import { ValidationError } from "@/lib/errors";

export const POST = async (request: NextRequest) => {
  try {
    await MongoDB();
    const body = await request.json();
    const validatedBody = ProductSchema.parse(body);
    // Generate unique ID if not supplied
    const id = validatedBody.id?.trim() || `prod-${Date.now()}`;

    const newProductData: CreateProductInput = {
      ...validatedBody,
      id,
    };

    const product = await createProduct(newProductData);
    return NextResponse.json(
      { message: "Product created successfully", data: product },
      { status: 201 },
    );
  } catch (error) {
    const mongoError = error as {
      code?: number;
      keyValue?: Record<string, string>;
    } | null;
    if (mongoError?.code === 11000) {
      const duplicatedField = Object.keys(mongoError.keyValue ?? {})[0];
      return NextResponse.json(
        {
          message: `A product with this ${duplicatedField} already exists.`,
        },
        { status: 409 },
      );
    }
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

export const GET = async (request: NextRequest) => {
  try {
    await MongoDB();
    const search = request.nextUrl.searchParams.get("search") || "";
    const data = await getAllProducts(search);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};