# Vastrayug — Development Prompts
> Auto-generated from `development_roadmap.md` · One prompt per step/sub-step in execution order.
> Paste any prompt directly into your AI assistant. Each prompt is self-contained and references the correct spec documents.

---

## PRE-DEVELOPMENT SETUP

---

### Step 3.1 — Initialise the Next.js Project

```
Initialise the Vastrayug e-commerce project using Next.js 14.2 (NOT Next.js 15).
Run the following command in the project root:

  npx create-next-app@14.2 ./ --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

Confirm the generated structure matches what is expected for an App Router project with TypeScript and Tailwind.
Reference: tech_stack.md §2
```

---

### Step 3.2 — Install All Dependencies

```
Install all project dependencies for Vastrayug using the exact versions specified in tech_stack.md §13.
Install the following groups in order:

Core:
  npm install prisma@5.14.x @prisma/client@5.14.x
  npm install next-auth@4.24.x @auth/prisma-adapter

UI + Forms:
  npm install @tanstack/react-query@5.x react-hook-form@7.51.x zod@3.23.x
  npm install zustand@4.5.x @tiptap/react@2.4.x @tiptap/pm @tiptap/starter-kit
  npm install react-dropzone@14.x recharts@2.12.x
  npm install lucide-react@0.378.x react-hot-toast@2.4.x
  npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox
  npm install @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-dropdown-menu

Backend:
  npm install razorpay@2.9.x @sendgrid/mail@8.1.x bcryptjs
  npm install @aws-sdk/client-s3@3.x

Tailwind plugins (devDependencies):
  npm install -D @tailwindcss/typography @tailwindcss/forms @tailwindcss/aspect-ratio @tailwindcss/container-queries

Types:
  npm install -D @types/bcryptjs

Confirm all packages install without peer dependency conflicts.
Reference: tech_stack.md §13
```

---

### Step 3.3 — Configure Tailwind

```
Create the full tailwind.config.ts for Vastrayug.
Copy the complete config from tech_stack.md §3. It must include:
- Every brand colour token (Navagraha planet palette + neutrals)
- Font variable references: --font-cormorant, --font-inter, --font-playfair-display
- Custom animation keyframes: orbit-slow, orbit-med, orbit-fast (used by SolarSystemBanner)
- All four Tailwind plugins: typography, forms, aspect-ratio, container-queries
Do NOT use a bare/default Tailwind config — the brand tokens are required from day one.
Reference: tech_stack.md §3
```

---

### Step 3.4 — Configure Fonts

```
Configure Google Fonts for Vastrayug in the Next.js App Router using next/font/google.
Set up three font families as CSS variable injections (not className-only):
- Cormorant_Garamond → CSS variable --font-cormorant (used for headings)
- Inter → CSS variable --font-inter (used for body text)
- Playfair_Display → CSS variable --font-playfair-display (used for accent/taglines)

Apply all three variables to the <html> element in app/layout.tsx so they are globally available via Tailwind font utilities.
Reference: tech_stack.md §3
```

---

### Step 3.5 — Initialise Prisma

```
Initialise Prisma for Vastrayug and wire in the production-ready schema.

1. Run:
   npx prisma init --datasource-provider mysql

2. Replace the generated prisma/schema.prisma entirely with the contents of the existing prisma/schema.prisma file (the project schema — do NOT modify it).

3. Validate and generate the Prisma client:
   npx prisma validate
   npx prisma generate

Do not alter the schema without also updating docs/_schema.md.
Reference: prisma/schema.prisma, docs/_schema.md
```

---

### Step 3.6 — Create `.env.local`

```
Create the .env.local file for local development of Vastrayug.
Use tech_stack.md §15 as the complete variable reference.
Populate the following minimum set for local dev (use test/placeholder values where live credentials are not yet available):

  DATABASE_URL="mysql://user:password@localhost:3306/vastrayug_dev"
  NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
  NEXTAUTH_URL="http://localhost:3000"
  NEXT_PUBLIC_GTM_ID="GTM-TWDX4B9R"
  NEXT_PUBLIC_GA4_ID="G-WJ6E42CKNK"
  NEXT_PUBLIC_META_PIXEL_ID="PLACEHOLDER_META_PIXEL_ID"
  RAZORPAY_KEY_ID="rzp_test_xxxx"
  RAZORPAY_KEY_SECRET="xxxx"
  NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxx"
  SENDGRID_API_KEY="SG.xxxx"
  SENDGRID_FROM_EMAIL="orders@vastrayug.in"
  STORAGE_ENDPOINT="https://..."
  STORAGE_ACCESS_KEY="xxxx"
  STORAGE_SECRET_KEY="xxxx"
  STORAGE_BUCKET_NAME="vastrayug-assets"
  STORAGE_PUBLIC_URL="https://..."
  STORAGE_PUBLIC_HOSTNAME="..."
  NEXT_PUBLIC_BLOG_ENABLED=false
  NEXT_PUBLIC_WISHLIST_ENABLED=false
  NEXT_PUBLIC_REVIEWS_ENABLED=false
  NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED=false
  NEXT_PUBLIC_SMS_ENABLED=false

Also create .env.example with all the same keys but placeholder values only — this file IS committed to git.
Reference: tech_stack.md §15
```

---

### Step 3.7 — Run First Migration & Seed

```
Run the initial database migration and seed for Vastrayug.

1. Apply the Prisma schema to create the local database:
   npx prisma migrate dev --name init

2. Write prisma/seed.ts that creates:
   - Super Admin account: vastrayug.in@gmail.com / admin (bcrypt, 12 rounds), role = SUPER_ADMIN
   - 7 categories: Oversized Tees, Hoodies, Co-ord Sets, Joggers, Jackets, Kurtas, Accessories
   - 9 collections: 4 planetary (Sun, Moon, Saturn, Jupiter) + 5 Vibe (as defined in admin_panel_spec.md §8.3)
   - Default Settings key-value rows as defined in admin_panel_spec.md §16

3. Run the seed:
   npx prisma db seed

Reference: admin_panel_spec.md §3, §7.2, §8.3, §16
```

---

### Step 3.8 — Configure `next.config.mjs`

```
Create the next.config.mjs for Vastrayug.
Copy the full configuration from tech_stack.md §10. It must include:
- next/image remotePatterns for Hostinger Object Storage (STORAGE_PUBLIC_HOSTNAME)
- next/image remotePatterns for Google user avatars (lh3.googleusercontent.com)
- Any required headers or redirects for security/SEO

Do not use the default empty next.config.mjs.
Reference: tech_stack.md §10
```

---

## PHASE 1 — MVP

---

### Step 4.1 — Project Foundation

#### 4.1a — `app/layout.tsx`
```
Create app/layout.tsx for Vastrayug (the root layout).
It must:
- Apply all three font CSS variables to the <html> element (--font-cormorant, --font-inter, --font-playfair-display)
- Inject the GTM <Script> tag using next/script with strategy="afterInteractive" (script from tracking_events.md §2.1)
- Wrap children in a React Query provider
- Include <Toaster /> from react-hot-toast
- Set default metadata (site name, description, OG defaults from Brand_values_and_vision.md)
- Inject the Organization JSON-LD schema (from seo_blog_strategy.md §3.1)
Reference: tracking_events.md §2.1, tech_stack.md §3, seo_blog_strategy.md §3.1
```

#### 4.1b — `app/globals.css`
```
Create app/globals.css for Vastrayug.
Include:
- Tailwind base/components/utilities directives
- CSS custom property declarations for font variables
- Any base CSS reset overrides (box-sizing, scroll-behavior: smooth)
- Utility classes for the brand's custom scrollbar style if specified in tech_stack.md §3
Reference: tech_stack.md §3
```

#### 4.1c — `middleware.ts`
```
Create middleware.ts for Vastrayug.
It must:
- Protect all routes under /admin/* — redirect unauthenticated users to /login
- Protect all routes under /account/* — redirect unauthenticated users to /login
- Allow all other routes to pass through without auth checks
- Use NextAuth's withAuth middleware helper
Reference: tech_stack.md §5
```

#### 4.1d — `lib/prisma.ts`
```
Create lib/prisma.ts for Vastrayug.
Implement the Prisma client singleton pattern that:
- Prevents multiple PrismaClient instances in development (hot reload issue)
- Uses the DATABASE_URL environment variable
- Exports a single `prisma` instance for use throughout the app
Reference: tech_stack.md §4
```

#### 4.1e — `lib/auth.ts`
```
Create lib/auth.ts for Vastrayug — the NextAuth configuration file.
It must include:
- CredentialsProvider that validates email + bcrypt password against the User table via Prisma
- PrismaAdapter connected to the Prisma client
- Session strategy: "jwt"
- Callbacks: jwt() to attach user.id and user.role to the token; session() to expose them on session.user
- RBAC helper functions: requireAdmin(), requireRole(role) — throw 401/403 on failure
- authOptions exported for use in both app/api/auth/[...nextauth]/route.ts and server components
Reference: tech_stack.md §5, admin_panel_spec.md §3
```

