import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalProducts,
      outOfStockCount,
      lowStockCount,
      stockAggregate,
      totalOrders,
      pendingOrders,
      ordersAggregate,
    ] = await Promise.all([
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ stock: 0 }),
      ProductModel.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      ProductModel.aggregate([
        { $group: { _id: null, totalUnits: { $sum: "$stock" } } },
      ]),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: "en attente" }),
      OrderModel.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ]),
    ]);

    const totalStockUnits = stockAggregate[0]?.totalUnits || 0;
    const totalRevenue = ordersAggregate[0]?.totalRevenue || 0;

    // Get categories with count
    const categoriesAggregate = await ProductModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        outOfStockCount,
        lowStockCount,
        totalStockUnits,
        totalOrders,
        pendingOrders,
        totalRevenue,
        categories: categoriesAggregate.map((c) => ({
          name: c._id || "Non classé",
          count: c.count,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des statistiques." },
      { status: 500 }
    );
  }
}
