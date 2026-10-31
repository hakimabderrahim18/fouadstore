"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, X, Loader2, ArrowDown } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface HomeProductGridProps {
  initialProducts: Product[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default function HomeProductGrid({
  initialProducts,
  initialPagination,
}: HomeProductGridProps) {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(initialPagination.page);
  const [hasMore, setHasMore] = useState(initialPagination.hasMore);
  const [total, setTotal] = useState(initialPagination.total);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch when search query changes
  useEffect(() => {
    let active = true;

    async function fetchSearch() {
      setIsSearching(true);
      try {
        const queryParams = new URLSearchParams({
          page: "1",
          limit: "12",
        });
        if (debouncedSearch) {
          queryParams.set("search", debouncedSearch);
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();

        if (active && data.success) {
          setProducts(data.products);
          setPage(data.pagination.page);
          setHasMore(data.pagination.hasMore);
          setTotal(data.pagination.total);
        }
      } catch (err) {
        console.error("Failed to search products:", err);
      } finally {
        if (active) setIsSearching(false);
      }
    }

    fetchSearch();

    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  // Load more handler
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const queryParams = new URLSearchParams({
        page: nextPage.toString(),
        limit: "12",
      });
      if (debouncedSearch) {
        queryParams.set("search", debouncedSearch);
      }

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(data.pagination.page);
        setHasMore(data.pagination.hasMore);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Search Bar right at top of grid */}
      <div className="mb-6 max-w-xl mx-auto">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm transition-all"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label={t.clearSearch}
            >
              <X className="w-4 h-4" />
            </button>
          ) : isSearching ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : null}
        </div>

        {/* Results count indicator */}
        <div className="mt-2.5 px-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {total} {t.resultsFound}
          </span>
          {debouncedSearch && (
            <span className="font-medium text-blue-600">
              « {debouncedSearch} »
            </span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 && !isSearching && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center my-6 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">
            {t.noProductsFound}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Vérifiez l&apos;orthographe ou essayez un mot-clé plus général.
          </p>
          <button
            onClick={() => setSearch("")}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
          >
            {t.resetSearch}
          </button>
        </div>
      )}

      {/* Responsive Products Grid: 2 mobile, 3 tablet, 4 desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* "Voir plus" (Load More) Button or Complete state */}
      <div className="mt-10 sm:mt-12 text-center">
        {hasMore ? (
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white border border-slate-200 font-bold text-slate-800 text-sm sm:text-base hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-60"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>{t.loadingProducts}</span>
              </>
            ) : (
              <>
                <span>{t.seeMore}</span>
                <ArrowDown className="w-4 h-4" />
              </>
            )}
          </button>
        ) : products.length > 0 ? (
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {t.allProductsLoaded}
          </p>
        ) : null}
      </div>
    </div>
  );
}
