"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductForm } from "@/components/admin/ProductForm";
import { Spinner } from "@/components/ui/Spinner";
import type { Product, Category } from "@/types";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch("/api/categories"),
        ]);

        if (!productRes.ok) {
          setError("Product not found");
          return;
        }

        const productJson = await productRes.json();
        setProduct(productJson.data);

        if (categoriesRes.ok) {
          const categoriesJson = await categoriesRes.json();
          setCategories(categoriesJson.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-primary-light" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-admin-text">
          {error || "Product not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "Edit Product" },
        ]}
        className="[&_a]:text-admin-muted [&_a:hover]:text-primary-light [&_span]:text-admin-text"
      />

      <div>
        <h1 className="text-2xl font-bold text-admin-text">Edit Product</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Editing: {product.name}
        </p>
      </div>

      <ProductForm product={product} categories={categories} mode="edit" />
    </div>
  );
}
