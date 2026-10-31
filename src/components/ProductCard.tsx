"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check, Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const hasPromo = Boolean(product.promoPrice && product.promoPrice < product.price);
  const currentPrice = hasPromo ? product.promoPrice! : product.price;

  const discountPercent = hasPromo
    ? Math.round(((product.price - product.promoPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // Use first variant default if available
    const defaultSize = product.variants?.sizes?.[0];
    const defaultColor = product.variants?.colors?.[0]?.name;

    addToCart(product, 1, defaultSize, defaultColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const displayName = lang === "ar" && product.nameAr ? product.nameAr : product.name;
  const mainImage = product.images?.[0] || "/placeholder.png";

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* Clickable Image Container */}
      <Link href={`/produit/${product._id}`} className="relative block aspect-square w-full overflow-hidden bg-slate-100">
        <Image
          src={mainImage}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={false}
        />

        {/* Overlay badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-rose-600/90 text-white font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-full shadow-sm backdrop-blur-xs">
              {t.outOfStock}
            </span>
          ) : hasPromo ? (
            <span className="bg-amber-500 text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          ) : (
            <span />
          )}

          {/* Quick view icon hint */}
          <div className="w-8 h-8 rounded-full bg-white/90 text-slate-700 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between gap-3">
        {/* Title */}
        <div>
          <Link
            href={`/produit/${product._id}`}
            className="block font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-blue-600 transition-colors"
            title={displayName}
          >
            {displayName}
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-1 flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-extrabold text-base sm:text-lg text-slate-900">
              {currentPrice.toLocaleString("fr-FR")} {t.currency}
            </span>
            {hasPromo && (
              <span className="text-xs sm:text-sm text-slate-400 line-through">
                {product.price.toLocaleString("fr-FR")} {t.currency}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : isAdded
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-900 hover:bg-blue-600 text-white shadow-sm hover:shadow"
            }`}
          >
            {isOutOfStock ? (
              <span>{t.outOfStock}</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{t.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 stroke-[2]" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
