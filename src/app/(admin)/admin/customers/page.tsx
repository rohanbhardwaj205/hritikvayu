"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerTable } from "@/components/admin/CustomerTable";
import { useDebounce } from "@/hooks/useDebounce";
import type { Profile } from "@/types";

interface CustomerWithStats extends Profile {
  order_count: number;
  total_spent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: "10",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleBan = async (customerId: string, ban: boolean) => {
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_banned: ban }),
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Toggle ban error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Customers</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Manage your customer base
        </p>
      </div>

      <CustomerTable
        customers={customers}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        onToggleBan={handleToggleBan}
        searchQuery={searchQuery}
      />
    </div>
  );
}
