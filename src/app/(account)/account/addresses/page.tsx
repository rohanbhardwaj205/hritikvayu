"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressForm } from "@/components/checkout/AddressForm";
import { useToast } from "@/providers/ToastProvider";
import type { Address } from "@/types";
import type { AddressInput } from "@/lib/validations";

export default function AddressesPage() {
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.data ?? []);
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
      const errData = await res.json();
      addToast(errData.error || "Failed to save address", "error");
      return;
    }

    addToast(
      editingAddress ? "Address updated" : "Address added",
      "success"
    );
    setModalOpen(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );
    if (!confirmed) return;

    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Address deleted", "success");
      fetchAddresses();
    } else {
      addToast("Failed to delete address", "error");
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}/default`, {
      method: "PUT",
    });
    if (res.ok) {
      addToast("Default address updated", "success");
      fetchAddresses();
    } else {
      addToast("Failed to update default address", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            My Addresses
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage your delivery addresses for faster checkout.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingAddress(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {/* Address Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" className="text-primary" />
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-2 mb-4">
            <MapPin className="h-8 w-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No addresses saved
          </h3>
          <p className="text-sm text-muted max-w-sm mb-6">
            Add your first delivery address to speed up checkout.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setEditingAddress(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      )}

      {/* Address Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        size="lg"
      >
        <AddressForm
          initialData={editingAddress}
          onSave={handleSave}
          onCancel={() => {
            setModalOpen(false);
            setEditingAddress(null);
          }}
        />
      </Modal>
    </div>
  );
}
