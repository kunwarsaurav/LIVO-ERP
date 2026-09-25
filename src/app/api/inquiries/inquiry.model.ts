import mongoose, { Schema, Document, Model } from 'mongoose';

export interface InquiryCartItem {
  name?: string;
  quantity?: number;
  price?: number;
  productId?: string;
  [key: string]: unknown;
}

export interface IInquiryDocument extends Document {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  status: 'pending' | 'contacted' | 'completed';
  productName?: string;
  productPrice?: number;
  message?: string;
  items?: InquiryCartItem[];
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    date: { type: String, default: () => new Date().toISOString() },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'completed'],
      default: 'pending',
      index: true,
    },
    productName: { type: String, default: '' },
    productPrice: { type: Number },
    message: { type: String, default: '' },
    items: { type: Array, default: [] },
    totalAmount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const InquiryModel: Model<IInquiryDocument> =
  mongoose.models.Inquiry || mongoose.model<IInquiryDocument>('Inquiry', InquirySchema);

export default InquiryModel;
