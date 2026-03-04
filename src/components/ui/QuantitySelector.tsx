"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  className,
}: QuantitySelectorProps) {
  const canDecrement = value > min;
  const canIncrement = max === undefined || value < max;

  return (
    <div
      className={cn(
        "inline-flex items-center border border-border rounded-lg overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => canDecrement && onChange(value - 1)}
        disabled={!canDecrement}
        className={cn(
          "flex items-center justify-center h-9 w-9 transition-colors cursor-pointer",
          "text-foreground hover:bg-surface-2 active:bg-border",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span
        className="flex items-center justify-center h-9 min-w-[3rem] px-2 text-sm font-medium text-foreground border-x border-border bg-white select-none tabular-nums"
        aria-live="polite"
        aria-label={`Quantity: ${value}`}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => canIncrement && onChange(value + 1)}
        disabled={!canIncrement}
        className={cn(
          "flex items-center justify-center h-9 w-9 transition-colors cursor-pointer",
          "text-foreground hover:bg-surface-2 active:bg-border",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        )}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export type { QuantitySelectorProps };
