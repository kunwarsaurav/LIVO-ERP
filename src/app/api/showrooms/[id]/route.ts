import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import MongoDB from "@/lib/mongodb";
import { ShowroomSchema } from "@/lib/schema";
import {
  deleteShowroomById,
  getShowroomById,
  updateShowroomById,
} from "../showroom.service";
import { authenticateUser } from "@/middlewares/authenticateUser";
import { UnauthorizedError, ValidationError } from "@/lib/errors";

type Params = { params: Promise<{ id: string }> };

export const validateShowroomId = (id: string): void => {
  if (!id || id.length > 200 || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw new ValidationError("Invalid Showroom ID format");
  }
};

export const GET = async (request: NextRequest, { params }: Params) => {
  try {
    await MongoDB();
    await authenticateUser(request, ["admin"]);
    const { id } = await params;
    validateShowroomId(id);
    const showroom = await getShowroomById(id);
    if (!showroom) {
      return NextResponse.json(
        { message: "Showroom not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Showroom fetched successfully", data: showroom },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
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

export const PATCH = async (request: NextRequest, { params }: Params) => {
  try {
    await MongoDB();
    await authenticateUser(request, ["admin"]);
    const { id } = await params;
    validateShowroomId(id);
    const body = await request.json();
    const validatedData = ShowroomSchema.partial().safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, error: validatedData.error.message },
        { status: 400 },
      );
    }

    const showroom = await getShowroomById(id);
    if (!showroom) {
      return NextResponse.json(
        { message: "Showroom not found" },
        { status: 404 },
      );
    }

    const updatedShowroom = await updateShowroomById(id, validatedData.data);
    return NextResponse.json(
      { message: "Showroom updated successfully", data: updatedShowroom },
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
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
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
    await authenticateUser(request, ["admin"]);
    const { id } = await params;
    validateShowroomId(id);
    const showroom = await getShowroomById(id);
    if (!showroom) {
      return NextResponse.json(
        { message: "Showroom not found" },
        { status: 404 },
      );
    }

    await deleteShowroomById(id);
    return NextResponse.json(
      { message: "Showroom deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
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