#### 4.1f — `lib/datalayer.ts`
```
Create lib/datalayer.ts for Vastrayug — the central DataLayer and analytics helper.
Implement and export:
- pushEvent(event: DataLayerEvent): void — pushes to window.dataLayer
- pushEcommerceEvent(event: string, payload: EcommercePayload): void — clears ecommerce before pushing (GA4 standard)
- pushPixelEvent(event: string, data?: object): void — calls window.fbq('track', event, data)
- buildGa4Item(product): GA4Item — maps a Prisma Product to a GA4 item object

All functions must be no-ops during SSR (check typeof window !== 'undefined').
Reference: tracking_events.md §2.4, §3
```

#### 4.1g — `lib/razorpay.ts`
```
Create lib/razorpay.ts for Vastrayug.
Export:
- A Razorpay server-side client instance initialised with RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
- A verifyWebhookSignature(body: string, signature: string) function using RAZORPAY_WEBHOOK_SECRET
Reference: tech_stack.md §6
```

#### 4.1h — `lib/sendgrid.ts`
```
Create lib/sendgrid.ts for Vastrayug.
Export a sendTransactionalEmail(to, templateId, dynamicData) function that:
- Uses @sendgrid/mail
- Authenticates with SENDGRID_API_KEY
- Sends from SENDGRID_FROM_EMAIL
- Passes dynamic template data to the specified SendGrid template ID
Handle errors gracefully — log but do not throw (so a failed email does not break order flow).
Reference: tech_stack.md §7
```

#### 4.1i — `lib/storage.ts`
```
Create lib/storage.ts for Vastrayug — the Hostinger Object Storage (S3-compatible) helper.
Export:
- uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> — uploads to STORAGE_BUCKET_NAME and returns the public URL
- deleteFile(key: string): Promise<void>

Use @aws-sdk/client-s3 with the endpoint, access key, secret key, and bucket name from env vars.
Reference: tech_stack.md §9
```

#### 4.1j — `lib/validations/`
```
Create Zod validation schemas in lib/validations/ for Vastrayug.
Create one file per domain (e.g. product.ts, order.ts, auth.ts, checkout.ts, coupon.ts).
Each schema must exactly match the fields and constraints defined in admin_panel_spec.md §6.2.
These schemas are shared between API route handlers (server) and react-hook-form (client) via the zodResolver.
Reference: admin_panel_spec.md §6.2
```

#### 4.1k — `types/datalayer.d.ts`
```
Create types/datalayer.d.ts for Vastrayug.
Extend the global Window interface to add:
- window.dataLayer: DataLayerEvent[]
- window.fbq: (action: string, event: string, data?: object) => void
- window.gtag: (...args: unknown[]) => void

Define all DataLayer event types used in tracking_events.md §3.2 as TypeScript interfaces.
Reference: tracking_events.md §3.2
```

#### 4.1l — `types/index.ts`
```
Create types/index.ts for Vastrayug — the global TypeScript type definitions file.
Export shared types used across the codebase that are not auto-generated by Prisma, such as:
- API response envelope types (ApiResponse<T>, PaginatedResponse<T>)
- Cart item types used by Zustand store
- Checkout step types
- Admin filter/sort param types
- Any branded string types (e.g. Slug, ProductId)
Reference: component_architecture.md
```

---

### Step 4.2 — API Auth Routes

```
Create app/api/auth/[...nextauth]/route.ts for Vastrayug.
Export GET and POST handlers using the authOptions from lib/auth.ts:

  import NextAuth from 'next-auth'
  import { authOptions } from '@/lib/auth'
  const handler = NextAuth(authOptions)
  export { handler as GET, handler as POST }

This single file handles all NextAuth callbacks: signin, signout, session, and OAuth redirects.
Reference: tech_stack.md §5
```

---

### Step 4.3 — Storefront Layout Shell

#### 4.3a — `app/(store)/layout.tsx`
```
Create app/(store)/layout.tsx for Vastrayug — the storefront route group layout.
It must:
- Render: <AnnouncementBar /> + <Navbar /> + {children} + <Footer />
- Mount the popup system root (PopupManager renders here)
- Pass the current session to child components via SessionProvider
Reference: component_architecture.md §3.1, prd_new.md §5
```

#### 4.3b — `components/store/layout/Navbar.tsx`
```
Create components/store/layout/Navbar.tsx for Vastrayug.
The navbar must include:
- Brand logo (links to /)
- Main nav links (Shop, Collections, About, Blog — Blog hidden when NEXT_PUBLIC_BLOG_ENABLED=false)
- SearchBar component (inline or expanding)
- WishlistIcon (hidden when NEXT_PUBLIC_WISHLIST_ENABLED=false)
- CartIcon with item count badge (reads from cartStore)
- UserMenu: shows Login/Register if unauthenticated; shows Account/Logout if authenticated
- Mobile hamburger menu with slide-out drawer
Use brand colour tokens from tailwind.config.ts. No hardcoded hex values.
Reference: component_architecture.md §3.1, prd_new.md §5
```

#### 4.3c — `components/store/layout/Footer.tsx`
```
Create components/store/layout/Footer.tsx for Vastrayug.
Include:
- Brand logo + tagline (from Brand_values_and_vision.md §3)
- Navigation link groups: Shop, Company, Legal
- Social media icons (Instagram, WhatsApp, Facebook, Pinterest) using lucide-react
- NewsletterForm component (inline email subscribe)
- Copyright line with current year
Apply brand palette and typography tokens. No hardcoded hex values.
Reference: component_architecture.md §3.1, Brand_values_and_vision.md
```

#### 4.3d — `components/store/layout/AnnouncementBar.tsx`
```
Create components/store/layout/AnnouncementBar.tsx for Vastrayug.
It must:
- Fetch the active announcement on mount from GET /api/storefront/announcements/active
- Render a single-line bar at the very top of the page (above Navbar)
- Support background colour + text colour from the announcement record
- Include a dismiss (×) button that hides the bar for the session
- Return null when no active announcement exists (do not show an empty bar)
Reference: component_architecture.md §3.1, admin_panel_spec.md §15
```

---

### Step 4.4 — Shared UI Primitives

```
Create the following shared UI primitive components in components/ui/ for Vastrayug.
All components must use Tailwind brand tokens only (no hardcoded colours). Each must be accessible (ARIA roles/labels).

- Button.tsx — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg; loading state with Spinner
- Input.tsx — text input with label, error message, and helper text slots
- Select.tsx — wraps Radix Select; matches brand styling
- Badge.tsx — small label pill; colour variants map to status/planet values
- Spinner.tsx — animated loading indicator (CSS, not GIF)
- Dialog.tsx — wraps Radix Dialog; animated open/close; traps focus
- Switch.tsx — wraps Radix Switch; on/off toggle
- Tabs.tsx — wraps Radix Tabs; underline or pill variant
- Tooltip.tsx — wraps Radix Tooltip; appears on hover/focus
Reference: component_architecture.md §6.1, admin_panel_spec.md §19.1
```

---

### Step 4.5 — Home Page

#### 4.5a — `app/(store)/page.tsx`
```
Create app/(store)/page.tsx for Vastrayug — the home page.
Use ISR with revalidate: 3600.
Fetch and pass to child components:
- Featured collections (where featured=true, active=true)
- Featured products (where featured=true, active=true, limit 8)
Render in order: SolarSystemBanner → FeaturedCollections → FeaturedProducts → BrandStorySection
Reference: prd_new.md §4.6, component_architecture.md §4.1
```

#### 4.5b — `components/store/home/SolarSystemBanner.tsx`
```
Create components/store/home/SolarSystemBanner.tsx for Vastrayug — the hero banner.
Requirements:
- Pure CSS @keyframes animation using Tailwind animation tokens orbit-slow, orbit-med, orbit-fast (from tailwind.config.ts)
- Render all 9 Navagraha planets orbiting a central sun element
- Each planet uses its planet-specific accent colour from Brand_values_and_vision.md §9
- Respect prefers-reduced-motion: if reduced motion is preferred, show a static layout instead of animation
- GPU-composited: all animations use transform and will-change: transform only (no top/left/margin animation)
- Must render at 60fps on a mid-range Android device
Reference: prd_new.md §4.6, Brand_values_and_vision.md §9, tech_stack.md §3
```

#### 4.5c — `components/store/home/FeaturedCollections.tsx`
```
Create components/store/home/FeaturedCollections.tsx for Vastrayug.
Display a grid of active featured collections passed in as props.
Each collection card links to /collection/[slug] and shows: hero image, collection name, and a short description.
Animate cards in on viewport entry (use Intersection Observer or CSS scroll-driven animation).
Reference: prd_new.md §4.6, Brand_values_and_vision.md
```

#### 4.5d — `components/store/home/FeaturedProducts.tsx`
```
Create components/store/home/FeaturedProducts.tsx for Vastrayug.
Render a horizontal scroll or grid of featured products using the ProductCard component.
Show a "Shop All" CTA linking to /shop.
Reference: prd_new.md §4.6, component_architecture.md §4.1
```

