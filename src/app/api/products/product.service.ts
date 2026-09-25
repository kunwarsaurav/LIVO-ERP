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
    id: product.sku || product.id,
    warranty: product.warrantyYears ? `${product.warrantyYears} Years` : undefined,
    colors: product.colorFinish ? [`${product.colorFinish}|#000000`] : [],
    reservedStock: 0,
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
  const products = await ProductModel.find(filter).sort({ createdAt: -1 }).lean();
  
  // Map Website fields backwards into ERP fields so website-added products show up properly in the ERP
  return products.map(p => ({
    ...p,
    sellingPrice: p.sellingPrice || p.price || 0,
    mrp: p.mrp || p.originalPrice || 0,
    imageUrl: p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : ""),
    sizeDimensions: p.sizeDimensions || p.dimensions || "",
    currentStock: p.currentStock !== undefined ? p.currentStock : (p.inStock ? 5 : 0),
    sku: p.sku || p.id || p._id?.toString(),
    barcode: p.barcode || p.sku || p.id || p._id?.toString()
  }));
};

export const getProductById = async (id: string) => {
  const p = await ProductModel.findOne(productFilter(id)).lean();
  if (!p) return null;
  return {
    ...p,
    sellingPrice: p.sellingPrice || p.price || 0,
    mrp: p.mrp || p.originalPrice || 0,
    imageUrl: p.imageUrl || (p.images && p.images.length > 0 ? p.images[0] : ""),
    sizeDimensions: p.sizeDimensions || p.dimensions || "",
    currentStock: p.currentStock !== undefined ? p.currentStock : (p.inStock ? 5 : 0),
    sku: p.sku || p.id || p._id?.toString(),
    barcode: p.barcode || p.sku || p.id || p._id?.toString()
  };
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
  if (validatedData.sku !== undefined) mappedUpdate.id = validatedData.sku;
  if (validatedData.warrantyYears !== undefined) mappedUpdate.warranty = validatedData.warrantyYears ? `${validatedData.warrantyYears} Years` : undefined;
  if (validatedData.colorFinish !== undefined) mappedUpdate.colors = validatedData.colorFinish ? [`${validatedData.colorFinish}|#000000`] : [];

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