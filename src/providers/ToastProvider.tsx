"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ---------- Toast Item Component ----------

const typeStyles: Record<ToastType, { bg: string; border: string; bar: string }> = {
  success: {
    bg: "bg-green-50 text-green-900",
    border: "border-green-200",
    bar: "bg-green-500",
  },
  error: {
    bg: "bg-red-50 text-red-900",
    border: "border-red-200",
    bar: "bg-red-500",
  },
  info: {
    bg: "bg-blue-50 text-blue-900",
    border: "border-blue-200",
    bar: "bg-blue-500",
  },
  warning: {
    bg: "bg-amber-50 text-amber-900",
    border: "border-amber-200",
    bar: "bg-amber-500",
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    // Trigger entry animation
    const showTimeout = setTimeout(() => setIsVisible(true), 10);

    // Animate progress bar
    function tick() {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    }
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(showTimeout);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [toast.duration]);

  const styles = typeStyles[toast.type];

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border shadow-lg
        transition-all duration-300 ease-out w-80
        ${styles.bg} ${styles.border}
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      role="alert"
    >
      <div className="flex items-start gap-2 p-3 pr-8">
        <span className="text-sm font-medium leading-snug">{toast.message}</span>
        <button
          onClick={() => onRemove(toast.id)}
          className="absolute right-2 top-2 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 w-full bg-black/5">
        <div
          className={`h-full ${styles.bar} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ---------- Toast Provider ----------

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove after duration + animation buffer
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const value: ToastContextValue = { toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
