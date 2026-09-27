import { z } from "zod";
import mongoose from "mongoose";

import { ImageModel } from "@/app/api/image/image.model";
import cloudinary from "@/lib/cloudinary";
import { ValidationError } from "@/lib/errors";
import { ShowroomSchema } from "@/lib/schema";
import { buildPaginationMeta, PaginationInterface } from "@/lib/utils/pagination";
import { searchFilter } from "@/lib/utils/search";

import { IShowroomDocument, ShowroomModel } from "./showroom.model";

const showroomFilter = (id: string) =>
  mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };

const extractCloudinaryPublicId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("res.cloudinary.com")) return null;
    const segments = parsed.pathname.split("/");
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex < 1 || segments[uploadIndex - 1] !== "image") return null;
    const raw = segments.slice(uploadIndex + 1).join("/");
    return raw.replace(/^v\d+\//, "").replace(/\.[^./]+$/, "");
  } catch {
    return null;
  }
};

export const validateShowroomImage = (url: string): void => {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) {
    throw new ValidationError(`Invalid showroom image URL: ${url}`);
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (
    cloudName &&
    !url.includes(`res.cloudinary.com/${cloudName}/image/upload/`)
  ) {
    throw new ValidationError(`Invalid Cloudinary image URL: ${url}`);
  }
};

async function destroyCloudinaryImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const publicIds = urls
    .map(extractCloudinaryPublicId)
    .filter((publicId): publicId is string => Boolean(publicId));
  await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
  );
  await ImageModel.deleteMany({ url: { $in: urls } });
}

export const createShowroom = async (showroom: {
  name: string;
  room: string;
  image: string;
  description: string;
  piecesFeatured?: string[];
  id?: string;
}) => {
  validateShowroomImage(showroom.image);
  return ShowroomModel.create(showroom);
};

export const getAllShowrooms = async (
  { page, limit, skip }: PaginationInterface,
  search: string,
  room?: string,
) => {
  const userSearch = searchFilter<IShowroomDocument>(
    ["name", "room", "description", "piecesFeatured"],
    search,
  );
  const query = {
    ...userSearch,
    ...(room ? { room } : {}),
  };
  const [showrooms, total] = await Promise.all([
    ShowroomModel.find(query)
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit),
    ShowroomModel.countDocuments(query),
  ]);
  return {
    data: showrooms,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getShowroomById = async (id: string) => {
  return ShowroomModel.findOne(showroomFilter(id));
};

export const updateShowroomById = async (
  id: string,
  validatedData: Partial<z.infer<typeof ShowroomSchema>>,
) => {
  const nextImage = validatedData.image ?? undefined;
  if (nextImage) {
    validateShowroomImage(nextImage);
  }

  const existingShowroom = await ShowroomModel.findOne(showroomFilter(id));
  const removedImages =
    existingShowroom &&
    existingShowroom.image &&
    existingShowroom.image !== nextImage
      ? [existingShowroom.image]
      : [];

  const updatedShowroom = await ShowroomModel.findOneAndUpdate(
    showroomFilter(id),
    validatedData,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  await destroyCloudinaryImages(removedImages);

  return updatedShowroom;
};

export const deleteShowroomById = async (id: string) => {
  const showroom = await ShowroomModel.findOneAndDelete(showroomFilter(id));
  if (showroom?.image) {
    await destroyCloudinaryImages([showroom.image]);
  }
  return showroom;
};