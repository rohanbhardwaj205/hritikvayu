"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  category?: Category | null;
  categories: Category[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  image?: File;
}

export function CategoryForm({
  isOpen,
  onClose,
  onSave,
  category,
  categories,
}: CategoryFormProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!category;

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setParentId(category.parent_id || "");
      setSortOrder(String(category.sort_order));
      setIsActive(category.is_active);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setParentId("");
      setSortOrder("0");
      setIsActive(true);
    }
    setImageFile(null);
    setErrors({});
  }, [category, isOpen]);

  useEffect(() => {
    if (!isEdit) {
      setSlug(slugify(name));
    }
  }, [name, isEdit]);

  // Exclude self and children from parent options
  const parentOptions = [
    { value: "", label: "No parent (Top level)" },
    ...categories
      .filter((c) => !category || c.id !== category.id)
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        name,
        slug,
        description,
        parent_id: parentId || null,
        sort_order: parseInt(sortOrder, 10) || 0,
        is_active: isActive,
        image: imageFile || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Save category error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Category" : "New Category"}
      size="lg"
    >
      <div className="space-y-4">
        <Input
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="e.g. Men's Kurtas"
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={errors.slug}
          placeholder="auto-generated"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Category description"
          rows={3}
        />
        <Select
          label="Parent Category"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          options={parentOptions}
        />
        <Input
          label="Sort Order"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          min="0"
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              isActive ? "bg-emerald-500" : "bg-gray-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                isActive ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <span className="text-sm font-medium text-foreground">Active</span>
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Category Image
          </p>
          <ImageUploader
            onUpload={(files) => setImageFile(files[0])}
            multiple={false}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={saving}>
          {isEdit ? "Save Changes" : "Create Category"}
        </Button>
      </div>
    </Modal>
  );
}
