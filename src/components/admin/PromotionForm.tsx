"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { cn } from "@/lib/utils";
import type { Promotion } from "@/types";

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PromotionFormData) => Promise<void>;
  promotion?: Promotion | null;
}

export interface PromotionFormData {
  title: string;
  subtitle: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  image?: File;
}

export function PromotionForm({
  isOpen,
  onClose,
  onSave,
  promotion,
}: PromotionFormProps) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!promotion;

  useEffect(() => {
    if (promotion) {
      setTitle(promotion.title);
      setSubtitle(promotion.subtitle || "");
      setLinkUrl(promotion.link_url || "");
      setSortOrder(String(promotion.sort_order));
      setIsActive(promotion.is_active);
      setStartsAt(
        promotion.starts_at
          ? new Date(promotion.starts_at).toISOString().slice(0, 16)
          : ""
      );
      setEndsAt(
        promotion.ends_at
          ? new Date(promotion.ends_at).toISOString().slice(0, 16)
          : ""
      );
    } else {
      setTitle("");
      setSubtitle("");
      setLinkUrl("");
      setSortOrder("0");
      setIsActive(true);
      setStartsAt("");
      setEndsAt("");
    }
    setImageFile(null);
    setErrors({});
  }, [promotion, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!isEdit && !imageFile) newErrors.image = "Image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        title,
        subtitle,
        link_url: linkUrl,
        sort_order: parseInt(sortOrder, 10) || 0,
        is_active: isActive,
        starts_at: startsAt ? new Date(startsAt).toISOString() : "",
        ends_at: endsAt ? new Date(endsAt).toISOString() : "",
        image: imageFile || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Save promotion error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Promotion" : "New Promotion"}
      size="lg"
    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="Promotion title"
        />
        <Input
          label="Subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Optional subtitle"
        />
        <Input
          label="Link URL"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="/products?category=sale"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sort Order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            min="0"
          />
          <div className="flex items-end pb-1">
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
              <span className="text-sm font-medium text-foreground">
                Active
              </span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Starts At"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <Input
            label="Ends At"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Promotion Image
          </p>
          <ImageUploader
            onUpload={(files) => setImageFile(files[0])}
            multiple={false}
          />
          {errors.image && (
            <p className="mt-1 text-xs text-error">{errors.image}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={saving}>
          {isEdit ? "Save Changes" : "Create Promotion"}
        </Button>
      </div>
    </Modal>
  );
}
