import { notFound } from "next/navigation";
import { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import ProductDetailClient from "@/components/ProductDetailClient";
import mongoose from "mongoose";
import { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    await connectToDatabase();
    let productDoc = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      productDoc = await ProductModel.findById(id).lean();
    }

    if (!productDoc) {
      productDoc = await ProductModel.findOne({ slug: id }).lean();
    }

    if (!productDoc) return null;

    return {
      _id: productDoc._id.toString(),
      name: productDoc.name,
      nameAr: productDoc.nameAr,
      slug: productDoc.slug,
      description: productDoc.description,
      descriptionAr: productDoc.descriptionAr,
      price: productDoc.price,
      promoPrice: productDoc.promoPrice,
      images: productDoc.images || [],
      stock: productDoc.stock,
      category: productDoc.category,
      variants: productDoc.variants,
      createdAt: productDoc.createdAt?.toISOString(),
      updatedAt: productDoc.updatedAt?.toISOString(),
    };
  } catch (err) {
    console.error("Error retrieving product:", err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) {
    return {
      title: "Produit non trouvé | FOUADstore",
    };
  }
  return {
    title: `${product.name} | FOUADstore`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} - ${product.price} DA | FOUADstore`,
      description: product.description.slice(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
