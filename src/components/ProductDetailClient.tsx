"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Zap,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.variants?.sizes?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.variants?.colors?.[0]?.name
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const hasPromo = Boolean(product.promoPrice && product.promoPrice < product.price);
  const currentPrice = hasPromo ? product.promoPrice! : product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.price - product.promoPrice!) / product.price) * 100)
    : 0;

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.png"];
  const currentImage = images[activeImageIndex] || images[0];

  const displayName = lang === "ar" && product.nameAr ? product.nameAr : product.name;
  const displayDescription =
    lang === "ar" && product.descriptionAr ? product.descriptionAr : product.description;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t.backToHome}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="flex flex-col gap-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
            <Image
              src={currentImage}
              alt={displayName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              {isOutOfStock ? (
                <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                  {t.outOfStock}
                </span>
              ) : hasPromo ? (
                <span className="bg-amber-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md">
                  -{discountPercent}%
                </span>
              ) : (
                <span />
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? "border-blue-600 ring-2 ring-blue-500/20"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${displayName} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
          {/* Category & Name */}
          <div>
            {product.category && (
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg mb-2">
                {product.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {displayName}
            </h1>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 flex-wrap gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {currentPrice.toLocaleString("fr-FR")} {t.currency}
              </span>
              {hasPromo && (
                <span className="text-lg text-slate-400 line-through">
                  {product.price.toLocaleString("fr-FR")} {t.currency}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  {t.outOfStock}
                </span>
              ) : product.stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  {t.onlyFewLeft} {product.stock} {t.unitsInStock}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {t.inStock}
                </span>
              )}
            </div>
          </div>

          {/* Variants: Sizes */}
          {product.variants?.sizes && product.variants.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block">
                {t.selectSize} : <span className="text-blue-600 font-semibold">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      selectedSize === size
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variants: Colors */}
          {product.variants?.colors && product.variants.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block">
                {t.selectColor} : <span className="text-blue-600 font-semibold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.colors.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {color.hex && (
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: color.hex }}
                        />
                      )}
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block">
                {t.quantity}
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-200 rounded-l-xl transition-colors disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-slate-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-200 rounded-r-xl transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  (Total : {(currentPrice * quantity).toLocaleString("fr-FR")} {t.currency})
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] ${
                isOutOfStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
              }`}
            >
              {isOutOfStock ? (
                <span>{t.outOfStock}</span>
              ) : isAdded ? (
                <>
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>{t.addedToCart}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>{t.addToCart}</span>
                </>
              )}
            </button>

            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full py-4 px-6 rounded-2xl font-extrabold text-base bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>{t.buyNow}</span>
              </button>
            )}
          </div>

          {/* Reassurance Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Livraison 58 wilayas</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Paiement à la réception</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>Échange garanti</span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-base text-slate-900 mb-2">
              {t.description}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {displayDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
