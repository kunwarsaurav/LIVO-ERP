import { z } from "zod";
import { ValidationError } from "./errors";

export const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const idParamSchema = z.string().regex(MONGO_ID_REGEX);

export function validateIdParams(id: string, idFrom: string = "Item"): string {
  const result = idParamSchema.safeParse(id);
  if (!result.success) {
    throw new ValidationError(`Invalid ${idFrom} ID format`);
  }
  return result.data;
}