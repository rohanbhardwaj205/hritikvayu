"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { z } from "zod/v4";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types";

const couponFormSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive("Discount value must be positive"),
  min_order_value: z.number().int().nonnegative().optional(),
  max_discount: z.number().int().nonnegative().optional(),
  usage_limit: z.number().int().nonnegative().optional(),
  per_user_limit: z.number().int().positive().default(1),
  valid_from: z.string().min(1, "Start date is required"),
  valid_until: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormErrors = Partial<Record<string, string>>;

interface CouponFormProps {
  coupon?: Coupon;
  mode: "create" | "edit";
}

export function CouponForm({ coupon, mode }: CouponFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [code, setCode] = useState(coupon?.code || "");
  const [description, setDescription] = useState(coupon?.description || "");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    coupon?.discount_type || "percentage"
  );
  const [discountValue, setDiscountValue] = useState(
    coupon ? String(coupon.discount_value) : ""
  );
  const [minOrderValue, setMinOrderValue] = useState(
    coupon?.min_order_value ? String(coupon.min_order_value) : ""
  );
  const [maxDiscount, setMaxDiscount] = useState(
    coupon?.max_discount ? String(coupon.max_discount) : ""
  );
  const [usageLimit, setUsageLimit] = useState(
    coupon?.usage_limit ? String(coupon.usage_limit) : ""
  );
  const [perUserLimit, setPerUserLimit] = useState(
    coupon ? String(coupon.per_user_limit) : "1"
  );
  const [validFrom, setValidFrom] = useState(
    coupon?.valid_from
      ? new Date(coupon.valid_from).toISOString().slice(0, 16)
      : ""
  );
  const [validUntil, setValidUntil] = useState(
    coupon?.valid_until
      ? new Date(coupon.valid_until).toISOString().slice(0, 16)
      : ""
  );
  const [isActive, setIsActive] = useState(coupon?.is_active ?? true);

  const discountTypeOptions = [
    { value: "percentage", label: "Percentage (%)" },
    { value: "fixed", label: "Fixed Amount" },
  ];

  const validate = (): boolean => {
    const result = couponFormSchema.safeParse({
      code: code.toUpperCase(),
      description: description || undefined,
      discount_type: discountType,
      discount_value: discountValue ? parseFloat(discountValue) : 0,
      min_order_value: minOrderValue
        ? parseInt(minOrderValue, 10)
        : undefined,
      max_discount: maxDiscount ? parseInt(maxDiscount, 10) : undefined,
      usage_limit: usageLimit ? parseInt(usageLimit, 10) : undefined,
      per_user_limit: parseInt(perUserLimit, 10) || 1,
      valid_from: validFrom ? new Date(validFrom).toISOString() : "",
      valid_until: validUntil
        ? new Date(validUntil).toISOString()
        : undefined,
      is_active: isActive,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
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
        code: code.toUpperCase(),
        description: description || null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_value: minOrderValue
          ? parseInt(minOrderValue, 10)
          : null,
        max_discount: maxDiscount ? parseInt(maxDiscount, 10) : null,
        usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
        per_user_limit: parseInt(perUserLimit, 10) || 1,
        valid_from: new Date(validFrom).toISOString(),
        valid_until: validUntil
          ? new Date(validUntil).toISOString()
          : null,
        is_active: isActive,
      };

      const url =
        mode === "create"
          ? "/api/coupons"
          : `/api/coupons/${coupon?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save coupon");
      }

      router.push("/admin/coupons");
      router.refresh();
    } catch (error) {
      console.error("Save coupon error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <h3 className="mb-5 text-base font-semibold text-admin-text">
          Coupon Details
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Coupon Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            error={errors.code}
            placeholder="SUMMER20"
            className="!bg-admin-bg !text-admin-text !border-admin-border uppercase"
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Coupon description"
              rows={2}
              className="!bg-admin-bg !text-admin-text !border-admin-border"
            />
          </div>
          <Select
            label="Discount Type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
            options={discountTypeOptions}
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Discount Value"
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            error={errors.discount_value}
            placeholder={
              discountType === "percentage" ? "e.g. 20" : "e.g. 50000"
            }
            min="0"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Min Order Value (paise)"
            type="number"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            placeholder="Optional"
            min="0"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Max Discount (paise)"
            type="number"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="Optional"
            min="0"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Usage Limit (total)"
            type="number"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
            min="0"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Per User Limit"
            type="number"
            value={perUserLimit}
            onChange={(e) => setPerUserLimit(e.target.value)}
            placeholder="1"
            min="1"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Valid From"
            type="datetime-local"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            error={errors.valid_from}
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Valid Until"
            type="datetime-local"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
        </div>

        <div className="mt-5">
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
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/coupons")}
          disabled={saving}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          {mode === "create" ? "Create Coupon" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
