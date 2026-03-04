"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Truck, RefreshCcw, Shield, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping on orders above \u20B9999",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    description: "7-day hassle-free returns",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "100% secure checkout",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Handpicked premium fabrics",
  },
];

export function TrustBadges() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      ref={ref}
      className="border-t border-border bg-background py-6 sm:py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg p-3 sm:p-4"
              )}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/5">
                <badge.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {badge.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
