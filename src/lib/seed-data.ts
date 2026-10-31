export const initialAdminAccount = {
  name: "Administrateur Frères Zeboudj",
  email: "admin@fouadstore.dz",
  username: "admin",
  password: "fouad97",
  role: "admin" as const,
  isActive: true,
};

export const initialProducts = [
  {
    name: "Huile Moteur Total Quartz 7000 10W-40 (Bidon 5L)",
    nameAr: "زيت محرك توتال كوارتز 7000 لزوجة 10W-40 (سعة 5 لتر)",
    slug: "huile-moteur-total-quartz-7000-10w40-5l",
    description: "Huile moteur synthétique haute performance conçue pour moteurs essence et diesel. Assure une protection optimale contre l'usure, prévient l'encrassement des pièces maîtresses et garantit un démarrage à froid facile.",
    descriptionAr: "زيت محرك نصف تخليقي عالي الأداء معتمد لمحركات البنزين والديزل. يوفر حماية فائقة ضد التآكل ونظافة مثالية للمحرك مع تسهيل التشغيل في الصباح الباكر.",
    price: 4900,
    promoPrice: 4400,
    stock: 25,
    category: "Huiles Moteur",
    images: [
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80"
    ],
    variants: {
      sizes: ["5 Litres", "1 Litre"]
    }
  },
  {
    name: "Liquide de Refroidissement G12 Rose -35°C Antigel (Bidon 4L)",
    nameAr: "سائل تبريد رادياتور G12 وردي أصلي مضاد للتجمد والغليان -35°م (4 لتر)",
    slug: "liquide-refroidissement-g12-rose-35c-4l",
    description: "Liquide de refroidissement organique longue durée de type D/G12. Protège efficacement le circuit contre le gel (-35°C), la surchauffe (+110°C) et la corrosion des culasses en aluminium.",
    descriptionAr: "سائل تبريد عالي الجودة يدوم طويلاً، يحمي الردياتير ونظام التبريد من الصدأ والتآكل مع حماية مضادة للتجمد حتى -35 درجة مئوية والغليان حتى +110 درجة مئوية.",
    price: 1800,
    promoPrice: 1500,
    stock: 18,
    category: "Liquides & Entretien",
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80"
    ],
    variants: {
      colors: [
        { name: "Rose G12", hex: "#f43f5e" },
        { name: "Jaune G11", hex: "#eab308" }
      ]
    }
  }
];
