import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAllImages, uploadImage } from "./image.service";
import {
  ValidationError,
} from "@/lib/errors";


/* ==========================================================================
   POSTGRESQL ROUTE HANDLERS (USING RAW SQL SERVICE)
   ========================================================================== */

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new ValidationError("Image file is required");
    }

    const image = await uploadImage(file);

    return NextResponse.json(
      {
        message: "Image Uploaded Successfully",
        data: image,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Image upload error:", error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
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

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const GET = async () => {
  try {
    const images = await getAllImages();
    return NextResponse.json(
      {
        message: "Images Fetched Successfully",
        data: images,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
