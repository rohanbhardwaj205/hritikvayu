"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const borderColorMap: Record<ToastType, string> = {
  success: "border-l-success",
  error: "border-l-error",
  warning: "border-l-warning",
  info: "border-l-info",
};

const iconColorMap: Record<ToastType, string> = {
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-info",
};

export function Toast({
  id,
  message,
  type = "info",
  onClose,
  duration = 5000,
}: ToastProps) {
  const Icon = iconMap[type];

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-lg border border-border bg-card shadow-lg",
        "border-l-4",
        borderColorMap[type]
      )}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColorMap[type])} />
        <p className="flex-1 text-sm text-foreground">{message}</p>
        <button
          onClick={() => onClose(id)}
          className="shrink-0 p-0.5 rounded text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export type { ToastProps, ToastType };