#### 4.5e — `components/store/home/BrandStorySection.tsx`
```
Create components/store/home/BrandStorySection.tsx for Vastrayug.
This is a static section that renders the Vastrayug brand narrative.
Use copy and positioning directly from Brand_values_and_vision.md §3.
Include: headline, 2–3 paragraphs of brand story, a CTA button linking to /shop.
Apply Cormorant Garamond for the headline and Inter for body text.
Reference: Brand_values_and_vision.md §3
```

---

### Step 4.6 — Product Catalogue (Storefront)

#### 4.6a — `app/(store)/shop/page.tsx`
```
Create app/(store)/shop/page.tsx for Vastrayug — the all-products listing page.
Use ISR with revalidate: 300.
- Accept URL search params for filter/sort state
- Render FilterSidebar + SortDropdown + ProductGrid
- Implement generateMetadata() with meta_title, meta_description, canonical URL, and OG tags
- Add ItemList JSON-LD (seo_blog_strategy.md §3.5)
Reference: prd_new.md §6.1, component_architecture.md §4.2, seo_blog_strategy.md §2, §3.5
```

#### 4.6b — `app/(store)/shop/[slug]/page.tsx` (PDP)
```
Create app/(store)/shop/[slug]/page.tsx for Vastrayug — the Product Detail Page (PDP).
Use generateStaticParams for all published products + ISR revalidate: 60.
- Fetch the product and related products server-side
- Render: ProductGallery, ProductInfo, CosmicMetadata, VariantSelector, AddToCartButton, RelatedProducts
- Fire view_item DataLayer event on mount (client component island)
- Fire Meta ViewContent pixel event on mount
- Implement generateMetadata() with all OG/Twitter meta + canonical
- Inject Product JSON-LD (seo_blog_strategy.md §3.2)
- Inject BreadcrumbList JSON-LD (seo_blog_strategy.md §3.4)
Reference: prd_new.md §6.1, component_architecture.md §4.3, seo_blog_strategy.md §3.2, §3.4
```

#### 4.6c — `app/(store)/category/[slug]/page.tsx`
```
Create app/(store)/category/[slug]/page.tsx for Vastrayug — the category listing page.
- Fetch the category + filtered products server-side
- Render FilterSidebar + ProductGrid
- generateMetadata() with category name in title/description + canonical
- BreadcrumbList JSON-LD
- ItemList JSON-LD
Reference: component_architecture.md §4.2, seo_blog_strategy.md §3.4, §3.5
```

#### 4.6d — `app/(store)/collection/[slug]/page.tsx`
```
Create app/(store)/collection/[slug]/page.tsx for Vastrayug — the collection listing page.
- Render CollectionHero at the top using the collection's Navagraha planet accent colour
- Render the product grid for this collection
- generateMetadata() with collection name + description + canonical
- BreadcrumbList JSON-LD
- ItemList JSON-LD
Reference: component_architecture.md §4.2, Brand_values_and_vision.md §9
```

#### 4.6e — `components/store/product/ProductGrid.tsx`
```
Create components/store/product/ProductGrid.tsx for Vastrayug.
Renders a responsive CSS grid of ProductCard components.
Accepts a products array prop. Shows EmptyState when the array is empty.
Reference: component_architecture.md §4.2
```

#### 4.6f — `components/store/product/ProductCard.tsx`
```
Create components/store/product/ProductCard.tsx for Vastrayug.
Must include all required analytics data attributes:
  data-product-id, data-product-name, data-product-category, data-product-price, data-product-planet, data-gtm-action="select_item"

On click: fire select_item DataLayer event via pushEcommerceEvent before navigating to /shop/[slug].
Show: product image (next/image), name, price, planet badge, quick-add or wishlist icon.
Reference: component_architecture.md §4.2, tracking_events.md §6.1
```

#### 4.6g — `components/store/product/FilterSidebar.tsx`
```
Create components/store/product/FilterSidebar.tsx for Vastrayug.
Filters to implement: Category (multi-select), Size (multi-select), Colour (colour swatch multi-select), Price Range (slider or dual input).
Each filter change updates URL search params (useRouter + useSearchParams) without full page reload.
Collapsible on mobile.
Reference: prd_new.md §6.1
```

#### 4.6h — `components/store/product/SortDropdown.tsx`
```
Create components/store/product/SortDropdown.tsx for Vastrayug.
Dropdown sort options: Newest, Price: Low to High, Price: High to Low, Best Selling.
Selecting an option updates the sort= URL search param.
Reference: prd_new.md §6.1
```

#### 4.6i — `components/store/product/ProductGallery.tsx`
```
Create components/store/product/ProductGallery.tsx for Vastrayug.
Features:
- Primary large image display using next/image
- Thumbnail strip below (or to the side) — click to change primary
- Zoom on hover (CSS transform scale or a lightbox)
- Swipe gesture support on mobile
Reference: prd_new.md §6.1
```

#### 4.6j — `components/store/product/ProductInfo.tsx`
```
Create components/store/product/ProductInfo.tsx for Vastrayug.
Display: product title, price (strike-through compare price if on sale), stock level indicator, size selector (delegates to VariantSelector), short description.
Reference: prd_new.md §6.1
```

#### 4.6k — `components/store/product/CosmicMetadata.tsx`
```
Create components/store/product/CosmicMetadata.tsx for Vastrayug.
Renders the Navagraha-specific product metadata as styled badge pills:
- NavagrahaPlanet (with planet accent colour from Brand_values_and_vision.md §9)
- ZodiacSign
- life_path_number
- emotional_intention (short italic text)
Reference: prd_new.md §6.1, Brand_values_and_vision.md §9
```

#### 4.6l — `components/store/product/VariantSelector.tsx`
```
Create components/store/product/VariantSelector.tsx for Vastrayug.
Renders size and colour variant buttons.
Selected variant is highlighted with the brand primary colour.
Sold-out variants are shown with strikethrough and are non-interactive.
Calls onVariantChange(variantId) prop when a selection is made.
Reference: prd_new.md §6.1, schema.prisma (ProductVariant model)
```

#### 4.6m — `components/store/product/AddToCartButton.tsx`
```
Create components/store/product/AddToCartButton.tsx for Vastrayug.
On click:
1. Call the cart store's addItem() action
2. Fire add_to_cart DataLayer event via pushEcommerceEvent (tracking_events.md §4.5)
3. Fire Meta AddToCart pixel event via pushPixelEvent
4. Show a success toast via react-hot-toast
Button must have: data-gtm-action="add_to_cart", data-gtm-category="product", data-gtm-label={product.title}
Reference: tracking_events.md §4.5, §6.2
```

#### 4.6n — `components/store/product/RelatedProducts.tsx`
```
Create components/store/product/RelatedProducts.tsx for Vastrayug.
Display up to 4 related products in a horizontal scroll strip.
Related products are fetched from the same collection or category as the current product.
Use ProductCard for each item.
Reference: prd_new.md §6.1
```

#### 4.6o — `components/store/product/CollectionHero.tsx`
```
Create components/store/product/CollectionHero.tsx for Vastrayug.
A full-width hero banner for collection pages.
Dynamically applies the planet-specific accent colour as the background or border accent, using the NavagrahaPlanet value from Brand_values_and_vision.md §9.
Displays: collection name, description, and the planet/vibe visual motif.
Reference: Brand_values_and_vision.md §9
```

---

### Step 4.7 — Public API Routes (Storefront)

```
Create the following public storefront API routes in app/api/storefront/ for Vastrayug.
All routes are unauthenticated. Use Prisma for all database access. Return JSON.

- GET /api/storefront/products — list products; support query params: category, collection, sort, page, limit, search
- GET /api/storefront/products/[slug] — single product by slug; include variants, images, collection
- GET /api/storefront/categories — full category + sub-category tree
- GET /api/storefront/collections — all active collections
- GET /api/storefront/collections/[slug] — single collection + its products
- GET /api/storefront/search — full-text search across product title, tags, emotional_intention using Prisma @@fulltext index
- GET /api/storefront/announcements/active — the single currently active announcement bar, or null
- POST /api/storefront/newsletter — validate email with Zod; create NewsletterSubscriber record (upsert); return 200 if already exists

Reference: component_architecture.md §7.4, schema.prisma
```

---

### Step 4.8 — Cart

#### 4.8a — `store/cartStore.ts`
```
Create store/cartStore.ts for Vastrayug — the Zustand cart state store.
The store must:
- Persist cart items to localStorage for guest users (zustand/middleware persist)
- Sync to DB (via cart API) for authenticated users
- Actions: addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon
- Computed values: itemCount, subtotal, discount, total
- Fire appropriate DataLayer events through lib/datalayer.ts on add/remove
Reference: prd_new.md §6.2, component_architecture.md §4.4
```

#### 4.8b — `app/(store)/cart/page.tsx`
```
Create app/(store)/cart/page.tsx for Vastrayug — the full cart page.
This is a CSR page (no SSR needed — cart state comes from Zustand store).
On mount: fire view_cart DataLayer event via pushEcommerceEvent.
Render: list of CartItem components + OrderSummary + CouponInput + "Proceed to Checkout" button.
Show an empty state with a "Start Shopping" CTA if the cart is empty.
Reference: prd_new.md §6.2, tracking_events.md §4.7
```

