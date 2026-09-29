import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  INQUIRY_STATUS_DEFAULT,
  INQUIRY_STATUSES,
  ORDER_STATUS_DEFAULT,
  ORDER_STATUSES,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  PRODUCT_BRAND_DEFAULT,
  PRODUCT_CATEGORY_DEFAULT,
  PRODUCT_ROOMS,
  PRODUCT_ROOM_DEFAULT,
  PRODUCT_WARRANTY_YEARS_DEFAULT,
  PROJECT_TYPE_DEFAULT,
} from "./types";
import type {
  CreateProductInput,
  ImageRow,
  Inquiry,
  InquiryRow,
  MediaImage,
  Order,
  OrderItem,
  OrderItemRow,
  OrderRow,
  Product,
  ProductRow,
  Showroom,
  ShowroomRow,
  UpdateProductInput,
} from "./types";

const parsePgTextArray = (value: string): string[] => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return trimmed ? [trimmed] : [];
  }
  const body = trimmed.slice(1, -1);
  const out: string[] = [];
  let current = "";
  let quoted = false;
  let escaped = false;
  for (const char of body) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      if (current !== "") out.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current !== "") out.push(current);
  return out;
};

const textArray = z
  .union([z.array(z.string()), z.string()])
  .transform((value) => (Array.isArray(value) ? value : parsePgTextArray(value)))
  .default([]);

const writeTextArray = z.array(z.string().trim().min(1)).default([]);

const money = z.union([z.number(), z.string()]).transform(Number);

const nullableMoney = z
  .union([z.number(), z.string(), z.null()])
  .transform((value) => (value === null ? null : Number(value)));

const nonNegativeMoney = money
  .refine((value) => Number.isFinite(value) && value >= 0, {
    message: "Amount must be zero or greater",
  })
  .default(0);

const nonNegativeNullableMoney = nullableMoney.refine(
  (value) => value === null || (Number.isFinite(value) && value >= 0),
  { message: "Amount must be zero or greater" },
);

const integer = z
  .union([z.number(), z.string()])
  .transform(Number)
  .refine((value) => Number.isInteger(value), { message: "Value must be a whole number" });

const nonNegativeInteger = integer
  .refine((value) => value >= 0, { message: "Value must be zero or greater" })
  .default(0);

const bigintToNumber = z
  .union([z.string(), z.number(), z.bigint()])
  .transform((value) => Number(value))
  .refine((value) => Number.isSafeInteger(value), {
    message: "Value exceeds the safe integer range",
  });

const timestamp = z
  .union([z.date(), z.string()])
  .transform((value) => new Date(value))
  .refine((value) => !Number.isNaN(value.getTime()), { message: "Invalid timestamp" });

const nullableTimestamp = z
  .union([z.date(), z.string(), z.null()])
  .transform((value) => (value === null ? null : new Date(value)))
  .refine(
    (value) => value === null || !Number.isNaN(value.getTime()),
    { message: "Invalid timestamp" },
  );

