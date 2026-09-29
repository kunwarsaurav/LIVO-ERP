import type { z } from "zod";
import type { productSchema } from "./schema";

export type Numeric = string;
export type Int8 = string;
export type Jsonb<T = unknown> = T;
export type Timestamptz = Date;
export type TextArray = string[];

export type SqlValue =
  | string
  | number
  | boolean
  | Date
  | null
  | string[]
  | Record<string, unknown>
  | unknown[];

export type SqlParams = SqlValue[];

export type SortDirection = "ASC" | "DESC";

export interface SqlFragment {
  text: string;
  values: SqlParams;
}

export const ORDER_STATUSES = [
  "Ordered",
  "In Production / Procurement",
  "Warehouse Ready",
  "Out for Delivery",
  "Installed & Signed Off",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_DEFAULT: OrderStatus = "Ordered";

export const INQUIRY_STATUSES = ["pending", "contacted", "completed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_DEFAULT: InquiryStatus = "pending";

export const PROJECT_TYPE_DEFAULT = "Custom Fitout";

export const PRODUCT_ROOMS = [
  "all",
  "lounge",
  "dining",
  "library",
  "bedroom",
] as const;
export type ProductRoom = (typeof PRODUCT_ROOMS)[number];

export const PRODUCT_ROOM_DEFAULT: ProductRoom = "all";

export const PRODUCT_BRAND_DEFAULT = "Livo Signature";
export const PRODUCT_CATEGORY_DEFAULT = "Sofa";
export const PRODUCT_WARRANTY_YEARS_DEFAULT = 5;

export interface ProductRow {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  sub_category: string;
  model_number: string;
  size_dimensions: string;
  color_finish: string;
  material: string;
  purchase_price: Numeric;
  dealer_price: Numeric;
  selling_price: Numeric;
  mrp: Numeric;
  current_stock: number;
  reserved_stock: number;
  min_alert_stock: number;
  supplier_id: string | null;
  supplier_name: string;
  barcode: string;
  warranty_years: number;
  description: string;
  image_url: string;
  featured_in_catalogue: boolean;
  customizable: boolean;
  specifications: TextArray;
  images: TextArray;
  price: Numeric | null;
  original_price: Numeric | null;
  dimensions: string;
  in_stock: boolean | null;
  room: string;
  is_popular: boolean;
  legacy_mongo_id: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  modelNumber: string;
  sizeDimensions: string;
  colorFinish: string;
  material: string;
  purchasePrice: number;
  dealerPrice: number;
  sellingPrice: number;
  mrp: number;
  currentStock: number;
  reservedStock: number;
  minAlertStock: number;
  supplierId: string | null;
  supplierName: string;
  barcode: string;
  warrantyYears: number;
  description: string;
  imageUrl: string;
  featuredInCatalogue: boolean;
  customizable: boolean;
  specifications: TextArray;
  images: TextArray;
  price: number | null;
  originalPrice: number | null;
  dimensions: string;
  inStock: boolean | null;
  room: string;
  isPopular: boolean;
  legacyMongoId: string | null;
  createdAt: Timestamptz;
  updatedAt: Timestamptz;
}

export type CreateProductInput = z.infer<typeof productSchema>;

export type UpdateProductInput = Partial<CreateProductInput>;

export interface OrderRow {
  id: string;
  order_number: string;
  quotation_id: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  project_type: string;
  order_date: Date | null;
  target_delivery_date: Date | null;
  total_amount: Numeric;
  amount_paid: Numeric;
  production_status: OrderStatus;
  delivery_address: string;
  items_raw: Jsonb<Record<string, unknown>[]>;
  legacy_mongo_id: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface Order {
  id: string;
  orderNumber: string;
  quotationId: string | null;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  projectType: string;
  orderDate: Date | null;
  targetDeliveryDate: Date | null;
  totalAmount: number;
  amountPaid: number;
  productionStatus: OrderStatus;
  deliveryAddress: string;
  itemsRaw: Record<string, unknown>[];
  legacyMongoId: string | null;
  createdAt: Timestamptz;
  updatedAt: Timestamptz;
}

export interface OrderItemRow {
  id: Int8;
  order_id: string;
  position: number;
  product_id: string | null;
  sku: string | null;
  name: string | null;
  quantity: number;
  dimensions: string | null;
  finish: string | null;
  selected_color: string | null;
  selected_material: string | null;
  unit_price: Numeric | null;
  payload: Jsonb<Record<string, unknown>>;
}

export interface OrderItem {
  id: number;
  orderId: string;
  position: number;
  productId: string | null;
  sku: string | null;
  name: string | null;
  quantity: number;
  dimensions: string | null;
  finish: string | null;
  selectedColor: string | null;
  selectedMaterial: string | null;
  unitPrice: number | null;
  payload: Record<string, unknown>;
}

export interface InquiryRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: Timestamptz | null;
  status: InquiryStatus;
  product_name: string;
  product_price: Numeric | null;
  message: string;
  total_amount: Numeric;
  items: Jsonb<Record<string, unknown>[]>;
  legacy_mongo_id: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: Timestamptz | null;
  status: InquiryStatus;
  productName: string;
  productPrice: number | null;
  message: string;
  totalAmount: number;
  items: Record<string, unknown>[];
  legacyMongoId: string | null;
  createdAt: Timestamptz;
  updatedAt: Timestamptz;
}

export interface ShowroomRow {
  id: string;
  name: string;
  room: string;
  image: string;
  description: string;
  pieces_featured: TextArray;
  legacy_mongo_id: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface Showroom {
  id: string;
  name: string;
  room: string;
  image: string;
  description: string;
  piecesFeatured: TextArray;
  legacyMongoId: string | null;
  createdAt: Timestamptz;
  updatedAt: Timestamptz;
}

export type ShowroomItem = Omit<Showroom, "legacyMongoId" | "createdAt" | "updatedAt">;

export interface ImageRow {
  id: Int8;
  legacy_mongo_id: string | null;
  cloudinary_public_id: string;
  url: string;
  mime_type: string;
  size_bytes: Int8;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface MediaImage {
  id: number;
  legacyMongoId: string | null;
  cloudinaryPublicId: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Timestamptz;
  updatedAt: Timestamptz;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ListParams {
  page: number;
  limit: number;
  offset: number;
  search: string;
  status?: string;
}

export const PAGINATION_DEFAULT_LIMIT = 10;
export const PAGINATION_MAX_LIMIT = 200;

export interface ProductListQuery extends ListParams {
  category?: string;
  room?: string;
  supplierId?: string;
  lowStockOnly?: boolean;
}

export interface ShowroomListQuery extends ListParams {
  room?: string;
}
