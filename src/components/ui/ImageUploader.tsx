"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

interface PreviewFile {
  file: File;
  preview: string;
}

export function ImageUploader({
  onUpload,
  multiple = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const valid: File[] = [];
      for (const file of files) {
        if (maxSize && file.size > maxSize) {
          setError(
            `File "${file.name}" exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit`
          );
          continue;
        }
        if (accept && accept !== "*") {
          const acceptedTypes = accept.split(",").map((t) => t.trim());
          const isAccepted = acceptedTypes.some((type) => {
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", "/"));
            }
            return file.type === type;
          });
          if (!isAccepted) {
            setError(`File "${file.name}" is not an accepted format`);
            continue;
          }
        }
        valid.push(file);
      }
      return valid;
    },
    [accept, maxSize]
  );

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      setError(null);
      const filesArr = Array.from(fileList);
      const validFiles = validateFiles(
        multiple ? filesArr : [filesArr[0]]
      );

      if (validFiles.length === 0) return;

      const newPreviews: PreviewFile[] = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setPreviews((prev) => {
        // Revoke old URLs if not in multiple mode
        if (!multiple) {
          prev.forEach((p) => URL.revokeObjectURL(p.preview));
          return newPreviews;
        }
        return [...prev, ...newPreviews];
      });

      onUpload(validFiles);
    },
    [multiple, onUpload, validateFiles]
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    setPreviews((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-border-hover hover:bg-surface"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload image"
      >
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-surface-2">
          <Upload className="h-6 w-6 text-muted" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-muted mt-1">
            {accept === "image/*" ? "PNG, JPG, WebP" : accept} up to{" "}
            {(maxSize / (1024 * 1024)).toFixed(0)}MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => processFiles(e.target.files)}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((preview, index) => (
            <div
              key={preview.preview}
              className="relative group h-20 w-20 rounded-lg overflow-hidden border border-border bg-surface"
            >
              <img
                src={preview.preview}
                alt={preview.file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={`Remove ${preview.file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
              {/* Fallback icon overlay if image fails */}
              <div className="absolute inset-0 flex items-center justify-center bg-surface-2 -z-10">
                <ImageIcon className="h-6 w-6 text-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { ImageUploaderProps };
