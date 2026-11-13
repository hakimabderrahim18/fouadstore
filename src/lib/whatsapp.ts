import { Order } from "./types";

export function generateWhatsAppMessage(order: Order, lang: "fr" | "ar" = "fr"): string {
  const isAr = lang === "ar";
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString(isAr ? "ar-DZ" : "fr-DZ");
  const deliveryLabel =
    order.deliveryMode === "domicile"
      ? isAr
        ? "توصيل إلى باب المنزل (NOEST Express)"
        : "Livraison à domicile (NOEST Express)"
      : isAr
      ? "استلام من مكتب التوصيل Stop Desk (NOEST Express)"
      : "Récupération en agence Stop Desk (NOEST Express)";

  if (isAr) {
    let msg = `🛒 *طلب جديد من محل الإخوة زبوج (للزيوت ولوازم السيارات)*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 *رقم الطلب:* #${order.orderNumber}\n`;
    msg += `📅 *التاريخ:* ${dateStr}\n\n`;

    msg += `👤 *معلومات الزبون:*\n`;
    msg += `• *الاسم واللقب:* ${order.customer.fullName}\n`;
    msg += `• *الهاتف:* ${order.customer.phone}\n`;
    msg += `• *الولاية:* ${order.customer.wilayaName}\n`;
    msg += `• *البلدية:* ${order.customer.commune}\n`;
    if (order.deliveryMode === "domicile") {
      msg += `• *العنوان:* ${order.customer.address}\n`;
    }
    if (order.customer.note) {
      msg += `• *ملاحظة:* ${order.customer.note}\n`;
    }

    msg += `\n🚚 *طريقة التوصيل:* ${deliveryLabel}\n`;
    if (order.deliveryMode === "bureau" && order.customer.stopDeskAgency) {
      msg += `🏢 *مكتب الاستلام Stop Desk NOEST:*\n`;
      msg += `   • *الاسم:* ${order.customer.stopDeskAgency.name}\n`;
      msg += `   • *العنوان:* ${order.customer.stopDeskAgency.address}\n`;
      if (order.customer.stopDeskAgency.phone) {
        msg += `   • *هاتف المكتب:* ${order.customer.stopDeskAgency.phone}\n`;
      }
    }
    msg += `\n`;

    msg += `🛍️ *المنتجات المطلوبة:*\n`;
    order.items.forEach((item, index) => {
      let variantInfo = "";
      if (item.selectedSize) variantInfo += ` [المقاس: ${item.selectedSize}]`;
      if (item.selectedColor) variantInfo += ` [اللون: ${item.selectedColor}]`;

      msg += `${index + 1}. *${item.name}*${variantInfo}\n`;
      msg += `   ${item.quantity} × ${item.price.toLocaleString("fr-FR")} د.ج = ${item.itemTotal.toLocaleString("fr-FR")} د.ج\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💵 *المجموع الفرعي:* ${order.subtotal.toLocaleString("fr-FR")} د.ج\n`;
    msg += `🚚 *تكلفة التوصيل (NOEST):* ${order.shippingFee.toLocaleString("fr-FR")} د.ج\n`;
    msg += `💰 *المجموع الإجمالي الدفع عند الاستلام:* *${order.total.toLocaleString("fr-FR")} د.ج*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `يرجى تأكيد طلبي وشكراً !`;

    return msg;
  }

  // French message
  let msg = `🛒 *NOUVELLE COMMANDE - Frères Zeboudj (Huiles & Accessoires Auto)*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *Commande N° :* #${order.orderNumber}\n`;
  msg += `📅 *Date :* ${dateStr}\n\n`;

  msg += `👤 *INFORMATIONS DU CLIENT :*\n`;
  msg += `• *Nom :* ${order.customer.fullName}\n`;
  msg += `• *Téléphone :* ${order.customer.phone}\n`;
  msg += `• *Wilaya :* ${order.customer.wilayaName}\n`;
  msg += `• *Commune :* ${order.customer.commune}\n`;
  if (order.deliveryMode === "domicile") {
    msg += `• *Adresse :* ${order.customer.address}\n`;
  }
  if (order.customer.note) {
    msg += `• *Note :* ${order.customer.note}\n`;
  }

  msg += `\n🚚 *MODE DE LIVRAISON :* ${deliveryLabel}\n`;
  if (order.deliveryMode === "bureau" && order.customer.stopDeskAgency) {
    msg += `🏢 *AGENCE DE RETRAIT STOP DESK NOEST :*\n`;
    msg += `   • *Agence :* ${order.customer.stopDeskAgency.name}\n`;
    msg += `   • *Adresse :* ${order.customer.stopDeskAgency.address}\n`;
    if (order.customer.stopDeskAgency.phone) {
      msg += `   • *Tél. Agence :* ${order.customer.stopDeskAgency.phone}\n`;
    }
  }
  msg += `\n`;

  msg += `🛍️ *PRODUITS COMMANDÉS :*\n`;
  order.items.forEach((item, index) => {
    let variantInfo = "";
    if (item.selectedSize) variantInfo += ` [Taille: ${item.selectedSize}]`;
    if (item.selectedColor) variantInfo += ` [Couleur: ${item.selectedColor}]`;

    msg += `${index + 1}. *${item.name}*${variantInfo}\n`;
    msg += `   ${item.quantity} × ${item.price.toLocaleString("fr-FR")} DA = ${item.itemTotal.toLocaleString("fr-FR")} DA\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💵 *Sous-total :* ${order.subtotal.toLocaleString("fr-FR")} DA\n`;
  msg += `🚚 *Frais de livraison (NOEST) :* ${order.shippingFee.toLocaleString("fr-FR")} DA\n`;
  msg += `💰 *TOTAL À PAYER (Paiement à la livraison) :* *${order.total.toLocaleString("fr-FR")} DA*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Merci de bien vouloir confirmer ma commande !`;

  return msg;
}

export function buildWhatsAppUrl(order: Order, lang: "fr" | "ar" = "fr"): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "213555460770";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const message = generateWhatsAppMessage(order, lang);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
