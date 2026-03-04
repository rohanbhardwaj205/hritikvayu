"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Package } from "lucide-react";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { Badge } from "@/components/ui/Badge";
import { useDebounce } from "@/hooks/useDebounce";

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  stock: number;
  low_stock_threshold: number;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: "15",
      });
      if (showLowStockOnly) params.set("lowStock", "true");

      const res = await fetch(`/api/admin/inventory?${params}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
        setLowStockCount(json.lowStockCount || 0);
        setOutOfStockCount(json.outOfStockCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, showLowStockOnly]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleStockUpdate = async (variantId: string, newStock: number) => {
    try {
      const res = await fetch(`/api/admin/inventory/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        await fetchInventory();
      }
    } catch (error) {
      console.error("Update stock error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Inventory</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Track and manage product stock levels
        </p>
      </div>

      {/* Low Stock Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                <Package className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-400">
                  {outOfStockCount} Out of Stock
                </p>
                <p className="text-xs text-red-400/70">
                  Variants with zero stock
                </p>
              </div>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-400">
                  {lowStockCount} Low Stock
                </p>
                <p className="text-xs text-yellow-400/70">
                  Variants below threshold
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <InventoryTable
        items={items}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onStockUpdate={handleStockUpdate}
        showLowStockOnly={showLowStockOnly}
        onToggleLowStock={(val) => {
          setShowLowStockOnly(val);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
