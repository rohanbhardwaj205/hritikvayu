import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TrustBadges } from "@/components/home/TrustBadges";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PromotionBanner } from "@/components/home/PromotionBanner";
import { NewArrivals } from "@/components/home/NewArrivals";
import { Testimonials } from "@/components/home/Testimonials";
import { BrandStory } from "@/components/home/BrandStory";
import { Newsletter } from "@/components/home/Newsletter";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { getFeaturedProducts, getProducts } from "@/services/products";
import { getActivePromotions } from "@/services/promotions";
import { FEATURED_PRODUCTS_COUNT } from "@/constants/config";

export default async function HomePage() {
  // Fetch all data in parallel for maximum performance
  const [featuredProducts, newArrivalsResponse, promotions] =
    await Promise.all([
      getFeaturedProducts(FEATURED_PRODUCTS_COUNT).catch(() => []),
      getProducts({ sort: "newest", pageSize: 4 }).catch(() => ({
        data: [],
        pagination: { page: 1, pageSize: 4, total: 0, totalPages: 0 },
      })),
      getActivePromotions().catch(() => []),
    ]);

  const newArrivals = newArrivalsResponse.data;

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <MobileNav />
      <SearchOverlay />

      <main className="min-h-screen">
        <HeroBanner />
        <TrustBadges />
        <CategoryShowcase />
        <FeaturedProducts products={featuredProducts} />
        <PromotionBanner promotions={promotions} />
        <NewArrivals products={newArrivals} />
        <Testimonials />
        <BrandStory />
        <Newsletter />
      </main>

      <ScrollToTop />
      <Footer />
    </>
  );
}
