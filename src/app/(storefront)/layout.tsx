import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <MobileNav />
      <SearchOverlay />
      <main className="min-h-screen pt-16">{children}</main>
      <ScrollToTop />
      <Footer />
    </>
  );
}
