import { ProductModel, IProductDocument } from "./product.model";
import { CreateProductInput } from "@/lib/schema";
import mongoose from "mongoose";

const productFilter = (id: string) =>
  mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };

export const createProduct = async (product: CreateProductInput) => {
  return ProductModel.create(product as IProductDocument);
};

export const getAllProducts = async (search?: string) => {
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
        ],
      }
    : {};
  return ProductModel.find(filter).sort({ createdAt: -1 });
};

export const getProductById = async (id: string) => {
  return ProductModel.findOne(productFilter(id));
};

export const updateProductById = async (
  id: string,
  validatedData: Partial<CreateProductInput>,
) => {
  return ProductModel.findOneAndUpdate(productFilter(id), validatedData, {
    returnDocument: "after",
    runValidators: true,
  });
};

export const deleteProductById = async (id: string) => {
  return ProductModel.findOneAndDelete(productFilter(id));
};

export const validateProductsByIds = async (
  ids: string[],
): Promise<boolean> => {
  const uniqueIds = Array.from(new Set(ids));
  const foundProducts = await ProductModel.countDocuments({
    $or: [{ id: { $in: uniqueIds } }, { _id: { $in: uniqueIds } }],
  });
  return uniqueIds.length === foundProducts;
};

export type { IProductDocument };