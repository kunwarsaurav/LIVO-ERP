import { NextResponse, NextRequest } from "next/server";
import MongoDB from "@/lib/mongodb";
import {
  deleteImageById,
  getImageById,
  updateImageById,
} from "../image.service";
import {
  ImageValidationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { validateIdParams } from "@/lib/idParamsSchema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await MongoDB();
    const { id } = await params;
    validateIdParams(id, "Image");
    const image = await getImageById(id);
    if (!image) {
      throw new NotFoundError("Image");
    }

    return NextResponse.json({ image }, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await MongoDB();
    const { id } = await params;
    validateIdParams(id, "Image");
    const image = await deleteImageById(id);
    if (!image) {
      throw new NotFoundError("Image");
    }

    return NextResponse.json(
      { message: "Image Deleted Successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await MongoDB();
    const { id } = await params;
    validateIdParams(id, "Image");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) throw new ValidationError("File is required");
    const existingimage = await updateImageById(id, file);
    if (!existingimage) {
      throw new NotFoundError("Image");
    }
    return NextResponse.json(
      { message: "Image Updated Successfully", data: existingimage },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof ImageValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
