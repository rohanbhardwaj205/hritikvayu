"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function Card({
  children,
  className,
  hover = false,
  padding = true,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card",
        padding && "p-6",
        hover &&
          "transition-all duration-200 hover:shadow-md hover:border-border-hover hover:bg-card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}

export type { CardProps };
