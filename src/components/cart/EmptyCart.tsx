"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-surface-2 mb-6">
        <ShoppingBag className="h-10 w-10 text-muted" />
      </div>

      <h2 className="text-xl font-semibold text-foreground font-display mb-2">
        Your cart is empty
      </h2>
      <p className="text-sm text-muted max-w-sm mb-8">
        Looks like you haven&apos;t added any items to your cart yet. Explore our
        collection to find something you love.
      </p>

      <Link href="/products">
        <Button variant="primary" size="lg">
          Start Shopping
        </Button>
      </Link>
    </motion.div>
  );
}
