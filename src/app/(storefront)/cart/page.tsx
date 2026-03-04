"use client";

import { AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Shopping Cart" },
];

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs} className="mb-6" />
        <EmptyCart />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      <h1 className="text-2xl font-bold text-foreground font-display mb-8">
        Shopping Cart{" "}
        <span className="text-muted font-sans text-base font-normal">
          ({totalItems} {totalItems === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items - Left 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>

        {/* Cart Summary - Right 1/3 */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </main>
  );
}
