"use client";

import { create } from "zustand";

type SortOption = "newest" | "price_asc" | "price_desc" | "popular" | "rating";

interface FilterState {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sizes: string[];
  colors: string[];
  sort: SortOption;
  search: string;
  page: number;

  setFilter: <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
}

type FilterValues = {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sizes: string[];
  colors: string[];
  sort: SortOption;
  search: string;
  page: number;
};

const initialFilterState: FilterValues = {
  category: null,
  minPrice: null,
  maxPrice: null,
  sizes: [],
  colors: [],
  sort: "newest",
  search: "",
  page: 1,
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...initialFilterState,

  setFilter: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      // Reset page to 1 when any filter changes (except page itself)
      ...(key !== "page" ? { page: 1 } : {}),
    })),

  resetFilters: () => set(initialFilterState),

  setPage: (page) => set({ page }),
}));
