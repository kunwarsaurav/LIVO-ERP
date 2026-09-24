export type ProductRoom = "all" | "lounge" | "dining" | "library" | "bedroom";

export interface Product {
  id?: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  purchasePrice?: number;
  dealerRate?: number;
  stockCount: number;
  lowStockThreshold: number;
  description: string;
  longDescription: string;
  image: string;
  materials: string[];
  colors: string[];
  dimensions: string;
  warranty: string;
  isPopular: boolean;
  isCustomizable?: boolean;
  inStock: boolean;
  leadTime: string;
  features: string[];
  subtitle: string;
  room?: ProductRoom;
}