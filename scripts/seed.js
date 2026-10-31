const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fouadstore";

// 1. Account Seed
const initialAdminAccount = {
  name: "Administrateur Frères Zeboudj",
  email: "admin@fouadstore.dz",
  username: "admin",
  password: "fouad97",
  role: "admin",
  isActive: true,
};

// 2. Products Seed (2 products)
const initialProducts = [
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

// Mongoose Schemas
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    descriptionAr: { type: String },
    price: { type: Number, required: true },
    promoPrice: { type: Number },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String },
    variants: {
      sizes: { type: [String], default: [] },
      colors: [
        {
          name: { type: String },
          hex: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function seed() {
  try {
    console.log("Connecting to MongoDB at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.\n");

    // 1. Seed Admin Account
    await User.deleteMany({});
    const adminUser = await User.create(initialAdminAccount);
    console.log("==================================================");
    console.log("👤 [SEED] COMPTE ADMINISTRATEUR CRÉÉ AVEC SUCCÈS :");
    console.log(`   - Nom          : ${adminUser.name}`);
    console.log(`   - Email        : ${adminUser.email}`);
    console.log(`   - Identifiant  : ${adminUser.username}`);
    console.log(`   - Mot de passe : ${initialAdminAccount.password}`);
    console.log(`   - Rôle         : ${adminUser.role}`);
    console.log("==================================================\n");

    // 2. Seed 2 Products
    await Product.deleteMany({});
    const inserted = await Product.insertMany(initialProducts);
    console.log("==================================================");
    console.log(`🛍️ [SEED] ${inserted.length} PRODUITS INSÉRÉS AVEC SUCCÈS :`);
    inserted.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name} - ${p.promoPrice || p.price} DA (Stock: ${p.stock})`);
    });
    console.log("==================================================\n");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seed();
