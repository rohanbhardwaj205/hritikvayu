"use client";

import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({
  src,
  alt = "",
  size = "md",
  fallback,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = fallback ? getInitials(fallback) : alt ? getInitials(alt) : "?";

  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-primary-light text-white font-medium overflow-hidden shrink-0",
        sizeStyles[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

export type { AvatarProps, AvatarSize };
