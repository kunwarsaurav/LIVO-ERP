import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import MongoDB from "@/lib/mongodb";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { authenticateUser } from "@/middlewares/authenticateUser";

import { UpdateInquiryStatusSchema } from "../inquirySchema";
import { getInquiryById, updateInquiryStatus } from "../inquiry.service";

type Params = { params: Promise<{ id: string }> };

const validateInquiryId = (id: string): void => {
  if (!id || id.length > 200 || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw new ValidationError("Invalid Inquiry ID format");
  }
};

export const GET = async (_request: NextRequest, { params }: Params) => {
  try {
    await MongoDB();
    const { id } = await params;
    validateInquiryId(id);
    const inquiry = await getInquiryById(id);
    if (!inquiry) {
      return NextResponse.json(
        { message: "Inquiry not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Inquiry fetched successfully", data: inquiry },
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

export const PATCH = async (_request: NextRequest, { params }: Params) => {
  try {
    await MongoDB();
    const { id } = await params;
    validateInquiryId(id);

    const body = await _request.json();
    const parsed = UpdateInquiryStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues.map((issue) => issue.message).join(", ") },
        { status: 400 },
      );
    }

    const inquiry = await updateInquiryStatus(id, parsed.data.status);
    return NextResponse.json(
      { message: "Inquiry status updated successfully", data: inquiry },
      { status: 200 },
    );
  } catch (error) {
    const mongoError = error as {
      code?: number;
    } | null;
    if (mongoError?.code === 11000) {
      return NextResponse.json(
        { message: "An inquiry with this identifier already exists." },
        { status: 409 },
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues.map((err) => err.message).join(", ") },
        { status: 400 },
      );
    }
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