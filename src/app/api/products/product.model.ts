import mongoose, { Schema, Document, Model } from "mongoose";
import { Product as ProductType } from "@/types";

export interface IProductDocument extends Omit<ProductType, "id">, Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    sku: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "Livo Signature" },
    category: { type: String, default: "Sofa", index: true },
    subCategory: { type: String, default: "" },
    modelNumber: { type: String, default: "" },
    sizeDimensions: { type: String, default: "" },
    colorFinish: { type: String, default: "" },
    material: { type: String, default: "" },
    purchasePrice: { type: Number, default: 0 },
    dealerPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    minAlertStock: { type: Number, default: 0 },
    supplierId: { type: String, default: "" },
    supplierName: { type: String, default: "" },
    barcode: { type: String, default: "" },
    warrantyYears: { type: Number, default: 5 },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    featuredInCatalogue: { type: Boolean, default: true },
    specifications: { type: [String], default: [] },
    customizable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        if (!ret.id && ret._id) {
          ret.id = String(ret._id);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Prevent mongoose model overwrite in hot reload
export const ProductModel: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>("Product", ProductSchema);

export default ProductModel;