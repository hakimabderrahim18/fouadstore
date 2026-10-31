import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { initialProducts } from "@/lib/seed-data";
import HomeProductGrid from "@/components/HomeProductGrid";
import { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getInitialProducts() {
  try {
    await connectToDatabase();
    const count = await ProductModel.countDocuments();
    if (count === 0) {
      await ProductModel.insertMany(initialProducts);
    }

    const limit = 12;
    const total = await ProductModel.countDocuments();
    const productsDoc = await ProductModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Serialize MongoDB objects
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

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        page: 1,
        limit,
        total,
        totalPages,
        hasMore: 1 < totalPages,
      },
    };
  } catch (err) {
    console.error("Error fetching initial products in page.tsx:", err);
    return {
      products: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }
}

export default async function HomePage() {
  const { products, pagination } = await getInitialProducts();

  return (
    <div className="w-full">
      <HomeProductGrid
        initialProducts={products}
        initialPagination={pagination}
      />
    </div>
  );
}
