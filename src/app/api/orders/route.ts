import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FS-${year}${month}${day}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { customer, deliveryMode, items, subtotal, shippingFee, total, lang } = body;

    // Validation
    if (!customer || !customer.fullName || !customer.phone || !customer.wilayaName || !customer.commune || !customer.address) {
      return NextResponse.json(
        { success: false, error: "Toutes les informations client obligatoires doivent être renseignées." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Le panier est vide." },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    const newOrder = await OrderModel.create({
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        wilayaCode: customer.wilayaCode,
        wilayaName: customer.wilayaName,
        commune: customer.commune.trim(),
        address: customer.address.trim(),
        note: customer.note ? customer.note.trim() : "",
      },
      deliveryMode: deliveryMode === "bureau" ? "bureau" : "domicile",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || undefined,
        selectedColor: item.selectedColor || undefined,
        image: item.image,
        itemTotal: item.price * item.quantity,
      })),
      subtotal,
      shippingFee,
      total,
      status: "en attente",
    });

    const plainOrder: Order = {
      _id: newOrder._id.toString(),
      orderNumber: newOrder.orderNumber,
      customer: newOrder.customer,
      deliveryMode: newOrder.deliveryMode,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      shippingFee: newOrder.shippingFee,
      total: newOrder.total,
      status: newOrder.status,
      createdAt: newOrder.createdAt.toISOString(),
      updatedAt: newOrder.updatedAt.toISOString(),
    };

    const whatsappUrl = buildWhatsAppUrl(plainOrder, lang === "ar" ? "ar" : "fr");

    return NextResponse.json({
      success: true,
      order: plainOrder,
      whatsappUrl,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enregistrement de la commande." },
      { status: 500 }
    );
  }
}
