import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { pagination } from "@/lib/utils/pagination";
import { showroomSchema } from "@/lib/utils/schema";
import { createShowroom, getAllShowrooms } from "./showroom.service";
import { authenticateUser } from "@/middlewares/authenticateUser";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

/* ==========================================================================
   POSTGRESQL ROUTE HANDLERS (USING RAW SQL SERVICE)
   ========================================================================== */

export const POST = async (request: NextRequest) => {
  try {
    await authenticateUser(request, ["admin"]);
    const body = await request.json();
    const validatedBody = showroomSchema.parse(body);

    const id =
      validatedBody.id?.trim() ||
      validatedBody.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const showroom = await createShowroom({
      ...validatedBody,
      id,
    });

    return NextResponse.json(
      { message: "Showroom created successfully", data: showroom },
      { status: 201 },
    );
  } catch (error) {
    const pgError = error as { code?: string; detail?: string } | null;
    if (pgError?.code === "23505") {
      return NextResponse.json(
        {
          message:
            pgError.detail || "A showroom with this identifier already exists.",
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
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const GET = async (request: NextRequest) => {
  try {
    const paginationParams = pagination(request);
    const search = request.nextUrl.searchParams.get("search") || "";
    const room = request.nextUrl.searchParams.get("room") || "";
    const data = await getAllShowrooms(paginationParams, search, room);
    return NextResponse.json(
      { message: "Showrooms Fetched Successfully", ...data },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
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
