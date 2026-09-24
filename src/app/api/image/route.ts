import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import MongoDB from "@/lib/mongodb";
import { getAllImages, uploadImage } from "./image.service";
import {
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

export const POST = async (request: NextRequest) => {
  try {
    await MongoDB();
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
    console.log("error 500", error);
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
    await MongoDB();
    const image = await getAllImages();
    return NextResponse.json(
      {
        message: "Images Fetched Successfully",
        data: image,
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
