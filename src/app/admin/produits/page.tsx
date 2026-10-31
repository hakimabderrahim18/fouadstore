import React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import ProductManagementClient from "@/components/admin/ProductManagementClient";
import { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestion des Produits | FOUADstore Admin",
  description: "Contrôlez vos produits, prix et stocks",
};

async function getAdminProductsData() {
  try {
    await connectToDatabase();

    const [productsDoc, categories] = await Promise.all([
      ProductModel.find().sort({ createdAt: -1 }).lean(),
      ProductModel.distinct("category"),
    ]);

    const products: Product[] = productsDoc.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      nameAr: p.nameAr,
      slug: p.slug,
      description: p.description,
      descriptionAr: p.descriptionAr,
      price: p.price,
      promoPrice: p.promoPrice,
      images: p.images || [],
      stock: p.stock,
      category: p.category,
      variants: p.variants,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));

    const cleanCategories = categories.filter((c): c is string => Boolean(c));

    return {
      products,
      categories: cleanCategories,
    };
  } catch (err) {
    console.error("Error fetching admin products:", err);
    return {
      products: [],
      categories: [],
    };
  }
}

export default async function AdminProductsPage() {
  const { products, categories } = await getAdminProductsData();

  return (
    <ProductManagementClient
      initialProducts={products}
      categories={categories}
    />
  );
}
