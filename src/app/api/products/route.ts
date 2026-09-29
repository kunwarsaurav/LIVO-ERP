import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createProduct, getAllProducts } from "./product.service";
import { productSchema } from "@/lib/utils/schema";
import { ValidationError } from "@/lib/errors";



/* ==========================================================================
   POSTGRESQL ROUTE HANDLERS (USING RAW SQL SERVICE)
   ========================================================================== */

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedBody = productSchema.parse(body);

    const product = await createProduct(validatedBody);
    return NextResponse.json(
      { message: "Product created successfully", data: product },
      { status: 201 },
    );
  } catch (error) {
    const pgError = error as { code?: string; detail?: string } | null;
    // PostgreSQL 23505 = unique_violation
    if (pgError?.code === "23505") {
      return NextResponse.json(
        {
          message:
            pgError.detail || "A product with this identifier already exists.",
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
