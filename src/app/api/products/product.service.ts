import { ProductModel, IProductDocument } from "./product.model";
import { CreateProductInput } from "@/lib/schema";
import mongoose from "mongoose";

const productFilter = (id: string) =>
  mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };

export const createProduct = async (product: CreateProductInput) => {
  // Map ERP fields to Website-compatible fields automatically
  const mappedProduct = {
    ...product,
    price: product.sellingPrice,
    originalPrice: product.mrp,
    images: product.imageUrl ? [product.imageUrl] : [],
    dimensions: product.sizeDimensions || "",
    inStock: (product.currentStock || 0) > 0,
    room: "all", // Required by website
  };
  
  return ProductModel.create(mappedProduct as IProductDocument);
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
  // Map ERP fields to Website-compatible fields during updates too
  const mappedUpdate: any = { ...validatedData };
  if (validatedData.sellingPrice !== undefined) mappedUpdate.price = validatedData.sellingPrice;
  if (validatedData.mrp !== undefined) mappedUpdate.originalPrice = validatedData.mrp;
  if (validatedData.imageUrl !== undefined) mappedUpdate.images = validatedData.imageUrl ? [validatedData.imageUrl] : [];
  if (validatedData.sizeDimensions !== undefined) mappedUpdate.dimensions = validatedData.sizeDimensions;
  if (validatedData.currentStock !== undefined) mappedUpdate.inStock = validatedData.currentStock > 0;

  return ProductModel.findOneAndUpdate(productFilter(id), mappedUpdate, {
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