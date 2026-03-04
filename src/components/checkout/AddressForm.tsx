"use client";

import { useState } from "react";
import { z } from "zod/v4";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { addressSchema, type AddressInput } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/types";

const labelOptions = [
  { value: "Home", label: "Home" },
  { value: "Work", label: "Work" },
  { value: "Other", label: "Other" },
];

const stateOptions = [
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Delhi", label: "Delhi" },
  { value: "Chandigarh", label: "Chandigarh" },
];

interface AddressFormProps {
  initialData?: Address | null;
  onSave: (data: AddressInput) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function AddressForm({
  initialData,
  onSave,
  onCancel,
  className,
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressInput>({
    label: initialData?.label ?? "Home",
    full_name: initialData?.full_name ?? "",
    phone: initialData?.phone ?? "",
    address_line1: initialData?.address_line1 ?? "",
    address_line2: initialData?.address_line2 ?? "",
    city: initialData?.city ?? "",
    state: initialData?.state ?? "",
    pincode: initialData?.pincode ?? "",
    country: initialData?.country ?? "India",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof AddressInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key && typeof key === "string") {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(result.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Label"
          options={labelOptions}
          value={formData.label}
          onChange={(e) => handleChange("label", e.target.value)}
          error={errors.label}
        />

        <Input
          label="Full Name"
          value={formData.full_name}
          onChange={(e) => handleChange("full_name", e.target.value)}
          placeholder="John Doe"
          error={errors.full_name}
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="9876543210"
          error={errors.phone}
        />

        <Input
          label="Pincode"
          value={formData.pincode}
          onChange={(e) => handleChange("pincode", e.target.value)}
          placeholder="302001"
          maxLength={6}
          error={errors.pincode}
        />
      </div>

      <Input
        label="Address Line 1"
        value={formData.address_line1}
        onChange={(e) => handleChange("address_line1", e.target.value)}
        placeholder="House number, Building name, Street"
        error={errors.address_line1}
      />

      <Input
        label="Address Line 2 (Optional)"
        value={formData.address_line2 ?? ""}
        onChange={(e) => handleChange("address_line2", e.target.value)}
        placeholder="Landmark, Area"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          placeholder="Jaipur"
          error={errors.city}
        />

        <Select
          label="State"
          options={stateOptions}
          value={formData.state}
          onChange={(e) => handleChange("state", e.target.value)}
          placeholder="Select state"
          error={errors.state}
        />

        <Input
          label="Country"
          value={formData.country}
          onChange={(e) => handleChange("country", e.target.value)}
          disabled
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          <Save className="h-4 w-4" />
          {initialData ? "Update Address" : "Save Address"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
