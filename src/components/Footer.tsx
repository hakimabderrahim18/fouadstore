"use client";

import React from "react";
import Image from "next/image";
import { Truck, ShieldCheck, PhoneCall, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, lang } = useLanguage();
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "213555460770";
  const secondaryPhone = process.env.NEXT_PUBLIC_SECONDARY_PHONE || "0542816442";

  return (
    <footer className="mt-16 bg-white border-t border-slate-200">
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                {lang === "ar" ? "توصيل لـ 58 ولاية" : "Livraison 58 Wilayas"}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === "ar" ? "إلى باب المنزل أو للمكتب" : "À domicile ou en point relais"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                {lang === "ar" ? "منتجات أصلية 100%" : "Produits 100% Originaux"}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === "ar" ? "زيوت معتمدة ولوازم سيارات أصلية" : "Huiles certifiées & pièces de qualité"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                {lang === "ar" ? "خدمة واستشارة سريعة" : "Conseil & Service Rapide"}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === "ar" ? "تواصل معنا مباشرة عبر الهاتف أو واتساب" : "Confirmation et suivi par WhatsApp"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Identity & Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500 shadow-md flex-shrink-0 bg-slate-900">
            <Image
              src="/store-logo.png"
              alt={t.storeName}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900">{t.storeName}</h3>
            <p className="text-xs font-semibold text-amber-700">{t.tagline}</p>
          </div>
        </div>

        {/* Contact Phone Numbers */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={`https://wa.me/${whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp : 0555 46 07 70</span>
          </a>

          <a
            href={`tel:${secondaryPhone}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 text-xs font-bold transition-colors"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            <span>Tél : 0542 81 64 42</span>
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} {t.storeName}. {lang === "ar" ? "جميع الحقوق محفوظة." : "Tous droits réservés."}
        </p>

        <a
          href="/admin"
          className="text-slate-400 hover:text-slate-700 transition-colors font-medium flex items-center gap-1"
        >
          ⚙️ <span>{lang === "ar" ? "لوحة التحكم" : "Administration"}</span>
        </a>
      </div>
    </footer>
  );
}
