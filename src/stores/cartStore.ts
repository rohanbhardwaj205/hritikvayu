"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartStoreItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  imageUrl: string;
  unitPrice: number; // in paise
  quantity: number;
  maxStock: number;
  slug: string;
}

interface CartState {
  items: CartStoreItem[];
  isOpen: boolean;

  // Item actions
  addItem: (item: Omit<CartStoreItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartStoreItem[]) => void;

  // Drawer actions
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;

  // Computed helpers
  totalItems: () => number;
  subtotal: () => number;
}

function generateCartItemId(productId: string, variantId: string | null) {
  return variantId ? `${productId}_${variantId}` : productId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const id = generateCartItemId(item.productId, item.variantId);
          const existingIndex = state.items.findIndex((i) => i.id === id);

          if (existingIndex !== -1) {
            // Merge: increase quantity, clamped to maxStock
            const updated = [...state.items];
            const existing = updated[existingIndex];
            const newQty = Math.min(
              existing.quantity + item.quantity,
              item.maxStock
            );
            updated[existingIndex] = {
              ...existing,
              quantity: newQty,
              unitPrice: item.unitPrice,
              imageUrl: item.imageUrl,
              maxStock: item.maxStock,
            };
            return { items: updated };
          }

          // Add new item
          const newItem: CartStoreItem = {
            ...item,
            id,
            quantity: Math.min(item.quantity, item.maxStock),
          };
          return { items: [...state.items, newItem] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock)) }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        ),
    }),
    {
      name: "vastrayug-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
