import mongoose, { Schema, Model } from "mongoose";

export interface IProductDocument extends mongoose.Document {
  name: string;
  nameAr?: string;
  slug: string;
  description: string;
  descriptionAr?: string;
  price: number;
  promoPrice?: number;
  images: string[];
  stock: number;
  category?: string;
  variants?: {
    sizes?: string[];
    colors?: { name: string; hex?: string }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    descriptionAr: { type: String },
    price: { type: Number, required: true, min: 0 },
    promoPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: String, trim: true },
    variants: {
      sizes: { type: [String], default: [] },
      colors: [
        {
          name: { type: String },
          hex: { type: String },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const ProductModel: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);
