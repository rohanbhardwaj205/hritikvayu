import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";

const quickLinks = [
  { href: "/categories/jeans", label: "Jeans" },
  { href: "/categories/cargos", label: "Cargos" },
  { href: "/categories/sweatshirts", label: "Sweatshirts" },
  { href: "/categories/hoodies", label: "Hoodies" },
  { href: "/categories/shirts", label: "Shirts" },
  { href: "/categories/t-shirts", label: "T-Shirts" },
];

const customerCare = [
  { href: "/faq", label: "FAQ" },
  { href: "/track-order", label: "Track Order" },
  { href: "/returns", label: "Returns & Exchange" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

const socialLinks = [
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-surface">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-block font-display text-2xl font-bold text-primary"
            >
              Vastrayug
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Premium men&apos;s streetwear and casual clothing. Quality
              fabrics, modern fits, and affordable luxury — crafted for the
              modern man.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:bg-primary hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Customer Care
            </h3>
            <ul className="mt-4 space-y-3">
              {customerCare.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="mailto:support@vastrayug.com"
                  className="flex items-start gap-3 text-sm text-muted transition-colors hover:text-primary"
                >
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  support@vastrayug.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="flex items-start gap-3 text-sm text-muted transition-colors hover:text-primary"
                >
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    WeWork, Connaught Place
                    <br />
                    New Delhi 110001
                    <br />
                    India
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          {/* Copyright */}
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Vastrayug. All rights reserved.
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">We accept:</span>
            <div className="flex items-center gap-2">
              {/* Visa */}
              <div className="flex h-7 w-11 items-center justify-center rounded border border-border bg-white px-1.5">
                <span className="text-[10px] font-bold text-blue-700">
                  VISA
                </span>
              </div>
              {/* Mastercard */}
              <div className="flex h-7 w-11 items-center justify-center rounded border border-border bg-white px-1.5">
                <span className="text-[10px] font-bold text-orange-600">
                  MC
                </span>
              </div>
              {/* UPI */}
              <div className="flex h-7 w-11 items-center justify-center rounded border border-border bg-white px-1.5">
                <span className="text-[10px] font-bold text-green-700">
                  UPI
                </span>
              </div>
              {/* Razorpay */}
              <div className="flex h-7 w-11 items-center justify-center rounded border border-border bg-white px-1.5">
                <CreditCard className="h-3.5 w-3.5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