#### 4.8c — `components/store/cart/MiniCart.tsx`
```
Create components/store/cart/MiniCart.tsx for Vastrayug — the slide-out cart drawer.
Triggered by clicking the CartIcon in the Navbar.
Displays the same CartItem list but in a compact side panel format.
Shows subtotal and a "View Cart" + "Checkout" button at the bottom.
Reference: component_architecture.md §4.4
```

#### 4.8d — `components/store/cart/CartItem.tsx`
```
Create components/store/cart/CartItem.tsx for Vastrayug.
Each cart item row shows: product image, name, variant (size/colour), unit price, quantity stepper, line total, remove button.
On remove: fire remove_from_cart DataLayer event via pushEcommerceEvent.
Reference: tracking_events.md §4.6
```

#### 4.8e — `components/store/cart/CouponInput.tsx`
```
Create components/store/cart/CouponInput.tsx for Vastrayug.
Text input + "Apply" button.
On submit: call POST /api/storefront/cart/coupon (or inline validation logic) to validate the coupon code.
Show real-time feedback: invalid code error, success with discount amount shown.
Reference: prd_new.md §6.2
```

#### 4.8f — `components/store/cart/OrderSummary.tsx`
```
Create components/store/cart/OrderSummary.tsx for Vastrayug.
Display a line-item breakdown: Subtotal, Discount (if coupon applied), Shipping estimate, Tax, Total.
All values read from cartStore computed values.
Reference: prd_new.md §6.2
```

#### 4.8g — Cart API Routes
```
Create the cart API routes in app/api/storefront/cart/ for Vastrayug:
- GET /api/storefront/cart — fetch the current user's or session's cart
- POST /api/storefront/cart — add item to cart; validate stock availability before adding
- PATCH /api/storefront/cart — update item quantity
- DELETE /api/storefront/cart/[itemId] — remove a single item from cart

All mutations must check stock levels in the ProductVariant table before proceeding.
Reference: schema.prisma (Cart, CartItem, ProductVariant models)
```

---

### Step 4.9 — Checkout & Payment

#### 4.9a — `app/(store)/checkout/page.tsx`
```
Create app/(store)/checkout/page.tsx for Vastrayug — the multi-step checkout flow.
Steps: (1) Address → (2) Shipping Method → (3) Review + Pay
- Auth is optional (guest checkout is supported)
- Fire begin_checkout DataLayer event on page mount
- Fire Meta InitiateCheckout pixel event on page mount
- Use CheckoutProgress to show current step
Reference: prd_new.md §6.3, component_architecture.md §4.5, tracking_events.md §4.8
```

#### 4.9b — `components/store/checkout/CheckoutProgress.tsx`
```
Create components/store/checkout/CheckoutProgress.tsx for Vastrayug.
A visual step indicator showing: Address → Shipping → Review & Pay.
Highlights the current step. Completed steps show a checkmark.
Reference: component_architecture.md §4.5
```

#### 4.9c — `components/store/checkout/AddressForm.tsx`
```
Create components/store/checkout/AddressForm.tsx for Vastrayug.
Fields: Full Name, Phone, Address Line 1, Address Line 2 (optional), City, State, PIN Code.
Use react-hook-form with the zodResolver and the address Zod schema from lib/validations/.
For logged-in users: pre-populate with saved addresses and allow selecting a saved address.
On completion: fire add_shipping_info DataLayer event equivalent.
Reference: prd_new.md §6.3, tracking_events.md §4.9
```

#### 4.9d — `components/store/checkout/ShippingMethodSelector.tsx`
```
Create components/store/checkout/ShippingMethodSelector.tsx for Vastrayug.
Fetch available shipping methods from Settings.shipping_config (a JSON field in the Settings table).
Render as a radio group showing: carrier name, estimated delivery days, price.
On selection: fire add_shipping_info DataLayer event.
Reference: prd_new.md §6.3, admin_panel_spec.md §16, tracking_events.md §4.9
```

#### 4.9e — `components/store/checkout/RazorpayButton.tsx`
```
Create components/store/checkout/RazorpayButton.tsx for Vastrayug.
This component:
1. On click: calls POST /api/storefront/checkout/create-order to get a Razorpay order ID
2. Opens the Razorpay Checkout JS widget with the order ID and key from NEXT_PUBLIC_RAZORPAY_KEY_ID
3. On payment success: calls POST /api/storefront/checkout/verify-payment with razorpay_order_id, razorpay_payment_id, razorpay_signature
4. On verify success: redirects to /order-confirmation/[orderId]
5. On failure: shows an error toast and keeps the user on checkout
Fire add_payment_info DataLayer event when the Razorpay modal opens.
Reference: tech_stack.md §6, tracking_events.md §4.10
```

#### 4.9f — `components/store/checkout/OrderReviewStep.tsx`
```
Create components/store/checkout/OrderReviewStep.tsx for Vastrayug.
The final review screen before payment. Shows:
- Selected delivery address (read-only)
- Selected shipping method + cost
- Order items (from cart)
- Price breakdown (subtotal, discount, shipping, tax, total)
- RazorpayButton
Reference: prd_new.md §6.3
```

#### 4.9g — `app/(store)/order-confirmation/[orderId]/page.tsx`
```
Create app/(store)/order-confirmation/[orderId]/page.tsx for Vastrayug.
On mount (client-side effect):
1. Fire purchase DataLayer event with full order data (transactionId, value, tax, shipping, items[]) — tracking_events.md §4.11
2. Fire Meta Purchase pixel event — tracking_events.md §5.5
Display: order number, summary of items, total paid, estimated delivery, "Continue Shopping" CTA.
Reference: prd_new.md §6.4, tracking_events.md §4.11, §5.5
```

#### 4.9h — Checkout API Routes
```
Create the checkout API routes for Vastrayug:

POST /api/storefront/checkout/create-order:
- Validate the cart and address
- Create a Razorpay order via the Razorpay SDK
- Return the Razorpay order ID, amount, currency, and key

POST /api/storefront/checkout/verify-payment:
- Verify the Razorpay signature using lib/razorpay.ts verifyWebhookSignature
- On success: create the Order and OrderItems in DB, clear the cart, send confirmation email via lib/sendgrid.ts
- Return the new order ID

POST /api/webhooks/razorpay:
- Verify webhook signature from Razorpay-Signature header
- Handle payment.captured and payment.failed events
- Update order status accordingly
Reference: tech_stack.md §6, prd_new.md §6.4
```

---

### Step 4.10 — User Auth (Storefront)

```
Create the following auth pages for the Vastrayug storefront in app/(store)/(auth)/:

- login/page.tsx — Email + password form. On submit: call NextAuth signIn('credentials'). On success: redirect to /account or the previous page. Include a "Forgot password?" link.
- register/page.tsx — Full Name + email + password + confirm password form. On submit: POST /api/storefront/auth/register. Always assigns role = CUSTOMER.
- forgot-password/page.tsx — Email input form. Sends a password reset email via SendGrid.
- reset-password/page.tsx — New password + confirm password form. Validates the reset token from the URL query param.

All pages must fire the appropriate sign_up or login DataLayer events on success.
Reference: prd_new.md §6.6, tech_stack.md §5, tracking_events.md
```

```
Create the account section pages in app/(store)/account/ for Vastrayug:

- layout.tsx — Sidebar navigation with links: Profile, Orders, Addresses. Protected by middleware (redirects to /login if unauthenticated).
- page.tsx — Profile page: display name/email, password change form (calls PATCH /api/storefront/auth/change-password)
- orders/page.tsx — Order history table with order number, date, status badge, total, and "View" link
- addresses/page.tsx — Saved addresses list with add/edit/delete and a "Set as default" option

Account API routes to create:
- GET /api/storefront/orders/[id]/track — order tracking info for the logged-in user
- POST /api/storefront/auth/register — create new CUSTOMER user (bcrypt password)
- PATCH /api/storefront/auth/change-password — verify old password, hash new password, update DB
Reference: prd_new.md §6.6
```

---

### Step 4.11 — Admin Panel Foundation

#### 4.11a — Admin Layout
```
Create the admin layout components for Vastrayug:

app/(admin)/admin/layout.tsx:
- Auth gate: if session is missing or user.role is not in [ADMIN, MANAGER, SUPER_ADMIN], redirect to /login
- Render: AdminLayout wrapping all admin pages

components/admin/layout/AdminLayout.tsx:
- Side-by-side: AdminSidebar (fixed) + main content area with AdminTopbar

components/admin/layout/AdminSidebar.tsx:
- Nav links filtered by user.role using RBAC rules from admin_panel_spec.md §3
- Sections: Dashboard, Products, Orders, Users, Blog (Phase 2), Categories, Collections, Coupons, Promotions, Popups, Announcements, Settings, Activity Log

components/admin/layout/AdminTopbar.tsx:
- Shows current admin user name + role badge
- Logout button
- Mounts DefaultPasswordBanner if user.is_default_password is true

components/admin/layout/DefaultPasswordBanner.tsx:
- Persistent amber warning bar: "You are using the default password. Change it now." with a link to /admin/profile

components/admin/layout/AdminBreadcrumb.tsx:
- Auto-generates breadcrumbs from the current pathname

Reference: admin_panel_spec.md §1–3, §19–20, component_architecture.md §5.1
```

