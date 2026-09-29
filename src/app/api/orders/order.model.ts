import mongoose, { Schema, Document, Model } from 'mongoose';
import { SalesOrder } from '@/types';

export interface IOrderDocument
  extends Omit<SalesOrder, 'id' | 'createdAt' | 'updatedAt'>,
    Document {
  id: string;
  customerPhone?: string;
  customerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, default: '', trim: true, index: true },
    quotationId: { type: String, default: '' },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, default: '', trim: true },
    customerEmail: { type: String, default: '', trim: true },
    projectType: { type: String, default: 'Custom Fitout' },
    orderDate: { type: String, default: '' },
    targetDeliveryDate: { type: String, default: '' },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    productionStatus: {
      type: String,
      enum: [
        'Ordered',
        'In Production / Procurement',
        'Warehouse Ready',
        'Out for Delivery',
        'Installed & Signed Off',
      ],
      default: 'Ordered',
      index: true,
    },
    deliveryAddress: { type: String, default: '' },
    items: { type: [], default: [] },
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
  }
);

// Prevent mongoose model overwrite in hot reload
export const OrderModel: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export default OrderModel;