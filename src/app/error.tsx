"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
          <AlertTriangle className="h-10 w-10 text-error" />
        </div>

        {/* Heading */}
        <h1 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl">
          Something Went Wrong
        </h1>

        {/* Description */}
        <p className="mt-4 text-muted">
          We apologize for the inconvenience. An unexpected error occurred while
          loading this page. Please try again or return to the homepage.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="mt-3 rounded-lg bg-surface-2 px-3 py-1.5 font-mono text-xs text-muted">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} size="lg" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
