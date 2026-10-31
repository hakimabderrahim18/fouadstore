"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CartDrawer() {
  const {
    cart,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
  } = useCart();
  const { lang, t } = useLanguage();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCartDrawer();
    };
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartDrawerOpen, closeCartDrawer]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 ${lang === "ar" ? "left-0" : "right-0"} max-w-full flex`}>
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {t.cart} ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{t.cartEmpty}</h3>
                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  {t.cartEmptySubtitle}
                </p>
                <button
                  onClick={closeCartDrawer}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-sm hover:shadow"
                >
                  {t.discoverProducts}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.key} className="py-4 flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate mb-1">
                      {lang === "ar" && item.nameAr ? item.nameAr : item.name}
                    </h4>

                    {/* Variants if any */}
                    {(item.selectedSize || item.selectedColor) && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        {item.selectedSize && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded">
                            {t.selectSize}: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded">
                            {t.selectColor}: {item.selectedColor}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-900">
                        {item.effectivePrice.toLocaleString("fr-FR")} {t.currency}
                      </span>
                      {item.promoPrice && item.promoPrice < item.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {item.price.toLocaleString("fr-FR")} {t.currency}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls & Delete */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors disabled:opacity-40"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title={t.remove}
                        aria-label={t.remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 p-5 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between text-base">
                <span className="text-slate-600 font-medium">{t.subtotal}</span>
                <span className="font-extrabold text-xl text-slate-900">
                  {subtotal.toLocaleString("fr-FR")} {t.currency}
                </span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCartDrawer}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 px-4 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all text-center"
                >
                  <span>{t.checkout}</span>
                  <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                </Link>

                <button
                  onClick={closeCartDrawer}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {t.continueShopping}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
