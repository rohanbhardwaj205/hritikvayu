"use client";

import { type ElementType } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: ElementType;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-2 mb-4">
        <Icon className="h-8 w-8 text-muted" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      )}

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export type { EmptyStateProps, EmptyStateAction };
