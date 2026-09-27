import mongoose, { Schema, Document, Model } from 'mongoose';
import { ShowroomItem } from '@/lib/types';

export interface IShowroomDocument extends Omit<ShowroomItem, 'id'>, Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShowroomSchema = new Schema<IShowroomDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    piecesFeatured: { type: [String], default: [] },
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
export const ShowroomModel: Model<IShowroomDocument> =
  mongoose.models.Showroom || mongoose.model<IShowroomDocument>('Showroom', ShowroomSchema);

export default ShowroomModel;
