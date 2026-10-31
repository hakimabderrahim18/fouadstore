"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, CartItem } from "@/lib/types";

export function getCartItemKey(
  productId: string,
  selectedSize?: string,
  selectedColor?: string
): string {
  return `${productId}_${selectedSize || "nosize"}_${selectedColor || "nocolor"}`;
}

interface CartContextType {
  cart: (CartItem & { key: string })[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "fouadstore_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<(CartItem & { key: string })[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart to localStorage:", e);
      }
    }
  }, [cart, isLoaded]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    if (product.stock <= 0) return;

    const key = getCartItemKey(product._id, selectedSize, selectedColor);
    const effectivePrice = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.key === key);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const newItem: CartItem & { key: string } = {
          key,
          productId: product._id,
          name: product.name,
          nameAr: product.nameAr,
          price: product.price,
          promoPrice: product.promoPrice,
          effectivePrice,
          image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.png",
          stock: product.stock,
          quantity: Math.min(product.stock, Math.max(1, quantity)),
          selectedSize,
          selectedColor,
        };
        return [...prevCart, newItem];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.key === key) {
          const clampedQty = Math.min(item.stock, quantity);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (key: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.effectivePrice * item.quantity, 0);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const toggleCartDrawer = () => setIsCartDrawerOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
