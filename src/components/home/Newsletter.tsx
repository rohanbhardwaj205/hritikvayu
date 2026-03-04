"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Send, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStatus("success");
    setEmail("");

    // Reset after 4 seconds
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section ref={ref} className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card"
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B4513' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Floating accents */}
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br from-accent/10 to-primary/5 blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-gradient-to-tr from-primary/8 to-accent/5 blur-2xl"
          />

          <div className="relative flex flex-col items-center px-6 py-14 text-center sm:px-12 sm:py-20">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10"
            >
              <Mail className="h-7 w-7 text-primary" />
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl"
            >
              Stay Ahead of the Game
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3 max-w-md text-muted"
            >
              Be the first to know about new drops, exclusive deals, and style
              tips.
            </motion.p>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              onSubmit={handleSubmit}
              className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1" suppressHydrationWarning>
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={status === "loading" || status === "success"}
                  className={cn(
                    "w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-light",
                    "transition-colors duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                    "border-border hover:border-border-hover",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={status === "loading" || status === "success"}
                className="gap-2 whitespace-nowrap"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : status === "success" ? (
                  <>
                    <Check className="h-4 w-4" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Subscribe
                  </>
                )}
              </Button>
            </motion.form>

            {/* Success message */}
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm font-medium text-success"
              >
                Welcome! You&apos;ll hear from us soon with exclusive updates.
              </motion.p>
            )}

            {/* Privacy note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-4 text-xs text-muted-light"
            >
              No spam, ever. Unsubscribe anytime. Read our{" "}
              <a
                href="/privacy-policy"
                className="text-primary underline underline-offset-2 hover:text-primary-hover"
              >
                Privacy Policy
              </a>
              .
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
