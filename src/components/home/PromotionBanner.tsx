"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Percent, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Promotion } from "@/types";

interface PromotionBannerProps {
  promotions: Promotion[];
}

export function PromotionBanner({ promotions }: PromotionBannerProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const promotion = promotions[0];

  // Fallback to a default promotional banner if no active promotions
  if (!promotion) {
    return (
      <section ref={ref} className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Dark Background */}
            <div className="absolute inset-0 bg-neutral-950" />

            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative flex flex-col items-center justify-center px-6 py-16 text-center sm:px-12 sm:py-20 lg:py-24">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm"
              >
                <Percent className="h-3.5 w-3.5" />
                Limited Time Offer
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              >
                NEW SEASON, NEW STYLE
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-4 max-w-lg text-base text-white/70 sm:text-lg"
              >
                Get 20% off on all hoodies &amp; sweatshirts. Use code{" "}
                <span className="font-semibold text-white">WINTER20</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8"
              >
                <Link href="/products">
                  <Button
                    size="lg"
                    className="group gap-2 border-2 border-white/20 bg-white px-8 text-base text-neutral-950 hover:bg-white/90"
                  >
                    Shop Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background Image */}
          {promotion.image_url && (
            <Image
              src={promotion.image_url}
              alt={promotion.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-neutral-950/85" />

          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative flex flex-col items-center justify-center px-6 py-16 text-center sm:px-12 sm:py-20 lg:flex-row lg:justify-between lg:py-24 lg:text-left">
            <div className="max-w-xl">
              {promotion.ends_at && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Limited Time Offer
                </motion.div>
              )}

              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              >
                {promotion.title}
              </motion.h2>

              {promotion.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-4 text-base text-white/70 sm:text-lg"
                >
                  {promotion.subtitle}
                </motion.p>
              )}
            </div>

            {promotion.link_url && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 lg:mt-0"
              >
                <Link href={promotion.link_url}>
                  <Button
                    size="lg"
                    className="group gap-2 border-2 border-white/20 bg-white px-8 text-base text-neutral-950 hover:bg-white/90"
                  >
                    Shop Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
