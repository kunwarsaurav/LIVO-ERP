import type { QueryFilter  } from "mongoose";

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function searchFilter<T>(field:(keyof T)[],search:string):QueryFilter<T>{
    if (!search) return {};
  return {
    $or: field.map(f => ({ [f]: { $regex: escapeRegex(search), $options: "i" } })),
  } as QueryFilter <T>;
}