const jsonbArray = z
  .union([z.array(z.record(z.string(), z.unknown())), z.string()])
  .transform((value) => {
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

const jsonbObject = z
  .union([z.record(z.string(), z.unknown()), z.string()])
  .transform((value) => {
    if (typeof value !== "string") return value;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

const requiredText = z
  .string({ error: "This field is required" })
  .trim()
  .min(1, "This field is required");

const optionalText = (fallback = "") => z.string().trim().default(fallback);

const nullableText = z
  .union([z.string(), z.null()])
  .transform((value) => (value === null ? null : value.trim()));

const flag = (fallback: boolean) => z.boolean().default(fallback);

const nullableFlag = z.boolean().nullable().default(null);

const json = z
  .union([z.record(z.string(), z.unknown()), z.null()])
  .default(null);

export const generateBusinessId = (prefix = "LIV") =>
  `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const generateSku = () => `LIV-SKU-${randomUUID().slice(0, 6).toUpperCase()}`;

export const generateModelNumber = () =>
  `MDL-${randomUUID().slice(0, 6).toUpperCase()}`;

export const escapeLike = (term: string) =>
  term.replace(/[\\%_]/g, (match) => `\\${match}`);

export const ilikePattern = (term: string) => `%${escapeLike(term)}%`;

export const PRODUCT_TABLE = "products";
export const ORDERS_TABLE = "orders";
export const ORDER_ITEMS_TABLE = "order_items";
export const INQUIRIES_TABLE = "inquiries";
export const SHOWROOMS_TABLE = "showrooms";
export const IMAGES_TABLE = "images";

export const productRowSchema = z.object({
  id: z.string(),
  sku: optionalText(),
  name: requiredText,
  brand: optionalText(PRODUCT_BRAND_DEFAULT),
  category: optionalText(PRODUCT_CATEGORY_DEFAULT),
  sub_category: optionalText(),
  model_number: optionalText(),
  size_dimensions: optionalText(),
  color_finish: optionalText(),
  material: optionalText(),
  purchase_price: nonNegativeMoney,
  dealer_price: nonNegativeMoney,
  selling_price: nonNegativeMoney,
  mrp: nonNegativeMoney,
  current_stock: nonNegativeInteger,
  reserved_stock: nonNegativeInteger,
  min_alert_stock: nonNegativeInteger,
  supplier_id: nullableText,
  supplier_name: optionalText(),
  barcode: optionalText(),
  warranty_years: integer.default(PRODUCT_WARRANTY_YEARS_DEFAULT),
  description: optionalText(),
  image_url: optionalText(),
  featured_in_catalogue: flag(true),
  customizable: flag(true),
  specifications: textArray,
  images: textArray,
  price: nonNegativeNullableMoney,
  original_price: nonNegativeNullableMoney,
  dimensions: optionalText(),
  in_stock: nullableFlag,
  room: z.enum(PRODUCT_ROOMS).default(PRODUCT_ROOM_DEFAULT),
  is_popular: z.boolean().default(false),
  legacy_mongo_id: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
});

export const productSchema = z.object({
  id: z.string().trim().min(1).optional(),
  sku: optionalText(),
  name: requiredText,
  brand: optionalText(PRODUCT_BRAND_DEFAULT),
  category: optionalText(PRODUCT_CATEGORY_DEFAULT),
  subCategory: optionalText(),
  room: z.string().trim().default(PRODUCT_ROOM_DEFAULT),
  modelNumber: optionalText(),
  sizeDimensions: optionalText(),
  colorFinish: optionalText(),
  material: optionalText(),
  purchasePrice: nonNegativeMoney,
  dealerPrice: nonNegativeMoney,
  sellingPrice: nonNegativeMoney,
  mrp: nonNegativeMoney,
  currentStock: nonNegativeInteger,
  reservedStock: nonNegativeInteger,
  minAlertStock: nonNegativeInteger,
  supplierId: nullableText.optional(),
  supplierName: optionalText(),
  barcode: optionalText(),
  warrantyYears: integer.default(PRODUCT_WARRANTY_YEARS_DEFAULT),
  description: optionalText(),
  imageUrl: optionalText(),
  images: writeTextArray.optional(),
  featuredInCatalogue: flag(true),
  specifications: writeTextArray,
  customizable: flag(true),
  price: nonNegativeNullableMoney.optional(),
  originalPrice: nonNegativeNullableMoney.optional(),
  dimensions: optionalText(),
  inStock: z.boolean().nullable().optional(),
  isPopular: z.boolean().optional(),
  legacyMongoId: nullableText.optional(),
});

export const productUpdateSchema = productSchema.partial();

export const orderRowSchema = z.object({
  id: z.string(),
  order_number: optionalText(),
  quotation_id: nullableText,
  customer_id: nullableText,
  customer_name: requiredText,
  customer_phone: optionalText(),
  customer_email: optionalText(),
  project_type: optionalText(PROJECT_TYPE_DEFAULT),
  order_date: nullableTimestamp,
  target_delivery_date: nullableTimestamp,
  total_amount: nonNegativeMoney,
  amount_paid: nonNegativeMoney,
  production_status: z.enum(ORDER_STATUSES).default(ORDER_STATUS_DEFAULT),
  delivery_address: optionalText(),
  items_raw: jsonbArray.default([]),
  legacy_mongo_id: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
});

export const orderSchema = z.object({
  id: z.string().trim().min(1).optional(),
  orderNumber: optionalText(),
  quotationId: nullableText.optional(),
  customerId: nullableText.optional(),
  customerName: requiredText,
  customerPhone: optionalText(),
  customerEmail: optionalText(),
  projectType: optionalText(PROJECT_TYPE_DEFAULT),
  orderDate: nullableTimestamp.optional(),
  targetDeliveryDate: nullableTimestamp.optional(),
  totalAmount: nonNegativeMoney,
  amountPaid: nonNegativeMoney,
  productionStatus: z.enum(ORDER_STATUSES).default(ORDER_STATUS_DEFAULT),
  deliveryAddress: optionalText(),
  itemsRaw: writeTextArray.optional(),
  legacyMongoId: nullableText.optional(),
});

export const orderStatusUpdateSchema = z.object({
  productionStatus: z.enum(ORDER_STATUSES),
});

export const orderItemRowSchema = z.object({
  id: bigintToNumber,
  order_id: z.string(),
  position: integer,
  product_id: nullableText,
  sku: nullableText,
  name: nullableText,
  quantity: nonNegativeInteger,
  dimensions: nullableText,
  finish: nullableText,
  selected_color: nullableText,
  selected_material: nullableText,
  unit_price: nonNegativeNullableMoney,
  payload: jsonbObject.default({}),
});

export const orderItemSchema = z.object({
  orderId: z.string().trim().min(1),
  position: integer.default(0),
  productId: nullableText.optional(),
  sku: nullableText.optional(),
  name: nullableText.optional(),
  quantity: nonNegativeInteger,
  dimensions: nullableText.optional(),
  finish: nullableText.optional(),
  selectedColor: nullableText.optional(),
  selectedMaterial: nullableText.optional(),
  unitPrice: nonNegativeNullableMoney.optional(),
  payload: json,
});

export const inquiryRowSchema = z.object({
  id: z.string(),
  name: requiredText,
  phone: requiredText,
  email: optionalText(),
  date: nullableTimestamp,
  status: z.enum(INQUIRY_STATUSES).default(INQUIRY_STATUS_DEFAULT),
  product_name: optionalText(),
  product_price: nonNegativeNullableMoney,
  message: optionalText(),
  total_amount: nonNegativeMoney,
  items: jsonbArray.default([]),
  legacy_mongo_id: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
});

export const inquirySchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z.union([z.email("Invalid email address"), z.literal("")]).optional(),
  date: nullableTimestamp.optional(),
  status: z.enum(INQUIRY_STATUSES).default(INQUIRY_STATUS_DEFAULT),
  productName: optionalText(),
  productPrice: nonNegativeNullableMoney.optional(),
  message: optionalText(),
  totalAmount: nonNegativeMoney,
  items: writeTextArray.optional(),
  legacyMongoId: nullableText.optional(),
});

export const inquiryStatusUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
});

export const showroomRowSchema = z.object({
  id: z.string(),
  name: requiredText,
  room: requiredText,
  image: requiredText,
  description: requiredText,
  pieces_featured: textArray,
  legacy_mongo_id: nullableText,
  created_at: timestamp,
  updated_at: timestamp,
});

export const showroomSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: requiredText,
  room: requiredText,
  image: requiredText,
  description: requiredText,
  piecesFeatured: writeTextArray,
  legacyMongoId: nullableText.optional(),
});

export const imageRowSchema = z.object({
  id: bigintToNumber,
  legacy_mongo_id: nullableText,
  cloudinary_public_id: requiredText,
  url: requiredText,
  mime_type: requiredText,
  size_bytes: bigintToNumber,
  created_at: timestamp,
  updated_at: timestamp,
});

export const imageSchema = z.object({
  cloudinaryPublicId: requiredText,
  url: requiredText,
  mimeType: requiredText,
  sizeBytes: integer.default(0),
  legacyMongoId: nullableText.optional(),
});

export const projectSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: requiredText,
  subtitle: optionalText(),
  location: optionalText(),
  year: optionalText(),
  category: requiredText,
  images: z.string().trim().min(1, "At least one project photograph is required"),
  additionalImages: writeTextArray,
  description: optionalText(),
  architect: optionalText(),
  materialsUsed: writeTextArray,
});

export const listParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_MAX_LIMIT)
    .default(PAGINATION_DEFAULT_LIMIT),
  search: z.string().trim().default(""),
  status: z.string().trim().optional(),
});

export const productListParamsSchema = listParamsSchema.extend({
  category: z.string().trim().optional(),
  room: z.enum(PRODUCT_ROOMS).optional(),
  supplierId: z.string().trim().optional(),
  lowStockOnly: z
    .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
    .transform((value) => value === true || value === "true" || value === "1")
    .optional(),
});

export const showroomListParamsSchema = listParamsSchema.extend({
  room: z.string().trim().optional(),
});

export const passwordField = z
  .string({ error: "Password is required" })
  .min(6, "Password must be at least 6 characters long")
  .max(100, "Password is too long");

export const authEmailField = z
  .email("Invalid email address")
  .trim()
  .toLowerCase()
  .max(100, "Email is too long");

export const forgotPasswordSchema = z.object({
  email: authEmailField,
});

export const loginSchema = forgotPasswordSchema.extend({
  password: passwordField,
});

export const signupSchema = loginSchema.extend({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name is too long"),
  email: authEmailField.refine(
    (email) => {
      const domain = email.split("@")[1]?.toLowerCase() || "";
      const allowedDomains = [
        "gmail.com",
        "yahoo.com",
        "hotmail.com",
        "outlook.com",
        "icloud.com",
      ];
      return (
        allowedDomains.includes(domain) ||
        domain.endsWith(".edu") ||
        domain.endsWith(".edu.np")
      );
    },
    "Please use a valid personal or educational email address (e.g., gmail, yahoo, .edu)",
  ),
});

export const verifyOtpSchema = forgotPasswordSchema.extend({
  otp: z
    .string({ error: "OTP is required" })
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[a-zA-Z0-9]+$/, "OTP cannot contain special characters"),
});

export const resetPasswordSchema = forgotPasswordSchema.extend({
  newPassword: passwordField,
});

export const newsletterSchema = z.object({
  email: z.email("Invalid email address"),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export function productRowToEntity(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category: row.category,
    subCategory: row.sub_category,
    modelNumber: row.model_number,
    sizeDimensions: row.size_dimensions,
    colorFinish: row.color_finish,
    material: row.material,
    purchasePrice: Number(row.purchase_price),
    dealerPrice: Number(row.dealer_price),
    sellingPrice: Number(row.selling_price),
    mrp: Number(row.mrp),
    currentStock: Number(row.current_stock),
    reservedStock: Number(row.reserved_stock),
    minAlertStock: Number(row.min_alert_stock),
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    barcode: row.barcode,
    warrantyYears: Number(row.warranty_years),
    description: row.description,
    imageUrl: row.image_url,
    featuredInCatalogue: row.featured_in_catalogue,
    customizable: row.customizable,
    specifications: row.specifications,
    images: row.images,
    price: row.price === null ? null : Number(row.price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    dimensions: row.dimensions,
    inStock: row.in_stock,
    room: row.room,
    isPopular: row.is_popular,
    legacyMongoId: row.legacy_mongo_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function productInputToRow(input: CreateProductInput) {
  const sellingPrice = input.sellingPrice ?? 0;
  const mrp = input.mrp ?? 0;
  const currentStock = input.currentStock ?? 0;

  return {
    id: input.id ?? generateBusinessId(),
    sku: input.sku ?? generateSku(),
    name: input.name,
    brand: input.brand ?? PRODUCT_BRAND_DEFAULT,
    category: input.category ?? PRODUCT_CATEGORY_DEFAULT,
    sub_category: input.subCategory ?? "",
    model_number: input.modelNumber ?? generateModelNumber(),
    size_dimensions: input.sizeDimensions ?? "",
    color_finish: input.colorFinish ?? "",
    material: input.material ?? "",
    purchase_price: input.purchasePrice ?? 0,
    dealer_price: input.dealerPrice ?? 0,
    selling_price: sellingPrice,
    mrp,
    current_stock: currentStock,
    reserved_stock: input.reservedStock ?? 0,
    min_alert_stock: input.minAlertStock ?? 0,
    supplier_id: input.supplierId ?? null,
    supplier_name: input.supplierName ?? "",
    barcode: input.barcode ?? input.sku ?? "",
    warranty_years: input.warrantyYears ?? PRODUCT_WARRANTY_YEARS_DEFAULT,
    description: input.description ?? "",
    image_url: input.imageUrl ?? "",
    featured_in_catalogue: input.featuredInCatalogue ?? true,
    customizable: input.customizable ?? true,
    specifications: input.specifications ?? [],
    images: input.images?.length
      ? input.images
      : input.imageUrl
        ? [input.imageUrl]
        : [],
    price: input.price ?? sellingPrice,
    original_price: input.originalPrice ?? mrp,
    dimensions: input.dimensions ?? input.sizeDimensions ?? "",
    in_stock: input.inStock ?? currentStock > 0,
    room: input.room ?? PRODUCT_ROOM_DEFAULT,
    is_popular: input.isPopular ?? false,
    legacy_mongo_id: input.legacyMongoId ?? null,
  };
}

export function productUpdateToRow(input: UpdateProductInput) {
  const row: Record<string, unknown> = {};

  const assign = (column: string, value: unknown) => {
    if (value !== undefined) row[column] = value;
  };

  assign("id", input.id);
  assign("sku", input.sku);
  assign("name", input.name);
  assign("brand", input.brand);
  assign("category", input.category);
  assign("sub_category", input.subCategory);
  assign("model_number", input.modelNumber);
  assign("size_dimensions", input.sizeDimensions);
  assign("color_finish", input.colorFinish);
  assign("material", input.material);
  assign("purchase_price", input.purchasePrice);
  assign("dealer_price", input.dealerPrice);
  assign("mrp", input.mrp);
  assign("current_stock", input.currentStock);
  assign("reserved_stock", input.reservedStock);
  assign("min_alert_stock", input.minAlertStock);
  assign("supplier_id", input.supplierId);
  assign("supplier_name", input.supplierName);
  assign("barcode", input.barcode);
  assign("warranty_years", input.warrantyYears);
  assign("description", input.description);
  assign("image_url", input.imageUrl);
  assign("featured_in_catalogue", input.featuredInCatalogue);
  assign("customizable", input.customizable);
  assign("specifications", input.specifications);
  assign("dimensions", input.dimensions);
  assign("room", input.room);
  assign("is_popular", input.isPopular);
  assign("legacy_mongo_id", input.legacyMongoId);

  if (input.images !== undefined) {
    row.images = input.images.length ? input.images : input.imageUrl ? [input.imageUrl] : [];
  }
  if (input.sellingPrice !== undefined) {
    row.selling_price = input.sellingPrice;
    row.price = input.sellingPrice;
  } else if (input.price !== undefined) {
    row.price = input.price;
  }
  if (input.mrp !== undefined) {
    row.original_price = input.mrp;
  } else if (input.originalPrice !== undefined) {
    row.original_price = input.originalPrice;
  }
  if (input.inStock !== undefined) {
    row.in_stock = input.inStock;
  } else if (input.currentStock !== undefined) {
    row.in_stock = input.currentStock > 0;
  }

  return row;
}

export function orderRowToEntity(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    quotationId: row.quotation_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    projectType: row.project_type,
    orderDate: row.order_date,
    targetDeliveryDate: row.target_delivery_date,
    totalAmount: Number(row.total_amount),
    amountPaid: Number(row.amount_paid),
    productionStatus: row.production_status,
    deliveryAddress: row.delivery_address,
    itemsRaw: row.items_raw,
    legacyMongoId: row.legacy_mongo_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function orderItemRowToEntity(row: OrderItemRow): OrderItem {
  return {
    id: Number(row.id),
    orderId: row.order_id,
    position: Number(row.position),
    productId: row.product_id,
    sku: row.sku,
    name: row.name,
    quantity: Number(row.quantity),
    dimensions: row.dimensions,
    finish: row.finish,
    selectedColor: row.selected_color,
    selectedMaterial: row.selected_material,
    unitPrice: row.unit_price === null ? null : Number(row.unit_price),
    payload: row.payload,
  };
}

export function inquiryRowToEntity(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    date: row.date,
    status: row.status,
    productName: row.product_name,
    productPrice: row.product_price === null ? null : Number(row.product_price),
    message: row.message,
    totalAmount: Number(row.total_amount),
    items: row.items,
    legacyMongoId: row.legacy_mongo_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function showroomRowToEntity(row: ShowroomRow): Showroom {
  return {
    id: row.id,
    name: row.name,
    room: row.room,
    image: row.image,
    description: row.description,
    piecesFeatured: row.pieces_featured,
    legacyMongoId: row.legacy_mongo_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function imageRowToEntity(row: ImageRow): MediaImage {
  return {
    id: Number(row.id),
    legacyMongoId: row.legacy_mongo_id,
    cloudinaryPublicId: row.cloudinary_public_id,
    url: row.url,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
