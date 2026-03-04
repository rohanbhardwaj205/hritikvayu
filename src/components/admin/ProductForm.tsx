"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { VariantManager, type VariantRow } from "./VariantManager";
import { ImageManager, type ManagedImage } from "./ImageManager";
import { slugify } from "@/lib/utils";
import type { Product, Category } from "@/types";
import { cn } from "@/lib/utils";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  rich_description: z.string().optional(),
  category_id: z.string().optional(),
  base_price: z.number().int().positive("Price must be positive"),
  compare_price: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type FormData = z.infer<typeof productFormSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  mode: "create" | "edit";
}

export function ProductForm({ product, categories, mode }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [richDescription, setRichDescription] = useState(
    product?.rich_description || ""
  );
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [basePrice, setBasePrice] = useState(
    product ? String(product.base_price) : ""
  );
  const [comparePrice, setComparePrice] = useState(
    product?.compare_price ? String(product.compare_price) : ""
  );
  const [tagsInput, setTagsInput] = useState(
    product?.tags?.join(", ") || ""
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);

  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size || "",
      color: v.color || "",
      color_hex: v.color_hex || "#000000",
      price_override: v.price_override ? String(v.price_override) : "",
      stock: String(v.stock),
      is_active: v.is_active,
    })) || []
  );

  const [images, setImages] = useState<ManagedImage[]>(
    product?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      alt_text: img.alt_text,
      sort_order: img.sort_order,
      is_primary: img.is_primary,
    })) || []
  );

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === "create" || !product?.slug) {
      setSlug(slugify(name));
    }
  }, [name, mode, product?.slug]);

  const categoryOptions = [
    { value: "", label: "No category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const validate = (): boolean => {
    const result = productFormSchema.safeParse({
      name,
      slug,
      description: description || undefined,
      rich_description: richDescription || undefined,
      category_id: categoryId || undefined,
      base_price: basePrice ? parseInt(basePrice, 10) : 0,
      compare_price: comparePrice ? parseInt(comparePrice, 10) : undefined,
      tags: tagsInput
        ? tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      is_active: isActive,
      is_featured: isFeatured,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name,
        slug,
        description: description || null,
        rich_description: richDescription || null,
        category_id: categoryId || null,
        base_price: parseInt(basePrice, 10),
        compare_price: comparePrice ? parseInt(comparePrice, 10) : null,
        tags: tagsInput
          ? tagsInput
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        is_active: isActive,
        is_featured: isFeatured,
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size || null,
          color: v.color || null,
          color_hex: v.color_hex || null,
          price_override: v.price_override
            ? parseInt(v.price_override, 10)
            : null,
          stock: parseInt(v.stock, 10) || 0,
          is_active: v.is_active,
        })),
      };

      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Save product error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <h3 className="mb-5 text-base font-semibold text-admin-text">
          Basic Information
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Enter product name"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={errors.slug}
            placeholder="auto-generated-slug"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Short Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief product description"
              rows={3}
              className="!bg-admin-bg !text-admin-text !border-admin-border"
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Rich Description"
              value={richDescription}
              onChange={(e) => setRichDescription(e.target.value)}
              placeholder="Detailed product description (supports rich text)"
              rows={5}
              className="!bg-admin-bg !text-admin-text !border-admin-border"
            />
          </div>
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
            placeholder="Select a category"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Tags (comma-separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="cotton, summer, casual"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <h3 className="mb-5 text-base font-semibold text-admin-text">
          Pricing (in paise)
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Base Price"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            error={errors.base_price}
            placeholder="e.g. 99900 for Rs 999"
            min="0"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Compare Price (optional)"
            type="number"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            placeholder="Original price for strikethrough"
            min="0"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <h3 className="mb-5 text-base font-semibold text-admin-text">
          Visibility
        </h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isActive ? "bg-emerald-500" : "bg-admin-border"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                  isActive ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className="text-sm text-admin-text">Active</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isFeatured ? "bg-amber-500" : "bg-admin-border"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                  isFeatured ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className="text-sm text-admin-text">Featured</span>
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <ImageManager images={images} onChange={setImages} />
      </div>

      {/* Variants */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <VariantManager variants={variants} onChange={setVariants} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/products")}
          disabled={saving}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          {mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
