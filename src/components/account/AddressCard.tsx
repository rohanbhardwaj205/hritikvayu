"use client";

import { MapPin, Phone, Pencil, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  className?: string;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  className,
}: AddressCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 transition-all hover:shadow-sm",
        address.is_default ? "border-primary/30 bg-primary/[0.02]" : "border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              address.label === "Home"
                ? "info"
                : address.label === "Work"
                  ? "warning"
                  : "default"
            }
            size="md"
          >
            {address.label}
          </Badge>
          {address.is_default && (
            <Badge variant="success" size="sm">
              Default
            </Badge>
          )}
        </div>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-foreground mb-1">
        {address.full_name}
      </p>

      {/* Address */}
      <p className="text-sm text-muted leading-relaxed">
        {address.address_line1}
        {address.address_line2 && (
          <>
            <br />
            {address.address_line2}
          </>
        )}
        <br />
        {address.city}, {address.state} - {address.pincode}
        <br />
        {address.country}
      </p>

      {/* Phone */}
      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
        <Phone className="h-3 w-3" />
        {address.phone}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(address)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(address.id)}
          className="text-error hover:bg-error/5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
        {!address.is_default && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetDefault(address.id)}
            className="ml-auto text-muted hover:text-primary"
          >
            <Star className="h-3.5 w-3.5" />
            Set Default
          </Button>
        )}
      </div>
    </div>
  );
}
