import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import MongoDB from "@/lib/mongodb";
import { pagination } from "@/lib/utils/pagination";
import { ShowroomSchema, CreateShowroomInput } from "@/lib/schema";
import { createShowroom, getAllShowrooms } from "./showroom.service";
import { authenticateUser } from "@/middlewares/authenticateUser";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

export const POST = async (request: NextRequest) => {
  try {
    await authenticateUser(request, ["admin"]);
    await MongoDB();
    const body = await request.json();
    const validatedBody = ShowroomSchema.parse(body);

    const id =
      validatedBody.id?.trim() ||
      validatedBody.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const newShowroomData: CreateShowroomInput = {
      ...validatedBody,
      id,
    };

    const showroom = await createShowroom(newShowroomData);
    return NextResponse.json(
      { message: "Showroom created successfully", data: showroom },
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
          message: `A showroom with this ${duplicatedField} already exists.`,
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
    await MongoDB();
    // NOTE: Auth temporarily disabled so the ERP dashboard can read showrooms.
    // Re-enable with: await authenticateUser(request, ["admin"]);
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