"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

const popularSearches = [
  "Slim Fit Jeans",
  "Cargo Pants",
  "Hoodies",
  "Sweatshirts",
  "Casual Shirts",
  "Graphic T-Shirts",
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 },
  },
  exit: { opacity: 0, y: -20 },
};

export function SearchOverlay() {
  const router = useRouter();
  const searchOpen = useUIStore((s) => s.searchOpen);
  const closeSearch = useUIStore((s) => s.closeSearch);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autofocus when overlay opens
  useEffect(() => {
    if (searchOpen) {
      // Small delay to let the animation start before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
      setIsSearching(false);
    }
  }, [searchOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, closeSearch]);

  // Lock body scroll when open
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.trim().length > 0) {
        setIsSearching(true);
        debounceRef.current = setTimeout(() => {
          // Debounced search action -- can be connected to an API later
          setIsSearching(false);
        }, 600);
      } else {
        setIsSearching(false);
      }
    },
    []
  );

  const handlePopularSearch = (term: string) => {
    setQuery(term);
    setIsSearching(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setIsSearching(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      closeSearch();
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[60] flex flex-col bg-black/60 backdrop-blur-md"
        >
          {/* Close button */}
          <div className="flex justify-end px-4 pt-4 sm:px-6">
            <button
              onClick={closeSearch}
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Close search"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-16 sm:pt-24"
          >
            {/* Search Form */}
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute top-1/2 left-5 h-6 w-6 -translate-y-1/2 text-white/50" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Search for jeans, hoodies, shirts..."
                  className="w-full rounded-2xl border border-white/20 bg-white/10 py-5 pl-14 pr-14 text-lg text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                />
                {isSearching && (
                  <Loader2 className="absolute top-1/2 right-5 h-5 w-5 -translate-y-1/2 animate-spin text-white/50" />
                )}
              </div>
            </form>

            {/* Search State */}
            {query.trim().length > 0 ? (
              <div className="mt-8 text-center">
                {isSearching ? (
                  <p className="text-sm text-white/60">Searching...</p>
                ) : (
                  <p className="text-sm text-white/60">
                    Press Enter to search for &quot;{query}&quot;
                  </p>
                )}
              </div>
            ) : (
              /* Popular Searches */
              <div className="mt-10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-white/50" />
                  <p className="text-sm font-medium text-white/50">
                    Popular Searches
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularSearch(term)}
                      className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
