"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Copy,
  Check,
  MapPin,
  Phone,
  User,
  Truck,
  ArrowRight,
  ArrowLeft,
  Building,
} from "lucide-react";
import { Order } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface ConfirmationClientProps {
  order: Order;
}

export default function ConfirmationClient({ order }: ConfirmationClientProps) {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const whatsappUrl = buildWhatsAppUrl(order, lang);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auto") === "1" || params.get("whatsapp") === "1") {
        window.location.href = whatsappUrl;
      }
    }
  }, [whatsappUrl]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Success Hero Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {t.orderConfirmed}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
          {t.orderThankYou}
        </p>

        {/* Order Number & Status Pill */}
        <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t.orderNumber} :
            </span>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg">
              #{order.orderNumber}
            </span>
            <button
              onClick={handleCopyOrderNumber}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              title="Copier le numéro"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <span className="hidden sm:inline text-slate-200">|</span>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.orderStatusPending}</span>
          </div>
        </div>
      </div>

      {/* Prominent WhatsApp Call-To-Action Box */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/20 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {lang === "ar"
              ? "أرسل تفاصيل طلبك مباشرة عبر واتساب"
              : "Envoyez votre commande sur WhatsApp"}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-md">
            {t.whatsappRedirectNotice}
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white text-emerald-700 font-extrabold text-sm sm:text-base hover:bg-emerald-50 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-center flex-shrink-0"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>{t.whatsappButtonText}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer & Delivery details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>{t.customerInfo}</span>
          </h3>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-semibold">{order.customer.fullName}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span dir="ltr" className="font-medium">{order.customer.phone}</span>
            </div>

            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">
                  {order.customer.wilayaName}, {order.customer.commune}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {order.customer.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700 pt-2 border-t border-slate-100">
              {order.deliveryMode === "domicile" ? (
                <>
                  <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">{t.homeDelivery}</span>
                </>
              ) : (
                <>
                  <Building className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="font-medium">{t.deskDelivery}</span>
                </>
              )}
            </div>

            {order.customer.note && (
              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 italic">
                « {order.customer.note} »
              </div>
            )}
          </div>
        </div>

        {/* Order Financials Recap */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            {t.orderSummary}
          </h3>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t.subtotal}</span>
              <span className="font-bold text-slate-900">
                {order.subtotal.toLocaleString("fr-FR")} {t.currency}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>{t.deliveryFee}</span>
              <span className="font-bold text-slate-900">
                {order.shippingFee.toLocaleString("fr-FR")} {t.currency}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-extrabold text-base text-slate-900">{t.total}</span>
              <span className="font-black text-2xl text-blue-600">
                {order.total.toLocaleString("fr-FR")} {t.currency}
              </span>
            </div>

            <p className="text-xs text-slate-400 text-center pt-2">
              {lang === "ar"
                ? "الدفع نقداً عند الاستلام"
                : "Paiement en espèces à la livraison"}
            </p>
          </div>
        </div>
      </div>

      {/* Ordered Items List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 mb-8">
        <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          {t.orderRecap} ({order.items.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, index) => (
            <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{item.quantity} × {item.price.toLocaleString("fr-FR")} {t.currency}</span>
                  {item.selectedSize && <span>• {item.selectedSize}</span>}
                  {item.selectedColor && <span>• {item.selectedColor}</span>}
                </div>
              </div>

              <span className="font-bold text-sm text-slate-900">
                {item.itemTotal.toLocaleString("fr-FR")} {t.currency}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Continue shopping button */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md active:scale-95"
        >
          {lang === "ar" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          <span>{t.backToStore}</span>
        </Link>
      </div>
    </div>
  );
}
