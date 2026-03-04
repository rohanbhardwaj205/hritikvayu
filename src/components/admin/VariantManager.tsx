"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ALL_SIZES } from "@/constants/sizes";
import { cn } from "@/lib/utils";

export interface VariantRow {
  id?: string;
  sku: string;
  size: string;
  color: string;
  color_hex: string;
  price_override: string;
  stock: string;
  is_active: boolean;
}

interface VariantManagerProps {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
}

const sizeOptions = ALL_SIZES.map((s) => ({ value: s, label: s }));

export function VariantManager({ variants, onChange }: VariantManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const addVariant = () => {
    onChange([
      ...variants,
      {
        sku: "",
        size: "",
        color: "",
        color_hex: "#000000",
        price_override: "",
        stock: "0",
        is_active: true,
      },
    ]);
  };

  const updateVariant = (
    index: number,
    field: keyof VariantRow,
    value: string | boolean
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
    setDeleteIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-admin-text">
          Variants ({variants.length})
        </h4>
        <Button variant="outline" size="sm" onClick={addVariant}>
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-admin-border p-8 text-center">
          <p className="text-sm text-admin-muted">
            No variants added yet. Click "Add Variant" to create one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-admin-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-admin-bg">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                  SKU
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                  Size
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                  Color
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                  Hex
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                  Price Override
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                  Stock
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-admin-muted">
                  Active
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-admin-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {variants.map((variant, index) => (
                <tr
                  key={index}
                  className="transition-colors hover:bg-admin-bg/50"
                >
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      placeholder="SKU-001"
                      className="h-8 w-28 rounded border border-admin-border bg-admin-bg px-2 text-sm text-admin-text placeholder:text-admin-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                      className="h-8 w-24 rounded border border-admin-border bg-admin-bg px-2 text-sm text-admin-text focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      <option value="">--</option>
                      {sizeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) =>
                        updateVariant(index, "color", e.target.value)
                      }
                      placeholder="Red"
                      className="h-8 w-24 rounded border border-admin-border bg-admin-bg px-2 text-sm text-admin-text placeholder:text-admin-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={variant.color_hex}
                        onChange={(e) =>
                          updateVariant(index, "color_hex", e.target.value)
                        }
                        className="h-8 w-8 cursor-pointer rounded border border-admin-border bg-transparent p-0.5"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={variant.price_override}
                      onChange={(e) =>
                        updateVariant(index, "price_override", e.target.value)
                      }
                      placeholder="--"
                      className="h-8 w-24 rounded border border-admin-border bg-admin-bg px-2 text-sm text-admin-text placeholder:text-admin-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                      min="0"
                      className="h-8 w-20 rounded border border-admin-border bg-admin-bg px-2 text-sm text-admin-text focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateVariant(index, "is_active", !variant.is_active)
                      }
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        variant.is_active ? "bg-emerald-500" : "bg-admin-border"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                          variant.is_active
                            ? "translate-x-4"
                            : "translate-x-1"
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => setDeleteIndex(index)}
                      className="rounded-md p-1.5 text-admin-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Delete variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => deleteIndex !== null && removeVariant(deleteIndex)}
        title="Delete Variant"
        description="Are you sure you want to delete this variant? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
