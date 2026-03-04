"use client";

import { useEffect, useCallback } from "react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { WishlistGrid } from "@/components/account/WishlistGrid";

export default function WishlistPage() {
  const setItems = useWishlistStore((s) => s.setItems);
  const items = useWishlistStore((s) => s.items);

  // Optionally sync with server-side wishlist
  const syncWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          // Merge server data with local store
          const serverItems = data.data.map(
            (item: { product_id: string; product?: { name: string; slug: string; images?: { url: string }[]; base_price: number } }) => ({
              productId: item.product_id,
              productName: item.product?.name ?? "Product",
              imageUrl: item.product?.images?.[0]?.url ?? "/placeholder.png",
              price: item.product?.base_price ?? 0,
              slug: item.product?.slug ?? "",
            })
          );
          // Only update if server has data and local is empty
          if (serverItems.length > 0 && items.length === 0) {
            setItems(serverItems);
          }
        }
      }
    } catch {
      // Local store serves as fallback
    }
  }, [setItems, items.length]);

  useEffect(() => {
    syncWishlist();
  }, [syncWishlist]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          My Wishlist
        </h1>
        <p className="text-sm text-muted mt-1">
          {items.length > 0
            ? `You have ${items.length} ${items.length === 1 ? "item" : "items"} in your wishlist.`
            : "Save items you love for later."}
        </p>
      </div>

      <WishlistGrid />
    </div>
  );
}