#### 4.11b — Admin Shared Components
```
Create the following shared admin components in components/admin/shared/ for Vastrayug.
Reference admin_panel_spec.md §19.2 for exact behaviour of each.

- DataTable.tsx — full-featured table with: column sort, search/filter input, pagination, bulk-select checkboxes, bulk action dropdown
- FormField.tsx — label + input/select/textarea + error message wrapper; used in all admin forms
- ImageUploader.tsx — react-dropzone + image preview + upload progress; calls POST /api/admin/upload on drop
- RichTextEditor.tsx — Tiptap wrapper with toolbar: bold, italic, heading, bullet list, ordered list, link, image insert
- SlugField.tsx — text input that auto-generates a slug from a "title" field; allows manual override; shows live preview URL
- StatusBadge.tsx — colour-coded pill for order/product/user statuses; colours map to brand palette
- ConfirmDialog.tsx — Radix AlertDialog; used for all delete confirmations; requires typing "DELETE" for destructive actions
- MetricCard.tsx — a card showing a label, large number, and optional trend indicator (up/down arrow + %)
- EmptyState.tsx — centred illustration + heading + description + optional CTA button
- PageHeader.tsx — page title + subtitle + right-aligned action buttons slot
- MultiSelect.tsx — searchable tag-style multi-select for assigning collections, zodiac signs, etc.

Reference: admin_panel_spec.md §19.2
```

---

### Step 4.12 — Admin: Dashboard

```
Create the admin dashboard for Vastrayug:

app/(admin)/admin/dashboard/page.tsx:
- Server component that fetches stats from GET /api/admin/dashboard/stats
- Renders: MetricsRow + RecentOrdersTable + LowStockAlerts + QuickActions

components/admin/dashboard/MetricsRow.tsx:
- 5 MetricCard components: Total Orders (today), Revenue (today), Active Users, Pending Orders, Low Stock Products

components/admin/dashboard/RecentOrdersTable.tsx:
- Table of last 10 orders: order number, customer name, status badge, total, date, "View" action link

components/admin/dashboard/LowStockAlerts.tsx:
- List of product variants where stock_quantity < low_stock_threshold
- Each item: product name, variant (size/colour), current stock, "Edit" link

components/admin/dashboard/QuickActions.tsx:
- Shortcut buttons: Add Product, View Orders, Export Orders

GET /api/admin/dashboard/stats:
- Returns: ordersToday, revenueToday, activeUsers, pendingOrders, lowStockCount

Reference: admin_panel_spec.md §5
```

---

### Step 4.13 — Admin: Product Management

```
Create the admin product management module for Vastrayug:

Pages:
- app/(admin)/admin/products/page.tsx — DataTable with columns: image, name, price, category, stock status, featured toggle, status toggle. Bulk actions: delete, set featured, change status.
- app/(admin)/admin/products/new/page.tsx — renders ProductForm in "create" mode
- app/(admin)/admin/products/[id]/page.tsx — renders ProductForm in "edit" mode, pre-populated

ProductForm (used by both new and edit):
The form has 7 collapsible sections (from admin_panel_spec.md §6):
1. Basic Info: title, slug (SlugField), short_description, description (RichTextEditor)
2. Pricing: price, compare_at_price, cost_price, tax_rate
3. Images: ImageUploader (multi-image, drag-to-reorder, set primary)
4. Variants: dynamic rows for size + colour combinations, each with its own sku, price_override, stock_quantity, low_stock_threshold
5. Categorisation: category (Select), sub_category (conditional Select), collections (MultiSelect), tags (MultiSelect)
6. Cosmic Metadata: planet (Select from NavagrahaPlanet enum), zodiac (MultiSelect), life_path_number, emotional_intention
7. SEO: meta_title, meta_description, canonical_url — all from seo_blog_strategy.md §2

POST /api/admin/upload:
- Receives multipart/form-data image file
- Uploads to Hostinger S3 via lib/storage.ts
- Returns the public URL

Admin product API routes:
- GET /api/admin/products — paginated list with filters
- POST /api/admin/products — create product + variants
- GET /api/admin/products/[id] — fetch single product with all relations
- PUT /api/admin/products/[id] — update product + variants (upsert variants)
- DELETE /api/admin/products/[id] — soft delete (set active=false)
- POST /api/admin/products/bulk — bulk status/featured/delete operations

Reference: admin_panel_spec.md §6, component_architecture.md §5.3
```

---

### Step 4.14 — Admin: Category & Collection Management

```
Create the admin category and collection management module for Vastrayug:

Category pages:
- app/(admin)/admin/categories/page.tsx — two-panel layout: left panel lists parent categories; right panel shows sub-categories for the selected parent. Inline create/edit/delete for both levels. No separate detail page needed.

Collection pages:
- app/(admin)/admin/collections/page.tsx — DataTable of all collections
- app/(admin)/admin/collections/[id]/page.tsx — collection form with conditional fields based on CollectionType (PLANETARY vs VIBE): planet selector only shows for PLANETARY type

API routes to create:
- GET/POST /api/admin/categories
- GET/PUT/DELETE /api/admin/categories/[id]
- GET/POST /api/admin/subcategories
- GET/PUT/DELETE /api/admin/subcategories/[id]
- GET/POST /api/admin/collections
- GET/PUT/DELETE /api/admin/collections/[id]

Reference: admin_panel_spec.md §7–8, schema.prisma
```

---

### Step 4.15 — Admin: Order Management

```
Create the admin order management module for Vastrayug:

Pages:
- app/(admin)/admin/orders/page.tsx — DataTable with quick-filter tabs: All, Pending, Processing, Shipped, Delivered, Cancelled. Columns: order number, customer, items count, total, status, date, actions.
- app/(admin)/admin/orders/[id]/page.tsx — two-column layout:
  - Left: order items, pricing breakdown, customer address, tracking info
  - Right: StatusTimeline + StatusUpdateForm + ShippingInfoEditor

Components:
- components/admin/orders/StatusTimeline.tsx — vertical timeline built from OrderStatusHistory records
- components/admin/orders/StatusUpdateForm.tsx — dropdown showing only valid next states (state machine). On submit: update status, insert OrderStatusHistory, trigger email, insert AdminActivityLog
- components/admin/orders/ShippingInfoEditor.tsx — fields for courier name, tracking number, tracking URL. Only enabled once status is SHIPPED.

On order status update trigger this exact sequence:
1. Update Order.status
2. Insert OrderStatusHistory record
3. If new status is SHIPPED, OUT_FOR_DELIVERY, or DELIVERED: send SendGrid transactional email
4. Insert AdminActivityLog record

Order API routes:
- GET /api/admin/orders — paginated list with status filter
- GET /api/admin/orders/[id] — full order detail with all relations
- PATCH /api/admin/orders/[id]/status — update status + trigger side effects above
- PATCH /api/admin/orders/[id]/tracking — update shipping/tracking info

Reference: admin_panel_spec.md §9, schema.prisma (Order, OrderStatusHistory, AdminActivityLog)
```

---

### Step 4.16 — Admin: User Management

```
Create the admin user management module for Vastrayug:

Pages:
- app/(admin)/admin/users/page.tsx — DataTable: name, email, role badge, status badge, order count, joined date. Bulk actions: activate/deactivate.
- app/(admin)/admin/users/[id]/page.tsx — two tabs:
  - Profile tab: name, email, phone, role (role promotion to ADMIN/MANAGER visible to SUPER_ADMIN only), status toggle
  - Orders tab: order history table for this user
- app/(admin)/admin/profile/page.tsx — own profile edit + password change; available to all admin roles

User API routes:
- GET /api/admin/users — paginated list with role/status filter
- GET /api/admin/users/[id] — user detail + orders
- PATCH /api/admin/users/[id] — update profile / toggle status
- PATCH /api/admin/users/[id]/role — update role; SUPER_ADMIN only (enforce server-side)

Reference: admin_panel_spec.md §10, §3
```

---

### Step 4.17 — Admin: Settings

```
Create the admin settings page for Vastrayug:

app/(admin)/admin/settings/page.tsx:
A tabbed settings page (using Tabs UI component) with the following tabs, each containing a form backed by GET/PUT /api/admin/settings:

1. Store Info — store name, store URL, contact email, address
2. Shipping — JSON editor for shipping methods config (carrier name, days, price per method)
3. Tax — tax rate percentage
4. Payment — Razorpay live/test mode toggle, display webhook URL for reference
5. Email — SendGrid template ID fields for all 7 transactional email types (order_confirmation, shipped, delivered, etc.)
6. Analytics — GTM container ID, GA4 measurement ID, Meta Pixel ID (editable here)

All settings are stored as key-value rows in the Settings table.
GET /api/admin/settings — returns all settings as a flat key-value object
PUT /api/admin/settings — upserts multiple settings in a single transaction

Reference: admin_panel_spec.md §16
```

