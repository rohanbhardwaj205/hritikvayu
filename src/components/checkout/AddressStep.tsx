"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Phone,
  Pencil,
  Trash2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/providers/ToastProvider";
import { AddressForm } from "./AddressForm";
import type { Address } from "@/types";
import type { AddressInput } from "@/lib/validations";

interface AddressStepProps {
  onContinue: (address: Address) => void;
  className?: string;
}

export function AddressStep({ onContinue, className }: AddressStepProps) {
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        const list: Address[] = data.data ?? [];
        setAddresses(list);

        // Pre-select default address
        const defaultAddr = list.find((a) => a.is_default);
        if (defaultAddr) {
          setSelectedId(defaultAddr.id);
        } else if (list.length > 0) {
          setSelectedId(list[0].id);
        }

        if (list.length === 0) {
          setShowForm(true);
        }
      }
    } catch {
      addToast("Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSave = async (data: AddressInput) => {
    const url = editingAddress
      ? `/api/addresses/${editingAddress.id}`
      : "/api/addresses";
    const method = editingAddress ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      addToast(errorData.error || "Failed to save address", "error");
      return;
    }

    addToast(
      editingAddress ? "Address updated" : "Address added",
      "success"
    );
    setShowForm(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Address deleted", "success");
      if (selectedId === id) setSelectedId(null);
      fetchAddresses();
    } else {
      addToast("Failed to delete address", "error");
    }
  };

  const handleContinue = () => {
    const selected = addresses.find((a) => a.id === selectedId);
    if (!selected) {
      addToast("Please select a delivery address", "warning");
      return;
    }
    onContinue(selected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground font-display">
          Delivery Address
        </h2>
        {!showForm && addresses.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <AddressForm
                initialData={editingAddress}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {addresses.map((address) => (
              <div
                key={address.id}
                onClick={() => setSelectedId(address.id)}
                className={cn(
                  "relative flex gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all",
                  selectedId === address.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border-hover"
                )}
              >
                {/* Radio indicator */}
                <div className="flex-shrink-0 pt-0.5">
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedId === address.id
                        ? "border-primary"
                        : "border-border-hover"
                    )}
                  >
                    {selectedId === address.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2.5 w-2.5 rounded-full bg-primary"
                      />
                    )}
                  </div>
                </div>

                {/* Address Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {address.full_name}
                    </span>
                    <Badge
                      variant={address.label === "Home" ? "info" : "default"}
                      size="sm"
                    >
                      {address.label}
                    </Badge>
                    {address.is_default && (
                      <Badge variant="success" size="sm">
                        Default
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted leading-relaxed">
                    {address.address_line1}
                    {address.address_line2 && `, ${address.address_line2}`}
                    <br />
                    {address.city}, {address.state} - {address.pincode}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted">
                    <Phone className="h-3 w-3" />
                    {address.phone}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress(address);
                      setShowForm(true);
                    }}
                    className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    aria-label="Edit address"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address.id);
                    }}
                    className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!showForm && addresses.length > 0 && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleContinue}
          disabled={!selectedId}
        >
          Continue to Payment
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
