import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { UserModel } from "@/models/User";
import { initialProducts, initialAdminAccount } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Auto-seed if database has 0 products or 0 users
    const count = await ProductModel.countDocuments();
    if (count === 0) {
      await ProductModel.insertMany(initialProducts);
    }

    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      await UserModel.create(initialAdminAccount);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const stockStatus = searchParams.get("stockStatus")?.trim() || ""; // all, out, low, in
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(200, parseInt(searchParams.get("limit") || "8", 10)));
    const skip = (page - 1) * limit;

    // Filter by search query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { nameAr: searchRegex },
        { description: searchRegex },
        { descriptionAr: searchRegex },
        { category: searchRegex },
      ];
    }

    if (category && category !== "Toutes") {
      filter.category = category;
    }

    if (stockStatus === "out") {
      filter.stock = 0;
    } else if (stockStatus === "low") {
      filter.stock = { $gt: 0, $lte: 5 };
    } else if (stockStatus === "in") {
      filter.stock = { $gt: 5 };
    }

    const total = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      name,
      nameAr,
      slug: customSlug,
      description,
      descriptionAr,
      price,
      promoPrice,
      images,
      stock,
      category,
      variants,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Le nom du produit est obligatoire." },
        { status: 400 }
      );
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json(
        { success: false, error: "Le prix doit être un nombre positif." },
        { status: 400 }
      );
    }

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return NextResponse.json(
        { success: false, error: "Le stock doit être un nombre positif ou nul." },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = customSlug ? slugify(customSlug) : slugify(name);
    if (!baseSlug) baseSlug = `produit-${Date.now().toString(36)}`;

    let slug = baseSlug;
    let counter = 1;
    while (await ProductModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Clean images array
    let processedImages: string[] = [];
    if (Array.isArray(images)) {
      processedImages = images
        .map((img: unknown) => (typeof img === "string" ? img.trim() : ""))
        .filter((img: string) => img.length > 0);
    }
    if (processedImages.length === 0) {
      processedImages = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"];
    }

    const newProduct = await ProductModel.create({
      name: name.trim(),
      nameAr: nameAr ? nameAr.trim() : "",
      slug,
      description: description ? description.trim() : name.trim(),
      descriptionAr: descriptionAr ? descriptionAr.trim() : "",
      price: Number(price),
      promoPrice: promoPrice && Number(promoPrice) > 0 ? Number(promoPrice) : undefined,
      images: processedImages,
      stock: Number(stock),
      category: category ? category.trim() : "Général",
      variants: {
        sizes: Array.isArray(variants?.sizes) ? variants.sizes.filter(Boolean) : [],
        colors: Array.isArray(variants?.colors) ? variants.colors.filter((c: { name?: string }) => Boolean(c?.name)) : [],
      },
    });

    return NextResponse.json(
      {
        success: true,
        product: {
          _id: newProduct._id.toString(),
          name: newProduct.name,
          nameAr: newProduct.nameAr,
          slug: newProduct.slug,
          description: newProduct.description,
          descriptionAr: newProduct.descriptionAr,
          price: newProduct.price,
          promoPrice: newProduct.promoPrice,
          images: newProduct.images || [],
          stock: newProduct.stock,
          category: newProduct.category,
          variants: newProduct.variants,
          createdAt: newProduct.createdAt ? newProduct.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: newProduct.updatedAt ? newProduct.updatedAt.toISOString() : new Date().toISOString(),
        },
        message: "Produit créé avec succès.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la création du produit.",
      },
      { status: 500 }
    );
  }
}