---

### Step 4.18 — SEO Infrastructure

```
Create the SEO infrastructure files for Vastrayug:

app/sitemap.ts:
- Dynamically generates a sitemap including: all published product URLs (/shop/[slug]), all active collection URLs (/collection/[slug]), all active category URLs (/category/[slug]), and static pages (/, /shop, /about)
- Returns the sitemap in Next.js MetadataRoute.Sitemap format
- Blog posts will be added to sitemap in Phase 2

app/robots.ts:
- Allows all crawlers on all public routes
- Disallows: /admin/*, /api/*, /account/*
- References sitemap URL: https://vastrayug.in/sitemap.xml

components/shared/JsonLd.tsx:
- A server component that accepts a schema object and renders it as a <script type="application/ld+json"> tag in the page <head>

JSON-LD implementations (using JsonLd component):
- Organization schema in app/layout.tsx — name, URL, logo, sameAs social profiles (seo_blog_strategy.md §3.1)
- Product schema in /shop/[slug]/page.tsx — name, image, description, sku, price, availability (seo_blog_strategy.md §3.2)
- BreadcrumbList schema on PDP, category, and collection pages (seo_blog_strategy.md §3.4)
- ItemList schema on /shop, /category/[slug], /collection/[slug] listing pages (seo_blog_strategy.md §3.5)

Reference: seo_blog_strategy.md §2, §3, §8
```

---

### Step 4.19 — Phase 1 QA & Launch Prep

```
Complete the Phase 1 pre-launch checklist for Vastrayug:

Database (production):
- [ ] Run: npx prisma migrate deploy (NOT migrate dev)
- [ ] Run: npx prisma db seed (creates super admin + categories + collections + settings defaults)
- [ ] Immediately change the default admin password on first login (vastrayug.in@gmail.com / admin)

Environment (production):
- [ ] Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to live keys (not test)
- [ ] Set NEXT_PUBLIC_RAZORPAY_KEY_ID to the live publishable key
- [ ] Verify RAZORPAY_WEBHOOK_SECRET is set and webhook endpoint is registered in Razorpay dashboard
- [ ] Verify SendGrid sender domain vastrayug.in is authenticated (SPF + DKIM records in Cloudflare)
- [ ] Replace PLACEHOLDER_META_PIXEL_ID with the real Meta Pixel ID

Verification:
- [ ] Run Lighthouse mobile audit — Performance score must be ≥ 90
- [ ] Verify SolarSystemBanner renders at 60fps on a mid-range Android device
- [ ] Execute full purchase flow end-to-end: add to cart → checkout → Razorpay test mode → verify order created in DB → confirm email received
- [ ] Switch Razorpay to live mode and repeat a real ₹1 test purchase
- [ ] Verify GTM container GTM-TWDX4B9R is firing on all storefront pages (check GTM Preview mode)
- [ ] Verify GA4 events appearing in GA4 DebugView
```

---

## PHASE 2 — CONTENT & ENGAGEMENT

---

### Step 5.1 — Blog Engine (Frontend)

```
Create the blog frontend for Vastrayug. Set feature flag NEXT_PUBLIC_BLOG_ENABLED=true at Phase 2 launch.

Pages:
- app/(store)/blog/page.tsx — Blog listing, ISR revalidate: 3600, with category + tag filter pills at the top. Renders BlogListingPage. Add ItemList JSON-LD (seo_blog_strategy.md §3.5). Add blog URLs to app/sitemap.ts.
- app/(store)/blog/[slug]/page.tsx — Blog post, generateStaticParams for published posts, ISR revalidate: 3600. Add Article JSON-LD (seo_blog_strategy.md §3.3). generateMetadata() with OG tags.
- app/(store)/blog/category/[slug]/page.tsx — Blog category archive page.

Components:
- components/store/blog/BlogListingPage.tsx — grid of BlogPostCards + category/tag filter strip
- components/store/blog/BlogPostCard.tsx — cover image, title, author, date, category badge, excerpt
- components/store/blog/BlogPostPage.tsx — renders rich text content_json from Tiptap, shows author, tags, social share buttons
- components/store/blog/SocialShare.tsx — share buttons: WhatsApp, X, Facebook, Pinterest, copy link
- components/store/blog/RelatedPosts.tsx — 3 related posts by same category
- components/store/blog/BlogCTA.tsx — in-post CTA card linking to a specific collection (configurable per post)

Public API routes:
- GET /api/storefront/blog/posts — paginated list, filterable by category slug or tag slug
- GET /api/storefront/blog/posts/[slug] — single published post

Reference: prd_new.md §7, seo_blog_strategy.md §3.3, §3.5, §5, §6
```

---

### Step 5.2 — Blog Engine (Admin)

```
Create the admin blog management module for Vastrayug:

Pages:
- app/(admin)/admin/blog/page.tsx — DataTable of all blog posts: title, category, status, author, published date, actions
- app/(admin)/admin/blog/new/page.tsx — new post form
- app/(admin)/admin/blog/[id]/page.tsx — full editor with all fields:
  - Title, slug (SlugField), cover image (ImageUploader)
  - Content (RichTextEditor — Tiptap)
  - Excerpt
  - Category (Select), Tags (MultiSelect)
  - Author (pre-filled to current admin user)
  - Status: DRAFT / PUBLISHED / ARCHIVED
  - SEO fields: meta_title, meta_description, canonical_url
  - In-post CTA collection selector
- app/(admin)/admin/blog/categories/page.tsx — inline CRUD list
- app/(admin)/admin/blog/tags/page.tsx — inline CRUD list

Blog admin API routes:
- GET/POST /api/admin/blog/posts
- GET/PUT/DELETE /api/admin/blog/posts/[id]
- GET/POST /api/admin/blog/categories + GET/PUT/DELETE /api/admin/blog/categories/[id]
- GET/POST /api/admin/blog/tags + GET/PUT/DELETE /api/admin/blog/tags/[id]

Initial content to draft and publish at Phase 2 launch (from seo_blog_strategy.md §6):
- "Sun Collection: The Sovereign" — Navagraha deep dive
- "Moon Collection: The Reborn" — Navagraha deep dive
- "Saturn Collection" deep dive
- "Jupiter Collection" deep dive
- "Vibe Collection: The Sovereign Story"
- "Vibe Collection: The Reborn Story"
- "The Story Behind Vastrayug" — brand origin post

Reference: admin_panel_spec.md §11, seo_blog_strategy.md §5, §6
```

---

### Step 5.3 — Newsletter Integration

```
Create the newsletter subscription system for Vastrayug:

components/store/layout/NewsletterForm.tsx:
- Email input + "Subscribe" button
- On submit: POST /api/storefront/newsletter
- On success: show a thank-you toast; fire Meta Lead pixel event via pushPixelEvent('Lead')
- Validate email format client-side with Zod before submitting

POST /api/storefront/newsletter handler (update if already created in Step 4.7):
- Upsert NewsletterSubscriber record (don't error on duplicate email)
- Add email to the SendGrid marketing list via @sendgrid/mail
- Push Lead Meta pixel event marker in the response for client to fire

Reference: prd_new.md §8.6, tracking_events.md §5.6
```

---

### Step 5.4 — Popup System

```
Create the popup system for Vastrayug:

hooks/usePopup.ts:
- On mount: fetch active, non-expired popups from GET /api/storefront/popups
- Evaluate client-side trigger conditions per popup: delay (setTimeout), scroll depth (scroll event), exit-intent (mouseleave on document)
- Track shown popup IDs in sessionStorage to prevent repeat shows in the same session

components/store/popups/PopupManager.tsx:
- Renders in the storefront layout
- Uses usePopup hook
- Mounts PopupModal when a popup is triggered

components/store/popups/PopupModal.tsx:
- Radix Dialog component
- Renders the popup content_json (which can be a newsletter form, a discount announcement, or a collection CTA)
- Animated open/close

GET /api/storefront/popups:
- Returns all active, non-expired popups

Admin popup management:
- app/(admin)/admin/popups/page.tsx — DataTable of all popups
- app/(admin)/admin/popups/new/page.tsx + app/(admin)/admin/popups/[id]/page.tsx — form with: title, content_json editor, trigger type (delay/scroll/exit), trigger_value, start_at, end_at, status toggle
- Admin popup API routes: GET/POST/PUT/DELETE

Reference: prd_new.md §6.7, component_architecture.md §4.8, admin_panel_spec.md §14
```

---

### Step 5.5 — Coupon & Promotion Management

