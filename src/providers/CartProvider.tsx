"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore, type CartStoreItem } from "@/stores/cartStore";

interface CartProviderProps {
  children: React.ReactNode;
}

export default function CartProvider({ children }: CartProviderProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const setItems = useCartStore((s) => s.setItems);
  const prevAuthRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  // Fetch server cart and merge with local cart on login
  const fetchAndMergeCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;

      const serverCart: CartStoreItem[] = await res.json();
      const localItems = useCartStore.getState().items;

      if (serverCart.length === 0 && localItems.length === 0) return;

      // Merge: server items take priority, add unique local items
      const mergedMap = new Map<string, CartStoreItem>();

      // Add server items first (they take priority)
      for (const item of serverCart) {
        mergedMap.set(item.id, item);
      }

      // Add local items that are not already in the server cart
      for (const item of localItems) {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      }

      const mergedItems = Array.from(mergedMap.values());
      setItems(mergedItems);

      // Sync merged cart back to server if there were local-only items
      const hasLocalOnly = localItems.some((li) =>
        !serverCart.some((si) => si.id === li.id)
      );

      if (hasLocalOnly) {
        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: mergedItems }),
        });
      }
    } catch {
      // Silently fail - local cart is still intact
    }
  }, [setItems]);

  // Debounced sync to server
  const syncToServer = useCallback(
    (cartItems: CartStoreItem[]) => {
      if (!isAuthenticated || isSyncingRef.current) return;

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        isSyncingRef.current = true;
        try {
          await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: cartItems }),
          });
        } catch {
          // Silently fail
        } finally {
          isSyncingRef.current = false;
        }
      }, 1000);
    },
    [isAuthenticated]
  );

  // On login: fetch and merge server cart
  useEffect(() => {
    if (isAuthenticated && !prevAuthRef.current && user) {
      fetchAndMergeCart();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, user, fetchAndMergeCart]);

  // Sync cart to server on changes (only when authenticated)
  useEffect(() => {
    if (isAuthenticated && !isSyncingRef.current) {
      syncToServer(items);
    }
  }, [items, isAuthenticated, syncToServer]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return <>{children}</>;
}
