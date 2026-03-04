"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const categories = [
  {
    id: "jeans",
    name: "Jeans",
    slug: "jeans",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
  },
  {
    id: "cargos",
    name: "Cargos",
    slug: "cargos",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop",
  },
  {
    id: "sweatshirts",
    name: "Sweatshirts",
    slug: "sweatshirts",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop",
  },
  {
    id: "hoodies",
    name: "Hoodies",
    slug: "hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop",
  },
  {
    id: "shirts",
    name: "Shirts",
    slug: "shirts",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
  },
  {
    id: "t-shirts",
    name: "T-Shirts",
    slug: "t-shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
  },
];

export function CategoryShowcase() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Browse
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Shop by Category
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-px w-8 bg-border" />
            <span className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-accent" />
            <span className="h-px w-8 bg-border" />
          </div>
          <p className="mt-4 max-w-xl text-muted">
            From rugged cargos to classic shirts, find your perfect fit across
            our premium men&apos;s collections.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={fadeUp}>
              <Link
                href={`/categories/${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
              >
                {/* Background Image */}
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/60 group-hover:via-black/20" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
                  <h3 className="font-display text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                    {category.name}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-hover:gap-2.5">
                    Shop Now
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