```
Create the coupon and promotion admin module for Vastrayug:

Coupon pages + API:
- app/(admin)/admin/coupons/page.tsx — DataTable with columns: code, type, value, usage/limit, expires, status
- app/(admin)/admin/coupons/new/page.tsx + /[id]/page.tsx — form with: code, type (PERCENTAGE/FIXED/FREE_SHIPPING), value, minimum_order_amount, usage_limit, expires_at, status. Usage Report tab on the edit page.
- Coupon admin API routes: GET/POST/PUT/DELETE + GET /api/admin/coupons/[id]/usage

Promotion pages + API:
- app/(admin)/admin/promotions/page.tsx — DataTable
- app/(admin)/admin/promotions/[id]/page.tsx — form with start/end date, discount rule, applicable products/collections
- Promotion admin API routes: GET/POST/PUT/DELETE

Update cart/checkout validation:
- In the coupon validation logic (called by CouponInput.tsx): apply coupon rules — check: active, not expired, usage_limit not exceeded, minimum_order_amount met. Return the discount amount or an error reason.

Reference: admin_panel_spec.md §12–13, schema.prisma (Coupon model)
```

---

### Step 5.6 — Announcement Bar Management

```
Create the announcement bar admin module for Vastrayug:

app/(admin)/admin/announcements/page.tsx:
- Form + list on one page (no separate detail page needed)
- Form fields: message text, background colour picker, text colour picker, start_at, end_at, active toggle
- Live preview below the form showing what the bar will look like
- Enforce one-active constraint: activating one bar automatically deactivates any currently active bar (implement at API level, not just UI)

Announcement API routes:
- GET /api/admin/announcements — list all
- POST /api/admin/announcements — create
- PUT /api/admin/announcements/[id] — update (enforces one-active at DB transaction level)
- DELETE /api/admin/announcements/[id]

Reference: admin_panel_spec.md §15
```

---

## PHASE 3 — ANALYTICS & TRACKING

---

### Step 6.1 — Full GA4 DataLayer Events

```
Implement all 11 GA4 e-commerce DataLayer events for Vastrayug using lib/datalayer.ts pushEcommerceEvent():

- page_view — add a route-change listener in app/(store)/layout.tsx using usePathname(); fire on every navigation
- view_item — fire in app/(store)/shop/[slug]/page.tsx on mount; pass full GA4 item object via buildGa4Item()
- view_item_list — fire in all listing pages (shop, category, collection) on mount with items[]
- select_item — fire in ProductCard onClick handler (already scaffolded in Step 4.6f)
- add_to_cart — fire in AddToCartButton on success (already scaffolded in Step 4.6m)
- remove_from_cart — fire in CartItem remove handler (already scaffolded in Step 4.8d)
- view_cart — fire in cart page on mount (already scaffolded in Step 4.8b)
- begin_checkout — fire in checkout page on mount (already scaffolded in Step 4.9a)
- add_shipping_info — fire in ShippingMethodSelector on selection (already scaffolded in Step 4.9d)
- add_payment_info — fire in RazorpayButton when modal opens (already scaffolded in Step 4.9e)
- purchase — fire in order-confirmation page on mount (already scaffolded in Step 4.9g); must include transactionId, value, tax, shipping, items[]

Verify all 11 events appear correctly in GA4 DebugView after implementation.
Reference: tracking_events.md §4
```

---

### Step 6.2 — Meta Pixel Standard Events

```
Implement all 8 Meta Pixel standard events for Vastrayug using lib/datalayer.ts pushPixelEvent():

1. Replace PLACEHOLDER_META_PIXEL_ID with the real Pixel ID in .env and Settings table
2. ViewContent — fire in PDP (app/(store)/shop/[slug]/page.tsx) on mount with content_ids, content_type, value, currency
3. AddToCart — fire in AddToCartButton on success with content_ids, value, currency
4. InitiateCheckout — fire in checkout page on mount with value, num_items
5. AddPaymentInfo — fire in RazorpayButton when modal opens
6. Purchase — fire in order-confirmation page on mount with content_ids[], value, currency
7. Lead — fire in NewsletterForm on successful subscribe
8. Search — fire in search results page on mount with search_string

Verify all events appear in Meta Events Manager → Test Events.
Reference: tracking_events.md §5
```

---

### Step 6.3 — Tag-Friendly Markup Audit

```
Audit all Vastrayug storefront components and ensure the following GTM-friendly markup is present:

Product cards and grids — every ProductCard must have these data attributes on its root element:
  data-product-id={product.id}
  data-product-name={product.title}
  data-product-category={product.category.name}
  data-product-price={product.price}
  data-product-planet={product.planet}
  data-gtm-action="select_item"

CTA buttons — every significant call-to-action button must have:
  id (unique, kebab-case, descriptive)
  data-gtm-action (e.g. "add_to_cart", "begin_checkout", "subscribe_newsletter")
  data-gtm-category (e.g. "product", "cart", "newsletter")
  data-gtm-label (descriptive label)

Forms:
  Search form root element: id="form-site-search"
  Newsletter form root element: id="form-newsletter"

After applying, verify in GTM Preview mode that click triggers can read these data attributes.
Reference: tracking_events.md §6
```

---

### Step 6.4 — Performance Optimisation Pass

```
Run the performance optimisation pass for Vastrayug before Phase 3 launch:

Target metrics:
- Lighthouse mobile Performance score ≥ 90
- LCP < 1.2s

Checklist:
- [ ] Verify the Largest Contentful Paint element is not render-blocking. If it is a hero image, add priority prop to the <Image> component.
- [ ] All images use next/image and are served as WebP or AVIF via Cloudflare CDN
- [ ] All below-the-fold images use loading="lazy" (next/image default — verify no manual overrides breaking this)
- [ ] SolarSystemBanner CSS animations only use transform and opacity — no animating top, left, margin, or width. Verify will-change: transform is applied only to animated elements (not all elements).
- [ ] Run Lighthouse on a real mid-range Android device via Chrome DevTools remote debugging and confirm 60fps on the banner

Fix any issues found until all targets are met.
Reference: tracking_events.md §6, tech_stack.md §3
```

---

## PHASE 4 — ENHANCEMENTS

---

### Step 7.1 — Google Social Login

```
Enable Google Social Login for Vastrayug:

1. Create a Google OAuth 2.0 Client ID in Google Cloud Console. Add authorised redirect URI: https://vastrayug.in/api/auth/callback/google
2. Add credentials to .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
3. In lib/auth.ts: uncomment (or add) GoogleProvider({ clientId, clientSecret })
4. Set NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED=true
5. In login page: add a "Continue with Google" button (shown only when NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED=true)
6. Update tracking: fire sign_up / login DataLayer events with method: 'google' on successful Google auth callback

Reference: tech_stack.md §5, tracking_events.md
```

---

### Step 7.2 — SMS Notifications (Twilio)

```
Enable SMS order notifications for Vastrayug:

1. Add to .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
2. Set NEXT_PUBLIC_SMS_ENABLED=true
3. Create lib/twilio.ts: export sendSMS(to: string, body: string) using the Twilio Node.js SDK
4. In the order status update API (PATCH /api/admin/orders/[id]/status): when SMS is enabled, call sendSMS() for these status transitions:
   - PLACED → "Your Vastrayug order #[number] has been placed! We'll notify you when it ships."
   - SHIPPED → "Your order #[number] has shipped! Track: [tracking_url]"
   - OUT_FOR_DELIVERY → "Your order #[number] is out for delivery today!"
   - DELIVERED → "Your order #[number] has been delivered. Thank you for shopping with Vastrayug!"
   (SMS message copy from phases.md §Phase 4)

Reference: tech_stack.md §8, phases.md §Phase 4
```

---

### Step 7.3 — Product Reviews

```
Build the product review system for Vastrayug:

Storefront:
- components/store/product/ReviewsSection.tsx — displays approved reviews below the product description; shows star rating summary (average + distribution bar chart); logged-out users see a "Login to review" prompt
- Review submission form — react-hook-form, 1–5 star rating + text body, visible only to logged-in users
- POST /api/storefront/reviews — create Review with status = PENDING; validate user has purchased the product before allowing review (optional but preferred)
- Add aggregateRating JSON-LD to PDP once at least one approved review exists (seo_blog_strategy.md §3.2)

Admin:
- Review moderation panel — DataTable of all reviews filtered by status; bulk approve/reject actions
- PATCH /api/admin/reviews/[id] — approve or reject a review

Set NEXT_PUBLIC_REVIEWS_ENABLED=true when complete.
Reference: prd_new.md §14, seo_blog_strategy.md §3.2
```

---

### Step 7.4 — Wishlist

```
Build the wishlist feature for Vastrayug:

Set NEXT_PUBLIC_WISHLIST_ENABLED=true when complete.

Components:
- WishlistButton — heart icon toggle shown on ProductCard and PDP; fills on add, outline on remove; visible only when wishlist is enabled
- app/(store)/account/wishlist/page.tsx — grid of wishlisted products using ProductCard, with "Remove" action

Wishlist API routes:
- GET /api/storefront/wishlist — fetch current user's wishlist items (auth required)
- POST /api/storefront/wishlist — add product to wishlist
- DELETE /api/storefront/wishlist/[productId] — remove from wishlist

Reference: prd_new.md §14
```

---

### Step 7.5 — Advanced Filters

