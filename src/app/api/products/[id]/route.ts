import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await ProductModel.findById(id).lean();
    }

    if (!product) {
      product = await ProductModel.findOne({ slug: id }).lean();
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    let query: Record<string, unknown> = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const existing = await ProductModel.findOne(query);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Produit introuvable." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.nameAr !== undefined) updateData.nameAr = body.nameAr.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.descriptionAr !== undefined) updateData.descriptionAr = body.descriptionAr.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();

    if (body.price !== undefined) {
      const priceNum = Number(body.price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json({ success: false, error: "Prix invalide." }, { status: 400 });
      }
      updateData.price = priceNum;
    }

    if (body.promoPrice !== undefined) {
      if (body.promoPrice === null || body.promoPrice === "" || Number(body.promoPrice) <= 0) {
        updateData.$unset = { promoPrice: 1 };
      } else {
        updateData.promoPrice = Number(body.promoPrice);
      }
    }

    if (body.stock !== undefined) {
      const stockNum = Number(body.stock);
      if (isNaN(stockNum) || stockNum < 0) {
        return NextResponse.json({ success: false, error: "Stock invalide." }, { status: 400 });
      }
      updateData.stock = stockNum;
    }

    if (Array.isArray(body.images)) {
      const cleanImgs = body.images
        .map((img: unknown) => (typeof img === "string" ? img.trim() : ""))
        .filter((img: string) => img.length > 0);
      if (cleanImgs.length > 0) {
        updateData.images = cleanImgs;
      }
    }

    if (body.variants !== undefined) {
      updateData.variants = {
        sizes: Array.isArray(body.variants.sizes) ? body.variants.sizes.filter(Boolean) : [],
        colors: Array.isArray(body.variants.colors) ? body.variants.colors.filter((c: { name?: string }) => Boolean(c?.name)) : [],
      };
    }

    const updatedProduct = await ProductModel.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: "Produit mis à jour avec succès.",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du produit." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    let query: Record<string, unknown> = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const deleted = await ProductModel.findOneAndDelete(query);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Produit introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Le produit "${deleted.name}" a été supprimé.`,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du produit." },
      { status: 500 }
    );
  }
}
