"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: (item: T, index: number) => string | number;
  onRowClick?: (item: T) => void;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  key: string | null;
  direction: SortDirection;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  className,
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>({
    key: null,
    direction: null,
  });

  const handleSort = (columnKey: string) => {
    setSort((prev) => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key: columnKey, direction: "desc" };
      }
      return { key: null, direction: null };
    });
  };

  const sortedData = (() => {
    if (!sort.key || !sort.direction) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sort.key!];
      const bVal = b[sort.key!];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sort.direction === "desc" ? -comparison : comparison;
    });
  })();

  const getSortIcon = (columnKey: string) => {
    if (sort.key !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-light" />;
    }
    if (sort.direction === "asc") {
      return <ArrowUp className="h-3.5 w-3.5 text-primary" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-border",
        className
      )}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider",
                  column.sortable && "cursor-pointer select-none hover:text-foreground",
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.key)}
                aria-sort={
                  sort.key === column.key
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {loading ? (
            // Loading skeleton rows
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <Skeleton variant="text" width="80%" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            // Empty state
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            // Data rows
            sortedData.map((item, index) => (
              <tr
                key={rowKey ? rowKey(item, index) : index}
                className={cn(
                  "bg-card transition-colors",
                  onRowClick &&
                    "cursor-pointer hover:bg-card-hover",
                  !onRowClick && "hover:bg-surface"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-sm text-foreground",
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(item, index)
                      : (item[column.key] as ReactNode) ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export type { DataTableProps, Column };
