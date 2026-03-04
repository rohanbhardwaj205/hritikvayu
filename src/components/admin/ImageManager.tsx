"use client";

import { useState } from "react";
import { Trash2, Star, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

export interface ManagedImage {
  id?: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  file?: File;
}

interface ImageManagerProps {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
}

export function ImageManager({ images, onChange }: ImageManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleUpload = (files: File[]) => {
    const newImages: ManagedImage[] = files.map((file, i) => ({
      url: URL.createObjectURL(file),
      alt_text: null,
      sort_order: images.length + i,
      is_primary: images.length === 0 && i === 0,
      file,
    }));
    onChange([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If the removed image was primary, make the first one primary
    if (images[index].is_primary && updated.length > 0) {
      updated[0] = { ...updated[0], is_primary: true };
    }
    // Reorder
    const reordered = updated.map((img, i) => ({ ...img, sort_order: i }));
    onChange(reordered);
    setDeleteIndex(null);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reordered = updated.map((img, i) => ({ ...img, sort_order: i }));
    onChange(reordered);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const updated = [...images];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reordered = updated.map((img, i) => ({ ...img, sort_order: i }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-admin-text">
        Product Images ({images.length})
      </h4>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image.url + index}
              className={cn(
                "group relative overflow-hidden rounded-lg border-2",
                image.is_primary
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-admin-border"
              )}
            >
              <div className="relative aspect-square bg-admin-bg">
                <img
                  src={image.url}
                  alt={image.alt_text || `Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-admin-surface -z-10">
                  <ImageIcon className="h-8 w-8 text-admin-muted" />
                </div>
              </div>

              {/* Primary badge */}
              {image.is_primary && (
                <div className="absolute top-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  PRIMARY
                </div>
              )}

              {/* Controls overlay */}
              <div className="absolute inset-0 flex items-end justify-center gap-1 bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                {!image.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(index)}
                    className="rounded-md bg-white/90 p-1.5 text-amber-600 transition-colors hover:bg-white"
                    title="Set as primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="rounded-md bg-white/90 p-1.5 text-gray-700 transition-colors hover:bg-white disabled:opacity-40"
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === images.length - 1}
                  className="rounded-md bg-white/90 p-1.5 text-gray-700 transition-colors hover:bg-white disabled:opacity-40"
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteIndex(index)}
                  className="rounded-md bg-white/90 p-1.5 text-red-600 transition-colors hover:bg-white"
                  title="Delete image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageUploader onUpload={handleUpload} multiple />

      <ConfirmDialog
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => deleteIndex !== null && removeImage(deleteIndex)}
        title="Delete Image"
        description="Are you sure you want to remove this image?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
