"use client";

import { useState, useEffect } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductForm } from "@/components/admin/ProductForm";
import { Spinner } from "@/components/ui/Spinner";
import type { Category } from "@/types";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          setCategories(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-primary-light" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "New Product" },
        ]}
        className="[&_a]:text-admin-muted [&_a:hover]:text-primary-light [&_span]:text-admin-text"
      />

      <div>
        <h1 className="text-2xl font-bold text-admin-text">New Product</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Add a new product to your catalog
        </p>
      </div>

      <ProductForm categories={categories} mode="create" />
    </div>
  );
}
