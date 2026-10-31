import mongoose, { Schema, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image: string;
  itemTotal: number;
}

export interface IOrderCustomer {
  fullName: string;
  phone: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  address: string;
  note?: string;
}

export interface IOrderDocument extends mongoose.Document {
  orderNumber: string;
  customer: IOrderCustomer;
  deliveryMode: "domicile" | "bureau";
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "en attente" | "confirmée" | "expédiée" | "livrée" | "annulée";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      wilayaCode: { type: String, required: true },
      wilayaName: { type: String, required: true },
      commune: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      note: { type: String, trim: true },
    },
    deliveryMode: {
      type: String,
      enum: ["domicile", "bureau"],
      default: "domicile",
      required: true,
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        selectedSize: { type: String },
        selectedColor: { type: String },
        image: { type: String },
        itemTotal: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["en attente", "confirmée", "expédiée", "livrée", "annulée"],
      default: "en attente",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);
