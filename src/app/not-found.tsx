import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-lg flex-col items-center text-center">
        {/* 404 Number */}
        <div className="relative">
          <span className="font-display text-[120px] font-bold leading-none text-surface-2 sm:text-[160px]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-br from-primary to-accent p-4 shadow-xl">
              <Search className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-4xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mt-4 text-muted">
          The page you&apos;re looking for doesn&apos;t exist. It may have been
          moved or removed. Let us help you find your way back.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/products">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {[
            { href: "/products", label: "Shop" },
            { href: "/categories", label: "Categories" },
            { href: "/about", label: "About Us" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
