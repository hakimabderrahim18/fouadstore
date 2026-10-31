import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  AlertTriangle,
  Boxes,
  Plus,
  ArrowRight,
  Store,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { OrderModel } from "@/models/Order";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    await connectToDatabase();

    const [
      totalProducts,
      outOfStockCount,
      lowStockCount,
      stockAggregate,
      recentProducts,
      categoriesCount,
      totalOrders,
    ] = await Promise.all([
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ stock: 0 }),
      ProductModel.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      ProductModel.aggregate([
        { $group: { _id: null, totalUnits: { $sum: "$stock" } } },
      ]),
      ProductModel.find().sort({ createdAt: -1 }).limit(6).lean(),
      ProductModel.distinct("category"),
      OrderModel.countDocuments(),
    ]);

    const totalStockUnits = stockAggregate[0]?.totalUnits || 0;

    return {
      totalProducts,
      outOfStockCount,
      lowStockCount,
      totalStockUnits,
      totalOrders,
      categoriesCount: categoriesCount.length,
      recentProducts: recentProducts.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        nameAr: p.nameAr,
        slug: p.slug,
        price: p.price,
        promoPrice: p.promoPrice,
        stock: p.stock,
        category: p.category,
        image: p.images?.[0] || "/placeholder.png",
      })),
    };
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return {
      totalProducts: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
      totalStockUnits: 0,
      totalOrders: 0,
      categoriesCount: 0,
      recentProducts: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Tableau de Bord
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Administration Frères Zeboudj
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            محل الإخوة زبوج للزيوت ولوازم السيارات - Supervisez votre catalogue, vos stocks et vos prix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/produits"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Produit</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
          >
            <Store className="w-4 h-4" />
            <span>Boutique</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Total Produits
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {data.totalProducts}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              {data.categoriesCount} catégories actives
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Units in Stock */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Unités en Stock
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {data.totalStockUnits}
            </span>
            <span className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Inventaire disponible
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock Alert */}
        <div className={`bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between ${
          data.outOfStockCount > 0 ? "border-rose-200 bg-rose-50/20" : "border-slate-200"
        }`}>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Ruptures de Stock
            </span>
            <span className={`text-3xl font-black mt-1 block ${
              data.outOfStockCount > 0 ? "text-rose-600" : "text-slate-900"
            }`}>
              {data.outOfStockCount}
            </span>
            <span className="text-xs text-rose-500 font-medium mt-1 block">
              {data.outOfStockCount > 0 ? "Nécessite réapprovisionnement" : "Aucune rupture"}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            data.outOfStockCount > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              Stock Faible (≤ 5)
            </span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">
              {data.lowStockCount}
            </span>
            <span className="text-xs text-amber-600 font-medium mt-1 block">
              À surveiller
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Products Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Aperçu Rapide des Produits
            </h2>
            <p className="text-xs text-slate-500">
              Derniers articles ajoutés au catalogue Frères Zeboudj
            </p>
          </div>

          <Link
            href="/admin/produits"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Voir tous les produits ({data.totalProducts})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recentProducts.map((p) => {
            const isOut = p.stock === 0;
            const isLow = p.stock > 0 && p.stock <= 5;

            return (
              <div
                key={p._id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-3.5 hover:shadow-sm transition-all"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {p.category || "Général"}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 truncate" title={p.name}>
                    {p.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-extrabold text-sm text-slate-900">
                      {(p.promoPrice || p.price).toLocaleString("fr-FR")} DA
                    </span>
                    {p.promoPrice && (
                      <span className="text-[11px] text-slate-400 line-through">
                        {p.price.toLocaleString("fr-FR")} DA
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  {isOut ? (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                      0 stock
                    </span>
                  ) : isLow ? (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      {p.stock} restant{p.stock > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.stock} en stock
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
