import { notFound } from "next/navigation";
import { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import ConfirmationClient from "@/components/ConfirmationClient";
import mongoose from "mongoose";
import { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

async function getOrder(id: string): Promise<Order | null> {
  try {
    await connectToDatabase();
    let orderDoc = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      orderDoc = await OrderModel.findById(id).lean();
    }

    if (!orderDoc) {
      orderDoc = await OrderModel.findOne({ orderNumber: id }).lean();
    }

    if (!orderDoc) return null;

    return {
      _id: orderDoc._id.toString(),
      orderNumber: orderDoc.orderNumber,
      customer: orderDoc.customer,
      deliveryMode: orderDoc.deliveryMode,
      items: orderDoc.items,
      subtotal: orderDoc.subtotal,
      shippingFee: orderDoc.shippingFee,
      total: orderDoc.total,
      status: orderDoc.status,
      createdAt: orderDoc.createdAt?.toISOString(),
      updatedAt: orderDoc.updatedAt?.toISOString(),
    };
  } catch (err) {
    console.error("Error retrieving order in confirmation page:", err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Confirmation Commande #${params.id} | FOUADstore`,
  };
}

export default async function ConfirmationPage({ params }: Props) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  return <ConfirmationClient order={order} />;
}
