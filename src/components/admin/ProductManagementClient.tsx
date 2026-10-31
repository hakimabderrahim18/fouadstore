"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  Loader2,
  AlertTriangle,
  Minus,
  Tag,
  Palette,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Product } from "@/lib/types";

interface ProductManagementClientProps {
  initialProducts: Product[];
  categories: string[];
}

interface FormState {
  _id?: string;
  name: string;
  nameAr: string;
  slug?: string;
  category: string;
  price: string | number;
  promoPrice: string | number;
  stock: string | number;
  description: string;
  descriptionAr: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
}

const emptyForm: FormState = {
  name: "",
  nameAr: "",
  category: "Général",
  price: "",
  promoPrice: "",
  stock: "10",
  description: "",
  descriptionAr: "",
  images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"],
  sizes: [],
  colors: [],
};

export default function ProductManagementClient({
  initialProducts,
  categories,
}: ProductManagementClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "low" | "out">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Tag inputs inside modal
  const [newSizeInput, setNewSizeInput] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newImageUrl, setNewImageUrl] = useState("");

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success Toast notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Filter products locally for instant response
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(searchLower) ||
        (p.nameAr && p.nameAr.toLowerCase().includes(searchLower)) ||
        (p.category && p.category.toLowerCase().includes(searchLower)) ||
        p.description.toLowerCase().includes(searchLower);

      // Category
      const matchesCategory =
        selectedCategory === "Toutes" || p.category === selectedCategory;

      // Stock
      let matchesStock = true;
      if (stockFilter === "out") matchesStock = p.stock === 0;
      else if (stockFilter === "low") matchesStock = p.stock > 0 && p.stock <= 5;
      else if (stockFilter === "in") matchesStock = p.stock > 5;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, selectedCategory, stockFilter]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setModalError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p: Product) => {
    setFormData({
      _id: p._id,
      name: p.name,
      nameAr: p.nameAr || "",
      slug: p.slug,
      category: p.category || "Général",
      price: p.price,
      promoPrice: p.promoPrice || "",
      stock: p.stock,
      description: p.description,
      descriptionAr: p.descriptionAr || "",
      images: p.images && p.images.length > 0 ? [...p.images] : [""],
      sizes: p.variants?.sizes ? [...p.variants.sizes] : [],
      colors: p.variants?.colors ? p.variants.colors.map(c => ({ name: c.name, hex: c.hex || "#000000" })) : [],
    });
    setIsEditing(true);
    setModalError("");
    setIsModalOpen(true);
  };

  // Quick inline stock updater
  const handleQuickStockUpdate = async (productId: string, delta: number) => {
    const target = products.find((p) => p._id === productId);
    if (!target) return;

    const newStock = Math.max(0, target.stock + delta);
    if (newStock === target.stock) return;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, stock: newStock } : p))
    );

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour stock");
      router.refresh();
    } catch (err) {
      console.error(err);
      // Revert if error
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stock: target.stock } : p))
      );
    }
  };

  // Submit Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!formData.name.trim()) {
      setModalError("Le nom du produit est obligatoire.");
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setModalError("Le prix doit être un nombre supérieur à 0.");
      return;
    }

    const stockNum = Number(formData.stock);
    if (isNaN(stockNum) || stockNum < 0) {
      setModalError("Le stock doit être un nombre positif ou nul.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        nameAr: formData.nameAr.trim(),
        category: formData.category.trim() || "Général",
        price: priceNum,
        promoPrice: formData.promoPrice ? Number(formData.promoPrice) : undefined,
        stock: stockNum,
        description: formData.description.trim() || formData.name.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        images: formData.images.filter((img) => img.trim().length > 0),
        variants: {
          sizes: formData.sizes,
          colors: formData.colors,
        },
      };

      if (isEditing && formData._id) {
        // PUT
        const res = await fetch(`/api/products/${formData._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de la modification.");
        }

        setProducts((prev) =>
          prev.map((p) => (p._id === formData._id ? data.product : p))
        );
        showToast("Produit modifié avec succès !");
        router.refresh();
      } else {
        // POST
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de la création.");
        }

        setProducts((prev) => [data.product, ...prev]);
        showToast("Nouveau produit ajouté au catalogue !");
        router.refresh();
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${productToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la suppression.");
      }

      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      showToast(`Le produit "${productToDelete.name}" a été supprimé.`);
      setProductToDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer le produit.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Variant Helpers
  const addSizeTag = () => {
    const val = newSizeInput.trim().toUpperCase();
    if (val && !formData.sizes.includes(val)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, val] }));
      setNewSizeInput("");
    }
  };

  const removeSizeTag = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== sizeToRemove),
    }));
  };

  const addColorVariant = () => {
    const name = newColorName.trim();
    if (name) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { name, hex: newColorHex }],
      }));
      setNewColorName("");
    }
  };

  const removeColorVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== index),
    }));
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (url) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
      setNewImageUrl("");
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Gestion des Produits
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ajoutez, modifiez, ajustez les prix et contrôlez vos stocks en temps réel.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95 flex-shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Ajouter un Produit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, catégorie..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="Toutes">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter Pills */}
          <div className="sm:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStockFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stockFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setStockFilter("in")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stockFilter === "in"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              En stock
            </button>
            <button
              onClick={() => setStockFilter("low")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stockFilter === "low"
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Faible (≤5)
            </button>
            <button
              onClick={() => setStockFilter("out")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stockFilter === "out"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              Rupture (0)
            </button>
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 border-t border-slate-100 pt-3">
          <span>
            Affichage de <strong>{filteredProducts.length}</strong> sur{" "}
            <strong>{products.length}</strong> produits
          </span>
          {(search || selectedCategory !== "Toutes" || stockFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("Toutes");
                setStockFilter("all");
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">Produit</th>
                <th className="py-4 px-4">Catégorie</th>
                <th className="py-4 px-4">Prix</th>
                <th className="py-4 px-4">Stock & Statut</th>
                <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Aucun produit ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOut = p.stock === 0;
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const thumb = p.images?.[0] || "/placeholder.png";

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name + Image */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            <Image
                              src={thumb}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <div className="font-bold text-slate-900 truncate" title={p.name}>
                              {p.name}
                            </div>
                            {p.nameAr && (
                              <div className="text-xs text-slate-400 truncate" dir="rtl">
                                {p.nameAr}
                              </div>
                            )}
                            {/* Variants count */}
                            {(p.variants?.sizes?.length || p.variants?.colors?.length) ? (
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                {p.variants.sizes?.length ? (
                                  <span>{p.variants.sizes.length} tailles</span>
                                ) : null}
                                {p.variants.colors?.length ? (
                                  <span>• {p.variants.colors.length} couleurs</span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold inline-block">
                          {p.category || "Général"}
                        </span>
                      </td>

                      {/* Price & Promo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">
                          {(p.promoPrice || p.price).toLocaleString("fr-FR")} DA
                        </div>
                        {p.promoPrice && (
                          <div className="text-xs text-slate-400 line-through">
                            {p.price.toLocaleString("fr-FR")} DA
                          </div>
                        )}
                      </td>

                      {/* Stock Controller with quick +/- */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Quick Adjuster */}
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              onClick={() => handleQuickStockUpdate(p._id, -1)}
                              disabled={p.stock <= 0}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors disabled:opacity-30"
                              title="Diminuer stock"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center font-bold text-xs text-slate-900">
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleQuickStockUpdate(p._id, 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors"
                              title="Augmenter stock"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Status Badge */}
                          {isOut ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rupture
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Faible ({p.stock})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              En stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View on live store */}
                          <Link
                            href={`/produit/${p._id}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                            title="Voir sur la boutique"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                            title="Modifier le produit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                            title="Supprimer le produit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / DRAWER : Add or Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isEditing ? "Modifier le produit" : "Ajouter un nouveau produit"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Remplissez les informations et enregistrez pour mettre à jour le catalogue.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Names FR & AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom du produit (Français) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Montre Connectée Ultra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom du produit (Arabe)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="مثال: ساعة ذكية متطورة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category, Price, PromoPrice, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: High-Tech"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prix (DA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="4500"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Promo (DA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.promoPrice}
                    onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                    placeholder="3800"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Images Gallery Management */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Galerie d&apos;Images (URLs)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
                  >
                    Ajouter
                  </button>
                </div>

                {/* Thumbnails list */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                    >
                      <Image
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(idx)}
                        className="absolute inset-0 bg-rose-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer cette image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants: Sizes & Colors */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Variantes (Tailles & Couleurs)</span>
                </h3>

                {/* Sizes */}
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1">
                    Tailles disponibles :
                  </span>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSizeInput}
                      onChange={(e) => setNewSizeInput(e.target.value)}
                      placeholder="Ex: M, L, XL ou 41, 42"
                      className="w-44 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSizeTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSizeTag}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg"
                    >
                      + Taille
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {formData.sizes.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSizeTag(s)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Couleurs :</span>
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-slate-200 bg-white"
                      title="Choisir la couleur"
                    />
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Nom (ex: Noir Mat, Rouge)"
                      className="w-44 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={addColorVariant}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg"
                    >
                      + Couleur
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => removeColorVariant(idx)}
                          className="text-slate-400 hover:text-rose-600 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description détaillée (Français)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Caractéristiques, matière, spécifications techniques..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description détaillée (Arabe)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="وصف المنتج والمواصفات باللغة العربية..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditing ? "Enregistrer les modifications" : "Créer le produit"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Supprimer ce produit ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer définitivement «{" "}
                <strong>{productToDelete.name}</strong> » de la base de données ? Cette action est irréversible.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
