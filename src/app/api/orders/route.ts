import { NextRequest, NextResponse } from "next/server";

import MongoDB from "@/lib/mongodb";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { pagination } from "@/lib/utils/pagination";

import { getAllOrders } from "./order.service";

export const GET = async (request: NextRequest) => {
  try {
    await MongoDB();
    const paginationParams = pagination(request);
    const search = request.nextUrl.searchParams.get("search") || "";
    const status = request.nextUrl.searchParams.get("status") || "";
    const data = await getAllOrders(paginationParams, search, status);
    return NextResponse.json(
      { message: "Orders Fetched Successfully", ...data },
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