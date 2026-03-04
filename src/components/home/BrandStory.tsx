"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Gem, Shirt, Ruler } from "lucide-react";
import { Button } from "@/components/ui/Button";

const values = [
  {
    icon: Gem,
    title: "Premium Fabrics",
    description:
      "We source only the finest materials -- premium cotton, quality denim, and performance blends that feel as good as they look.",
  },
  {
    icon: Shirt,
    title: "Contemporary Designs",
    description:
      "Modern silhouettes and clean aesthetics that keep you looking sharp, whether you're dressing up or keeping it casual.",
  },
  {
    icon: Ruler,
    title: "Perfect Fit",
    description:
      "Every piece is crafted with precision sizing and tailored cuts, because great style starts with the right fit.",
  },
];

export function BrandStory() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Decorative background shape */}
            <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-50" />

            {/* Image placeholder with gradient */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200">
              {/* Subtle geometric pattern */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              {/* Center content: brand mark */}
              <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="rounded-full bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                  <span className="font-display text-4xl font-bold text-neutral-900 sm:text-5xl">
                    V
                  </span>
                </div>
                <p className="mt-4 font-display text-xl font-semibold text-neutral-700">
                  Est. 2024
                </p>
                <p className="mt-2 max-w-xs text-center text-sm text-muted">
                  Premium men&apos;s clothing for the modern generation
                </p>
              </div>

              {/* Floating accent dots */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-8 top-8 h-3 w-3 rounded-full bg-neutral-400/40"
              />
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 right-8 h-4 w-4 rounded-full bg-neutral-500/30"
              />
            </div>
          </motion.div>

          {/* Right: Story Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Our Story
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Built for the Modern Man
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-accent" />
              <span className="h-px w-8 bg-border" />
            </div>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
              <p>
                Vastrayug was built for men who refuse to compromise on quality or
                style. We believe that great clothing should make you feel
                confident, look sharp, and last through every chapter of your life.
              </p>
              <p>
                From the perfect pair of jeans to the coziest hoodie, every piece
                in our collection is designed with intention. We obsess over the
                details &mdash; premium fabrics, contemporary cuts, and finishes that
                stand the test of time &mdash; so you can focus on what matters most.
              </p>
            </div>

            {/* Values */}
            <div className="mt-8 space-y-5">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/5">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {value.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8"
            >
              <Link href="/about">
                <Button variant="outline" size="lg" className="group gap-2">
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
