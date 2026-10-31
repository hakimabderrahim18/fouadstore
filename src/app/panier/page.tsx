"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { lang, t } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          {t.cartEmpty}
        </h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          {t.cartEmptySubtitle}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md"
        >
          {lang === "ar" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          <span>{t.discoverProducts}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-blue-600" />
        <span>
          {t.cart} ({totalItems} {totalItems > 1 ? t.itemCount : t.itemCountSingle})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm divide-y divide-slate-100">
          {cart.map((item) => (
            <div key={item.key} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* Product Image */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/produit/${item.productId}`}
                  className="font-bold text-base text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 mb-1"
                >
                  {lang === "ar" && item.nameAr ? item.nameAr : item.name}
                </Link>

                {/* Variants */}
                {(item.selectedSize || item.selectedColor) && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    {item.selectedSize && (
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                        {t.selectSize}: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                        {t.selectColor}: {item.selectedColor}
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-base text-slate-900">
                    {item.effectivePrice.toLocaleString("fr-FR")} {t.currency}
                  </span>
                  {item.promoPrice && item.promoPrice < item.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {item.price.toLocaleString("fr-FR")} {t.currency}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="font-extrabold text-base text-slate-900 min-w-[90px] text-right">
                  {(item.effectivePrice * item.quantity).toLocaleString("fr-FR")} {t.currency}
                </div>

                <button
                  onClick={() => removeFromCart(item.key)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title={t.remove}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Proceed Button */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            {t.orderSummary}
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t.subtotal}</span>
              <span className="font-bold text-slate-900">
                {subtotal.toLocaleString("fr-FR")} {t.currency}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t.shipping}</span>
              <span className="text-xs text-slate-400">
                (Calculé à l&apos;étape suivante)
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
            <span className="font-bold text-base text-slate-900">{t.total}</span>
            <span className="font-extrabold text-2xl text-blue-600">
              {subtotal.toLocaleString("fr-FR")} {t.currency}
            </span>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-center"
          >
            <span>{t.checkout}</span>
            <ArrowRight className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
          </Link>

          <Link
            href="/"
            className="block text-center text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            {t.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  );
}
