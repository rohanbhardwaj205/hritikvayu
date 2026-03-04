"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring" as const, damping: 30, stiffness: 300 },
  },
  exit: {
    x: "100%",
    transition: { type: "spring" as const, damping: 30, stiffness: 300 },
  },
};

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  const subtotal = useCartStore((s) => s.subtotal());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Shopping Bag
                <span className="ml-1 text-sm font-normal text-muted">
                  ({totalItems})
                </span>
              </h2>
              <button
                onClick={closeDrawer}
                className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
                  <ShoppingBag className="h-10 w-10 text-muted-light" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-foreground">
                  Your bag is empty
                </p>
                <p className="mt-1 text-center text-sm text-muted">
                  Looks like you haven&apos;t added anything to your bag yet.
                  Start shopping to fill it up!
                </p>
                <Link
                  href="/products"
                  onClick={closeDrawer}
                  className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-border bg-surface/50 p-3"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeDrawer}
                        className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface"
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeDrawer}
                            className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {item.productName}
                          </Link>
                          {item.variantLabel && (
                            <p className="mt-0.5 text-xs text-muted">
                              {item.variantLabel}
                            </p>
                          )}
                          <p className="mt-1 text-sm font-semibold text-primary">
                            {formatPrice(item.unitPrice)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Selector */}
                          <div className="flex items-center rounded-lg border border-border">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:text-foreground disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-7 w-8 items-center justify-center border-x border-border text-xs font-medium text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.maxStock}
                              className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:text-foreground disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-1.5 text-muted transition-colors hover:bg-error/10 hover:text-error"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mb-4 text-xs text-muted">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="flex items-center justify-center rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
