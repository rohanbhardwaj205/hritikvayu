"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type SizeCategory = "tops" | "bottoms";

interface SizeGuideModalProps {
  defaultCategory?: SizeCategory;
  className?: string;
}

const SIZE_CHARTS: Record<
  SizeCategory,
  {
    headers: string[];
    rows: string[][];
  }
> = {
  tops: {
    headers: ["Size", "Chest (in)", "Chest (cm)", "Shoulder (in)", "Length (in)"],
    rows: [
      ["S", "36-38", "91-97", "17", "27"],
      ["M", "38-40", "97-102", "17.5", "28"],
      ["L", "40-42", "102-107", "18", "29"],
      ["XL", "42-44", "107-112", "18.5", "30"],
      ["XXL", "44-46", "112-117", "19", "31"],
    ],
  },
  bottoms: {
    headers: ["Size", "Waist (in)", "Waist (cm)", "Hip (in)", "Length (in)"],
    rows: [
      ["28", "28", "71", "36", "40"],
      ["30", "30", "76", "38", "41"],
      ["32", "32", "81", "40", "42"],
      ["34", "34", "86", "42", "42"],
      ["36", "36", "91", "44", "43"],
      ["38", "38", "97", "46", "43"],
    ],
  },
};

const CATEGORY_LABELS: Record<SizeCategory, string> = {
  tops: "Tops (Shirts, T-Shirts, Hoodies, Sweatshirts)",
  bottoms: "Bottoms (Jeans, Cargos)",
};

export function SizeGuideModal({
  defaultCategory = "tops",
  className,
}: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<SizeCategory>(defaultCategory);

  const chart = SIZE_CHARTS[activeCategory];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer underline underline-offset-2",
          className
        )}
      >
        <Ruler className="h-4 w-4" />
        Size Guide
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Size Guide"
        size="xl"
      >
        <div className="space-y-5">
          {/* Category Tabs */}
          <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
            {(Object.keys(SIZE_CHARTS) as SizeCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all cursor-pointer",
                  activeCategory === cat
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Size Chart Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface">
                  {chart.headers.map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "border-t border-border transition-colors hover:bg-surface/50",
                      index % 2 === 0 ? "bg-white" : "bg-surface/30"
                    )}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={cn(
                          "whitespace-nowrap px-4 py-2.5",
                          cellIndex === 0
                            ? "font-semibold text-foreground"
                            : "text-muted"
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measurement Tips */}
          <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              How to Measure
            </h4>
            <ul className="space-y-1 text-xs text-muted">
              <li>
                <strong>Chest:</strong> Measure around the fullest part of
                your chest, keeping the tape horizontal.
              </li>
              <li>
                <strong>Waist:</strong> Measure around your natural waistline,
                the narrowest part of your torso.
              </li>
              <li>
                <strong>Shoulder:</strong> Measure from the edge of one
                shoulder to the other across the back.
              </li>
              <li>
                <strong>Hip:</strong> Measure around the fullest part of your
                hips, keeping the tape level.
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
