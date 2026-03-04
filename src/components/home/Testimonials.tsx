"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  quote: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rahul S.",
    location: "Mumbai",
    rating: 5,
    quote:
      "The slim-fit jeans from Vastrayug are hands down the best I've owned. The denim quality is premium, the fit is spot-on, and they look great whether I'm dressing up or keeping it casual. Highly recommend!",
    initials: "RS",
  },
  {
    id: 2,
    name: "Arjun M.",
    location: "Delhi",
    rating: 5,
    quote:
      "Ordered the oversized hoodie and I'm obsessed. The fabric is incredibly soft, the stitching is solid, and it keeps me warm without being bulky. Vastrayug really nails the streetwear aesthetic.",
    initials: "AM",
  },
  {
    id: 3,
    name: "Vikram P.",
    location: "Bangalore",
    rating: 5,
    quote:
      "The cargo pants fit like they were tailored for me. Great pocket placement, comfortable fabric, and they look way more premium than the price suggests. Already ordered two more colors.",
    initials: "VP",
  },
  {
    id: 4,
    name: "Karan D.",
    location: "Pune",
    rating: 4,
    quote:
      "I've been looking for well-fitted shirts that don't compromise on comfort, and Vastrayug delivered. The cotton is breathable, the collar sits perfectly, and the colors don't fade after washing.",
    initials: "KD",
  },
  {
    id: 5,
    name: "Aditya R.",
    location: "Hyderabad",
    rating: 5,
    quote:
      "Their sweatshirts are next level. The fleece lining is super cozy, and the minimalist design works for everything from gym sessions to weekend outings. Best men's clothing brand I've found online.",
    initials: "AR",
  },
  {
    id: 6,
    name: "Rohit K.",
    location: "Chennai",
    rating: 5,
    quote:
      "The graphic t-shirts are fire! Premium cotton that feels amazing on the skin, and the prints don't crack or peel. Fast delivery and great packaging too. Vastrayug is now my go-to brand.",
    initials: "RK",
  },
];

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const navigate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return testimonials.length - 1;
      if (next >= testimonials.length) return 0;
      return next;
    });
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    }),
  };

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
            Real Reviews
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-px w-8 bg-border" />
            <span className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-accent" />
            <span className="h-px w-8 bg-border" />
          </div>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14"
        >
          <div className="relative mx-auto max-w-3xl">
            {/* Main testimonial card */}
            <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-12">
              {/* Decorative quote mark */}
              <Quote className="absolute right-6 top-6 h-16 w-16 text-primary/5 sm:h-24 sm:w-24" />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shadow-lg">
                      {testimonials[activeIndex].initials}
                    </div>

                    {/* Rating */}
                    <div className="mt-4">
                      <Rating
                        value={testimonials[activeIndex].rating}
                        size="md"
                        readonly
                      />
                    </div>

                    {/* Quote */}
                    <blockquote className="mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
                      &ldquo;{testimonials[activeIndex].quote}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-foreground">
                        {testimonials[activeIndex].name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {testimonials[activeIndex].location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted transition-all hover:border-primary hover:text-primary hover:shadow-md"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > activeIndex ? 1 : -1);
                      setActiveIndex(index);
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      index === activeIndex
                        ? "w-8 bg-gradient-to-r from-primary to-accent"
                        : "w-2 bg-border-hover hover:bg-muted-light"
                    )}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => navigate(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted transition-all hover:border-primary hover:text-primary hover:shadow-md"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
