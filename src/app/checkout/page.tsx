"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  Building,
  User,
  Phone,
  MapPin,
  FileText,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { ALGERIA_WILAYAS } from "@/lib/algeria-data";
import { DeliveryMode } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { lang, t } = useLanguage();

  // Customer Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("16"); // Default Alger
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("domicile");

  // Status & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [targetWhatsappUrl, setTargetWhatsappUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  // Selected Wilaya
  const selectedWilaya = useMemo(() => {
    return ALGERIA_WILAYAS.find((w) => w.code === wilayaCode) || ALGERIA_WILAYAS[15]; // Default Alger
  }, [wilayaCode]);

  // Dynamic Shipping Fee based on wilaya & mode
  const shippingFee = useMemo(() => {
    if (!selectedWilaya) return 500;
    return deliveryMode === "bureau"
      ? selectedWilaya.deskDeliveryFee
      : selectedWilaya.homeDeliveryFee;
  }, [selectedWilaya, deliveryMode]);

  const grandTotal = subtotal + shippingFee;

  // Handle Wilaya change
  const handleWilayaChange = (code: string) => {
    setWilayaCode(code);
    setCommune(""); // Reset commune when wilaya changes
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = t.requiredField;
    }

    const cleanPhone = phone.trim().replace(/[\s.-]/g, "");
    if (!cleanPhone) {
      errs.phone = t.requiredField;
    } else if (
      !/^(0[567][0-9]{8}|213[567][0-9]{8}|\+213[567][0-9]{8})$/.test(cleanPhone)
    ) {
      errs.phone = t.invalidPhone;
    }

    if (!commune.trim()) {
      errs.commune = t.requiredField;
    }

    if (!address.trim()) {
      errs.address = t.requiredField;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (cart.length === 0) {
      setServerError(t.cartEmpty);
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            wilayaCode: selectedWilaya.code,
            wilayaName: lang === "ar" ? selectedWilaya.nameAr : selectedWilaya.name,
            commune: commune.trim(),
            address: address.trim(),
            note: note.trim(),
          },
          deliveryMode,
          items: cart.map((item) => ({
            productId: item.productId,
            name: lang === "ar" && item.nameAr ? item.nameAr : item.name,
            price: item.effectivePrice,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            image: item.image,
            itemTotal: item.effectivePrice * item.quantity,
          })),
          subtotal,
          shippingFee,
          total: grandTotal,
          lang,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'enregistrement de la commande.");
      }

      // Order created successfully!
      const orderNumber = data.order.orderNumber;
      const whatsappUrl = data.whatsappUrl;

      // Clear the cart
      clearCart();
      setTargetWhatsappUrl(whatsappUrl);
      setIsRedirecting(true);

      // Pre-set history so browser Back button will return to confirmation page
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/confirmation/${orderNumber}`);
        // Immediately redirect to WhatsApp with the pre-filled order message
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 400);
      }
    } catch (err: unknown) {
      console.error("Order submission failed:", err);
      setServerError(
        err instanceof Error ? err.message : "Une erreur inattendue est survenue."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.cartEmpty}</h2>
        <p className="text-slate-500 mb-6">{t.cartEmptySubtitle}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold"
        >
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t.discoverProducts}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-2"
        >
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t.continueShopping}</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t.checkoutTitle}
        </h1>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer info card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-blue-600" />
              <span>{t.customerInfo}</span>
            </h2>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.fullName} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-500/20"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.phone} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  dir="ltr"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-500/20"
                  }`}
                />
              </div>
              {errors.phone ? (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.phone}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  {lang === "ar"
                    ? "يرجى إدخال رقم هاتف شغال للتأكيد (مثال: 0555460770)"
                    : "Numéro joignable pour confirmation (ex: 0555 46 07 70)"}
                </p>
              )}
            </div>

            {/* Wilaya & Commune */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.wilaya} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={wilayaCode}
                  onChange={(e) => handleWilayaChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {lang === "ar" ? w.nameAr : w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t.commune} <span className="text-rose-500">*</span>
                </label>
                {selectedWilaya.communes && selectedWilaya.communes.length > 0 ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      list="communes-list"
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      placeholder={t.selectCommune}
                      className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.commune
                          ? "border-rose-400 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-blue-600 focus:ring-blue-500/20"
                      }`}
                    />
                    <datalist id="communes-list">
                      {selectedWilaya.communes.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder={t.commune}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                )}
                {errors.commune && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.commune}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.address} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-3.5 text-slate-400 pointer-events-none">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  rows={2}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.address
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-500/20"
                  }`}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.address}</p>
              )}
            </div>

            {/* Note optionnelle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.note}
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-3.5 text-slate-400 pointer-events-none">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.notePlaceholder}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Delivery Mode Choice */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>{t.deliveryMode}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Domicile option */}
              <div
                onClick={() => setDeliveryMode("domicile")}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                  deliveryMode === "domicile"
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50/30 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {t.homeDelivery}
                      </h3>
                      <p className="text-xs text-slate-500">{t.homeDeliveryDesc}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="deliveryMode"
                    checked={deliveryMode === "domicile"}
                    onChange={() => setDeliveryMode("domicile")}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">{t.deliveryFee}</span>
                  <span className="font-extrabold text-base text-blue-600">
                    {selectedWilaya.homeDeliveryFee.toLocaleString("fr-FR")} {t.currency}
                  </span>
                </div>
              </div>

              {/* Bureau option */}
              <div
                onClick={() => setDeliveryMode("bureau")}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                  deliveryMode === "bureau"
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50/30 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {t.deskDelivery}
                      </h3>
                      <p className="text-xs text-slate-500">{t.deskDeliveryDesc}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="deliveryMode"
                    checked={deliveryMode === "bureau"}
                    onChange={() => setDeliveryMode("bureau")}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">{t.deliveryFee}</span>
                  <span className="font-extrabold text-base text-purple-600">
                    {selectedWilaya.deskDeliveryFee.toLocaleString("fr-FR")} {t.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Validation Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              {t.orderSummary} ({cart.length})
            </h2>

            {/* Items list */}
            <div className="max-h-72 overflow-y-auto space-y-3 divide-y divide-slate-100 pr-1">
              {cart.map((item) => (
                <div key={item.key} className="pt-3 first:pt-0 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {lang === "ar" && item.nameAr ? item.nameAr : item.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {item.quantity} × {item.effectivePrice.toLocaleString("fr-FR")}{" "}
                      {t.currency}
                      {item.selectedSize && ` • ${item.selectedSize}`}
                      {item.selectedColor && ` • ${item.selectedColor}`}
                    </p>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {(item.effectivePrice * item.quantity).toLocaleString("fr-FR")}{" "}
                    {t.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t.subtotal}</span>
                <span className="font-bold text-slate-900">
                  {subtotal.toLocaleString("fr-FR")} {t.currency}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t.shipping} ({deliveryMode === "domicile" ? "Domicile" : "Bureau"})</span>
                <span className="font-bold text-slate-900">
                  {shippingFee.toLocaleString("fr-FR")} {t.currency}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
              <span className="font-bold text-base text-slate-900">{t.total}</span>
              <div className="text-right">
                <span className="font-extrabold text-2xl text-blue-600">
                  {grandTotal.toLocaleString("fr-FR")} {t.currency}
                </span>
                <span className="block text-xs text-slate-400">
                  {lang === "ar" ? "الدفع نقداً عند الاستلام" : "Paiement en espèces à la livraison"}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl font-extrabold text-base bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.processing}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t.confirmOrder}</span>
                </>
              )}
            </button>

            {/* Trust badge */}
            <p className="text-center text-xs text-slate-400">
              🔒 {lang === "ar"
                ? "معلوماتكم محمية ومضمونة. لا يتم الدفع إلا بعد استلام المنتج."
                : "Vos informations sont sécurisées. Paiement uniquement à la livraison."}
            </p>
          </div>
        </div>
      </form>

      {/* WhatsApp Auto-Redirect Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 ring-8 ring-emerald-500/10 animate-pulse">
            <MessageCircle className="w-10 h-10 fill-emerald-500 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {lang === "ar" ? "تم تسجيل طلبكم بنجاح !" : "Commande enregistrée avec succès !"}
          </h2>
          <p className="text-emerald-300 text-sm sm:text-base font-semibold max-w-md mb-6">
            {lang === "ar"
              ? "جاري تحويلكم تلقائياً إلى تطبيق واتساب لإرسال الطلب لمحل الإخوة زبوج..."
              : "Redirection automatique vers WhatsApp pour envoyer votre commande aux Frères Zeboudj..."}
          </p>
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span>{lang === "ar" ? "يرجى الانتظار..." : "Veuillez patienter..."}</span>
          </div>

          {targetWhatsappUrl && (
            <a
              href={targetWhatsappUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>
                {lang === "ar" ? "اضغط هنا إذا لم يفتح واتساب تلقائياً" : "Cliquez ici si WhatsApp ne s'ouvre pas"}
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
