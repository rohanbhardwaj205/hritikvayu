"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistStoreItem {
  productId: string;
  productName: string;
  imageUrl: string;
  price: number;
  slug: string;
}

interface WishlistState {
  items: WishlistStoreItem[];
  addItem: (item: WishlistStoreItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setItems: (items: WishlistStoreItem[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const exists = state.items.some(
            (i) => i.productId === item.productId
          );
          if (exists) return state;
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),

      setItems: (items) => set({ items }),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: "vastrayug-wishlist" }
  )
);
