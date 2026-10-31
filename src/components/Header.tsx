"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Globe, Phone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const { totalItems, openCartDrawer } = useCart();
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo / Store Name */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform bg-slate-900">
            <Image
              src="/store-logo.png"
              alt={t.storeName}
              fill
              sizes="52px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {t.storeName}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700 sm:text-slate-500 truncate">
              {t.tagline}
            </span>
          </div>
        </Link>

        {/* Right action buttons: Phone call hint + Language toggle + Cart button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Quick Call Button (visible on sm+) */}
          <a
            href="tel:0555460770"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Appeler le magasin"
          >
            <Phone className="w-3.5 h-3.5" />
            <span dir="ltr">0555 46 07 70</span>
          </a>

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
            title={lang === "fr" ? "Changer en Arabe" : "Passer en Français"}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === "fr" ? "العربية" : "FR"}</span>
          </button>

          {/* Cart Icon with badge */}
          <button
            onClick={openCartDrawer}
            className="relative p-2.5 rounded-full text-slate-800 hover:bg-slate-100 transition-all active:scale-90"
            aria-label="Panier"
          >
            <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-xs min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-200">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
