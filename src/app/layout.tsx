import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AuthProvider from "@/providers/AuthProvider";
import CartProvider from "@/providers/CartProvider";
import ToastProvider from "@/providers/ToastProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vastrayug - Elevate Your Style",
    template: "%s | Vastrayug",
  },
  description:
    "Shop premium men's clothing at Vastrayug. Discover jeans, cargos, hoodies, sweatshirts, shirts and t-shirts crafted for the modern man.",
  keywords: [
    "men's clothing",
    "jeans",
    "cargos",
    "hoodies",
    "sweatshirts",
    "shirts",
    "t-shirts",
    "men's fashion",
    "Vastrayug",
    "online shopping",
    "streetwear",
  ],
  authors: [{ name: "Vastrayug" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Vastrayug",
    title: "Vastrayug - Elevate Your Style",
    description:
      "Shop premium men's clothing at Vastrayug. Discover jeans, cargos, hoodies, sweatshirts, shirts and t-shirts crafted for the modern man.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vastrayug - Elevate Your Style",
    description:
      "Shop premium men's clothing at Vastrayug. Discover jeans, cargos, hoodies, sweatshirts, shirts and t-shirts crafted for the modern man.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${playfair.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
