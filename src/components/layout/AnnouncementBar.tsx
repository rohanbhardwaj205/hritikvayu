"use client";

import { useState } from "react";
import { X, Truck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnnouncementBarProps {
  message?: string;
}

export function AnnouncementBar({
  message = "FREE SHIPPING on orders above \u20B9999 | Use code FIRST10 for 10% off your first order",
}: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-accent text-white"
        >
          <div className="relative mx-auto flex max-w-7xl items-center justify-center px-8 py-2 sm:px-12">
            <div className="flex items-center gap-2 text-center text-xs font-medium sm:text-sm">
              <Truck className="hidden h-4 w-4 flex-shrink-0 sm:block" />
              <span>{message}</span>
              <Sparkles className="hidden h-3.5 w-3.5 flex-shrink-0 sm:block" />
            </div>
            <button
              onClick={() => setVisible(false)}
              className="absolute right-2 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:right-4"
              aria-label="Close announcement"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