```
Extend the product filter system for Vastrayug with cosmic filters:

Add the following filter options to FilterSidebar.tsx on all listing pages (/shop, /category/[slug], /collection/[slug]):
- Filter by NavagrahaPlanet (multi-select, shows planet emoji/colour swatch)
- Filter by ZodiacSign (multi-select)
- Filter by life_path_number (multi-select, numbers 1–9)

URL behaviour:
- Each filter adds a URL search param (planet, zodiac, life_path)
- Pages using generateStaticParams with dynamic filters must use ISR + revalidate to handle filter combinations
- Add canonical tags on filtered pages pointing to the unfiltered page URL to avoid duplicate content SEO issues

Reference: prd_new.md §14, seo_blog_strategy.md §2
```

---

### Step 7.6 — Search Autocomplete

```
Add real-time search autocomplete to the SearchBar component for Vastrayug:

Update components/store/layout/SearchBar.tsx (or create if not yet built):
- On each keystroke (debounced 300ms): call GET /api/storefront/search?q=[query]&limit=5
- Display a dropdown of up to 5 product suggestions showing: product thumbnail, name, price, planet badge
- Clicking a suggestion navigates to /shop/[slug]
- Press Enter navigates to /shop?search=[query] (full results page)
- Close dropdown on click outside or Escape key

Update GET /api/storefront/search:
- Use Prisma @@fulltext index to search across title, tags, and emotional_intention
- Also search collection names — include matching collections in results
- Return products and collections as separate result groups

Reference: prd_new.md §14, schema.prisma (@@fulltext indexes)
```

---

### Step 7.7 — Admin Dashboard Charts

```
Add analytics charts to the admin dashboard for Vastrayug:

components/admin/dashboard/RevenueChart.tsx:
- recharts LineChart showing daily revenue for the last 30 days (or weekly for last 12 weeks, switchable)
- X-axis: date, Y-axis: revenue in INR
- Tooltip showing exact amount on hover

components/admin/dashboard/TopProductsChart.tsx:
- recharts BarChart showing the top 10 products by units sold in the last 30 days
- X-axis: product name (truncated), Y-axis: units sold

GET /api/admin/dashboard/charts:
- Returns: dailyRevenue[] ({ date, revenue }), topProducts[] ({ productName, unitsSold })
- Aggregate from Order and OrderItem tables (only DELIVERED or COMPLETED orders)

Add both charts below the MetricsRow in app/(admin)/admin/dashboard/page.tsx.
Reference: admin_panel_spec.md §5, prd_new.md §14
```

---

### Step 7.8 — Full Admin RBAC

```
Implement full Role-Based Access Control for Vastrayug admin panel:

1. AdminSidebar.tsx — conditionally render nav items based on session.user.role using the permissions matrix from admin_panel_spec.md §3. Hide items the current role cannot access.

2. API-level enforcement — create a requireRole(roles: Role[]) server-side helper (add to lib/auth.ts). Apply it to EVERY admin API route handler. Return 403 if the user's role is not in the allowed list. Do not rely on UI-only hiding.

3. Role-specific restrictions (from admin_panel_spec.md §3):
   - MANAGER: cannot access Users, Settings, Activity Log
   - ADMIN: cannot promote users to SUPER_ADMIN, cannot access Activity Log
   - SUPER_ADMIN: full access to everything

4. app/(admin)/admin/activity-log/page.tsx — accessible to SUPER_ADMIN only
   - DataTable of AdminActivityLog records: admin user, action, entity type, entity ID, timestamp
   - Filter by admin user and date range
   - GET /api/admin/activity-log endpoint

Reference: admin_panel_spec.md §3, §17
```

---

## PHASE 5 — SCALE & ITERATE

---

### Step 8 — Phase 5 Features

```
Implement Phase 5 scale features for Vastrayug after product-market fit is confirmed.
Build each item independently — they do not depend on each other:

1. Shipping Provider API Integration (Delhivery / DTDC):
   Replace manual tracking updates with automated shipping provider API calls.
   On order status change to SHIPPED: auto-create a shipment via the carrier API and pull back the tracking number.
   Reference: phases.md §Phase 5

2. Meta Conversions API (Server-Side Events):
   For each client-side Pixel event, send an equivalent server-side event to the Meta Conversions API with hashed email + phone.
   Add an eventID to both the client and server calls for deduplication.
   Reference: tracking_events.md §5.4

3. Multi-currency Support:
   Enable Razorpay multi-currency. Add a currency selector to the navbar. Convert all displayed prices using an exchange rate API.
   Reference: phases.md §Phase 5

4. i18n (Multi-language):
   Add next-intl. Start with English (en) and Hindi (hi).
   Reference: phases.md §Phase 5

5. A/B Testing Infrastructure:
   Add middleware-based A/B testing using a cookie to bucket users. Start with a CTA copy test on the home page hero.
   Reference: phases.md §Phase 5

6. Personalisation Engine:
   Recommend products based on the user's zodiac sign, planet (from their profile), and past order history.
   Build a GET /api/storefront/recommendations endpoint.
   Reference: phases.md §Phase 5
```

---

## DEPLOYMENT CHECKLIST

---

### Environment Setup

```
Configure the Vastrayug production environment on Hostinger:

- [ ] Add ALL environment variables from tech_stack.md §15 to Hostinger hPanel → Node.js → Environment Variables
- [ ] Verify .env.local is listed in .gitignore — confirm it was never committed
- [ ] Verify .env.example (with placeholder values only) IS committed to git
- [ ] Set NEXTAUTH_URL=https://vastrayug.in (not localhost)
- [ ] Set all RAZORPAY_* vars to live (not test) keys
```

---

### Database Deployment

```
Deploy the Vastrayug database to production Hostinger:

- [ ] Run on production server: npx prisma migrate deploy (NOT migrate dev — never run migrate dev in production)
- [ ] Run on production server: npx prisma db seed (only once on a fresh DB)
- [ ] Set DATABASE_CONNECTION_LIMIT env var to an appropriate value for Hostinger's MySQL connection limit (check hPanel for the limit)
- [ ] Verify the seed created: the SUPER_ADMIN user, all 7 categories, all 9 collections, and all default Settings rows
```

---

### Build & Start

```
Build and start the Vastrayug production server on Hostinger:

npm run build   # Creates .next production bundle — fix any TypeScript or lint errors before proceeding
npm run start   # Starts on port 3000; Hostinger reverse proxy maps port 3000 → 443

If the build fails: fix all TypeScript errors (the build is strict) and re-run.
```

---

### DNS & SSL

```
Configure DNS and SSL for vastrayug.in:

- [ ] Add vastrayug.in to Cloudflare (free plan is sufficient)
- [ ] In Hostinger hPanel: point nameservers to Cloudflare's assigned nameservers
- [ ] Wait for DNS propagation (up to 48h, usually 15 min)
- [ ] In Cloudflare: set SSL/TLS → Encryption Mode to "Full (strict)"
- [ ] Add a Cloudflare Page Rule: www.vastrayug.in/* → 301 Redirect → https://vastrayug.in/$1
- [ ] Verify Hostinger SSL certificate is installed and valid (hPanel → SSL)
```

---

### Security Verification

```
Run the security verification checklist for Vastrayug before going live:

- [ ] Change default admin password: log in at https://vastrayug.in/admin with vastrayug.in@gmail.com / admin and immediately change it
- [ ] Verify rate limiting on POST /api/auth/signin — use a tool like curl to send 10 rapid requests and confirm the 11th is rejected
- [ ] Verify CSRF protection is active — NextAuth handles this automatically; confirm NEXTAUTH_SECRET is set and non-empty
- [ ] Verify Razorpay webhook signature check: send a forged webhook request with an invalid signature and confirm the handler returns 400
- [ ] Verify no .env.local or secrets appear in the git log: run `git log --all --full-history -- .env*`
```

---

### Pre-Launch End-to-End Verification

```
Execute the Vastrayug pre-launch end-to-end test suite:

- [ ] Full purchase flow: browse → add to cart → checkout → Razorpay payment → order confirmation page loads → purchase DataLayer event fires → confirmation email received in inbox
- [ ] Admin order management: find the new order in /admin/orders → update status to SHIPPED → enter tracking number → confirm a shipping email is sent to the customer
- [ ] Product image upload: in admin, upload a new product image → confirm it appears on the storefront PDP
- [ ] GTM verification: open GTM Preview mode, browse the site, and confirm all 11 GA4 e-commerce events fire on the correct actions
- [ ] GA4 real-time: verify events appear in GA4 DebugView
- [ ] Sitemap: visit https://vastrayug.in/sitemap.xml — confirm it loads and contains product, collection, and category URLs
- [ ] Robots.txt: visit https://vastrayug.in/robots.txt — confirm /admin/* and /api/* are disallowed
- [ ] Lighthouse: run a mobile audit from Chrome DevTools → Performance score ≥ 90
- [ ] SolarSystemBanner: connect a mid-range Android device via USB, open Chrome remote debugging, load the home page, and verify the banner runs at 60fps in the Performance tab
```
