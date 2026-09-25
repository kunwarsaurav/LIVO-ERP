import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().optional(),
  sku: z.string().default(`LIV-SKU-${Date.now().toString().slice(-4)}`),
  name: z.string().min(1, "Product name is required"),
  brand: z.string().default("Livo Signature"),
  category: z.string().default("Sofa"),
  subCategory: z.string().optional().default(""),
  modelNumber: z.string().default(`MDL-${Date.now().toString().slice(-4)}`),
  sizeDimensions: z.string().optional().default(""),
  colorFinish: z.string().optional().default(""),
  material: z.string().optional().default(""),
  purchasePrice: z.coerce.number().default(0),
  dealerPrice: z.coerce.number().default(0),
  sellingPrice: z.coerce.number().default(0),
  mrp: z.coerce.number().default(0),
  currentStock: z.coerce.number().default(0),
  reservedStock: z.coerce.number().default(0),
  minAlertStock: z.coerce.number().default(0),
  supplierId: z.string().optional().default(""),
  supplierName: z.string().optional().default(""),
  barcode: z.string().optional().default(""),
  warrantyYears: z.coerce.number().default(5),
  description: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  featuredInCatalogue: z.boolean().optional().default(true),
  specifications: z.array(z.string()).optional().default([]),
  customizable: z.boolean().optional().default(true),
});

export type CreateProductInput = z.infer<typeof ProductSchema>;

export const ProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project title is required"),
  subtitle: z.string().optional().default(""),
  location: z.string().optional().default(""),
  year: z.string().optional().default(""),
  category: z.string().min(1, "Category is required"),
  images: z.string().min(1, "At least one project photograph is required"),
  additionalImages: z.array(z.string()).default([]),
  description: z.string().optional().default(""),
  architect: z.string().optional().default(""),
  materialsUsed: z.array(z.string()).default([]),
});

export type CreateProjectInput = z.infer<typeof ProjectSchema>;

export const ShowroomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  room: z.string().min(1, "Room is required"),
  image: z.string().min(1, "Image is required"),
  description: z.string().min(1, "Description is required"),
  piecesFeatured: z.array(z.string()).default([]),
});
export type CreateShowroomInput = z.infer<typeof ShowroomSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const InquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const NewsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const passwordField = z
  .string({ error: "Password is required" })
  .min(6, "Password must be at least 6 characters long")
  .max(100, "Password is too long");

const authEmailField = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(1, "Email cannot be empty")
  .email("Invalid email address")
  .max(100, "Email is too long");

export const forgotPasswordSchema = z.object({
  email: authEmailField,
});

export const loginSchema = forgotPasswordSchema.extend({
  password: passwordField,
});

export const signupSchema = forgotPasswordSchema.extend({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name is too long"),
  password: passwordField,
  email: authEmailField.refine((email) => {
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
  }, "Please use a valid personal or educational email address (e.g., gmail, yahoo, .edu)"),
});

export const verifyOtpSchema = forgotPasswordSchema.extend({
  otp: z
    .string({ error: "OTP is required" })
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[a-zA-Z0-9]+$/, "OTP cannot contain special characters"),
});

export const resetPasswordSchema = z.object({
  email: authEmailField,
  newPassword: passwordField,
});
