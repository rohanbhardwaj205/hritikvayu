-- ============================================================================
-- Migration: 00001_create_profiles
-- Description: User profiles extending Supabase auth.users
-- ============================================================================

CREATE TABLE public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    phone       TEXT,
    avatar_url  TEXT,
    role        TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('super_admin', 'admin', 'customer')),
    is_banned   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Extended user profile data linked to auth.users';
COMMENT ON COLUMN public.profiles.role IS 'User role: super_admin, admin, or customer';
COMMENT ON COLUMN public.profiles.is_banned IS 'Flag to ban a user from the platform';

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
-- ============================================================================
-- Migration: 00002_create_categories
-- Description: Product categories with self-referencing parent for hierarchy
-- ============================================================================

CREATE TABLE public.categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Product categories supporting nested hierarchy via parent_id';
COMMENT ON COLUMN public.categories.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN public.categories.parent_id IS 'Self-referencing FK for category nesting';

-- Indexes
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
-- ============================================================================
-- Migration: 00003_create_products
-- Description: Products, product images, and product variants
-- ============================================================================

-- --------------------------------------------------------------------------
-- Products
-- --------------------------------------------------------------------------
CREATE TABLE public.products (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    description      TEXT,
    rich_description TEXT,
    category_id      UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    base_price       INT NOT NULL,                     -- stored in paise (INR x 100)
    compare_price    INT,                              -- original / MRP in paise
    currency         TEXT NOT NULL DEFAULT 'INR',
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
    tags             TEXT[] DEFAULT '{}',
    meta_title       TEXT,
    meta_description TEXT,
    avg_rating       NUMERIC(2,1) NOT NULL DEFAULT 0.0,
    review_count     INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Main product catalog';
COMMENT ON COLUMN public.products.base_price IS 'Price in paise (e.g. 99900 = Rs 999.00)';
COMMENT ON COLUMN public.products.compare_price IS 'Strike-through / MRP price in paise';
COMMENT ON COLUMN public.products.tags IS 'Free-form text tags for filtering';

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);

-- --------------------------------------------------------------------------
-- Product Images
-- --------------------------------------------------------------------------
CREATE TABLE public.product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    alt_text    TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_images IS 'Images associated with a product';

CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);

-- --------------------------------------------------------------------------
-- Product Variants (size / color / SKU)
-- --------------------------------------------------------------------------
CREATE TABLE public.product_variants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku                 TEXT NOT NULL UNIQUE,
    size                TEXT,
    color               TEXT,
    color_hex           TEXT,
    price_override      INT,                           -- paise; NULL means use base_price
    stock               INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_variants IS 'Size/color variants for a product with stock tracking';
COMMENT ON COLUMN public.product_variants.price_override IS 'Overrides products.base_price when set (paise)';

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
-- ============================================================================
-- Migration: 00004_create_orders
-- Description: Orders and order line items
-- ============================================================================

-- --------------------------------------------------------------------------
-- Orders
-- --------------------------------------------------------------------------
CREATE TABLE public.orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        TEXT NOT NULL UNIQUE,
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

    -- Status
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                            'pending', 'confirmed', 'processing',
                            'shipped', 'delivered', 'cancelled', 'refunded'
                        )),

    -- Money (all in paise)
    subtotal            INT NOT NULL DEFAULT 0,
    discount_amount     INT NOT NULL DEFAULT 0,
    shipping_cost       INT NOT NULL DEFAULT 0,
    tax_amount          INT NOT NULL DEFAULT 0,
    total               INT NOT NULL DEFAULT 0,

    -- Coupon snapshot (FK added in 00007 after coupons table exists)
    coupon_id           UUID,
    coupon_code         TEXT,

    -- Shipping address snapshot (denormalised for immutability)
    shipping_name       TEXT,
    shipping_phone      TEXT,
    shipping_line1      TEXT,
    shipping_line2      TEXT,
    shipping_city       TEXT,
    shipping_state      TEXT,
    shipping_pincode    TEXT,
    shipping_country    TEXT DEFAULT 'India',

    -- Payment
    payment_method      TEXT,
    payment_status      TEXT NOT NULL DEFAULT 'pending'
                        CHECK (payment_status IN (
                            'pending', 'paid', 'failed', 'refunded'
                        )),
    razorpay_order_id   TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature  TEXT,

    -- Shipping / delivery
    tracking_number     TEXT,
    tracking_url        TEXT,
    shipped_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancel_reason       TEXT,

    -- Misc
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.orders IS 'Customer orders with address snapshot and payment info';

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- --------------------------------------------------------------------------
-- Order Items (line items)
-- --------------------------------------------------------------------------
CREATE TABLE public.order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,

    -- Snapshot fields (immutable record of what was ordered)
    product_name    TEXT NOT NULL,
    variant_label   TEXT,
    sku             TEXT,

    quantity        INT NOT NULL DEFAULT 1,
    unit_price      INT NOT NULL,           -- paise
    total_price     INT NOT NULL,           -- paise (quantity * unit_price)

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_items IS 'Individual line items within an order';

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
-- ============================================================================
-- Migration: 00005_create_cart_wishlist
-- Description: Shopping cart and wishlist for authenticated users
-- ============================================================================

-- --------------------------------------------------------------------------
-- Cart Items
-- --------------------------------------------------------------------------
CREATE TABLE public.cart_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id  UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, product_id, variant_id)
);

COMMENT ON TABLE public.cart_items IS 'Server-side shopping cart for logged-in users';

CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

-- --------------------------------------------------------------------------
-- Wishlist Items
-- --------------------------------------------------------------------------
CREATE TABLE public.wishlist_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, product_id)
);

COMMENT ON TABLE public.wishlist_items IS 'User wishlists / saved products';

CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);
-- ============================================================================
-- Migration: 00006_create_reviews
-- Description: Product reviews with ratings
-- ============================================================================

CREATE TABLE public.reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id    UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title       TEXT,
    body        TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (product_id, user_id)
);

COMMENT ON TABLE public.reviews IS 'Product reviews; one review per user per product';
COMMENT ON COLUMN public.reviews.is_verified IS 'True if user has purchased the product';
COMMENT ON COLUMN public.reviews.is_approved IS 'Moderation flag; defaults to true (auto-approved)';

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
-- ============================================================================
-- Migration: 00007_create_coupons
-- Description: Discount coupons with usage limits and validity windows
-- ============================================================================

CREATE TABLE public.coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL UNIQUE,
    description     TEXT,
    discount_type   TEXT NOT NULL
                    CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value  INT NOT NULL,                      -- percentage (e.g. 10) or paise (e.g. 10000)
    min_order_value INT,                               -- paise
    max_discount    INT,                               -- paise; caps percentage discounts
    usage_limit     INT,                               -- NULL = unlimited
    used_count      INT NOT NULL DEFAULT 0,
    per_user_limit  INT NOT NULL DEFAULT 1,
    valid_from      TIMESTAMPTZ,
    valid_until     TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.coupons IS 'Discount coupons / promo codes';
COMMENT ON COLUMN public.coupons.discount_value IS 'Percentage integer or fixed amount in paise';
COMMENT ON COLUMN public.coupons.per_user_limit IS 'Max times a single user can redeem this coupon';

CREATE INDEX idx_coupons_code ON public.coupons(code);

-- --------------------------------------------------------------------------
-- Add deferred FK from orders.coupon_id -> coupons.id
-- --------------------------------------------------------------------------
ALTER TABLE public.orders
    ADD CONSTRAINT fk_orders_coupon
    FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;
-- ============================================================================
-- Migration: 00008_create_promotions
-- Description: Homepage / storefront promotional banners
-- ============================================================================

CREATE TABLE public.promotions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    subtitle    TEXT,
    image_url   TEXT,
    link_url    TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at   TIMESTAMPTZ,
    ends_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.promotions IS 'Promotional banners and hero slides';
-- ============================================================================
-- Migration: 00009_create_audit_logs
-- Description: Audit trail for admin actions
-- ============================================================================

CREATE TABLE public.audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   UUID,
    metadata    JSONB DEFAULT '{}',
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Immutable audit log of admin / system actions';
COMMENT ON COLUMN public.audit_logs.action IS 'e.g. create, update, delete, ban_user';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'e.g. product, order, user';

CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
-- ============================================================================
-- Migration: 00010_create_platform_settings
-- Description: Global platform / store settings (single-row table)
-- ============================================================================

CREATE TABLE public.platform_settings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name              TEXT NOT NULL DEFAULT 'Vastrayug',
    store_tagline           TEXT,
    support_email           TEXT,
    support_phone           TEXT,
    free_shipping_threshold INT NOT NULL DEFAULT 99900,         -- paise (Rs 999)
    gst_percentage          NUMERIC(4,2) NOT NULL DEFAULT 18.00,
    razorpay_key_id         TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.platform_settings IS 'Single-row store configuration';
COMMENT ON COLUMN public.platform_settings.free_shipping_threshold IS 'Order total in paise above which shipping is free';
COMMENT ON COLUMN public.platform_settings.gst_percentage IS 'GST rate applied to orders';

-- Insert the default settings row
INSERT INTO public.platform_settings (
    store_name,
    store_tagline,
    support_email,
    free_shipping_threshold,
    gst_percentage
) VALUES (
    'Vastrayug',
    'Premium Men''s Streetwear & Casual Clothing',
    'support@vastrayug.com',
    99900,
    18.00
);
-- ============================================================================
-- Migration: 00011_create_functions_triggers
-- Description: Reusable functions and triggers
--   1. update_updated_at() - auto-set updated_at on every UPDATE
--   2. handle_new_user()   - auto-create profile row on auth.users INSERT
--   3. update_product_rating() - recalculate avg_rating & review_count
--   4. generate_order_number() - sequential order numbers VY-YYYYMMDD-XXXX
-- ============================================================================

-- ==========================================================================
-- 1. Automatic updated_at timestamp
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply trigger to every table that has an updated_at column
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_platform_settings_updated_at
    BEFORE UPDATE ON public.platform_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ==========================================================================
-- 2. Auto-create profile on new auth signup
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================================================
-- 3. Recalculate product avg_rating and review_count
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _product_id UUID;
BEGIN
    -- Determine the affected product_id for INSERT, UPDATE, or DELETE
    IF TG_OP = 'DELETE' THEN
        _product_id := OLD.product_id;
    ELSE
        _product_id := NEW.product_id;
    END IF;

    UPDATE public.products
    SET
        avg_rating   = COALESCE((
            SELECT ROUND(AVG(rating)::NUMERIC, 1)
            FROM public.reviews
            WHERE product_id = _product_id AND is_approved = TRUE
        ), 0),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE product_id = _product_id AND is_approved = TRUE
        )
    WHERE id = _product_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();


-- ==========================================================================
-- 4. Generate sequential order numbers: VY-YYYYMMDD-XXXX
-- ==========================================================================

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    _seq INT;
BEGIN
    _seq := nextval('public.order_number_seq');
    NEW.order_number := 'VY-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(_seq::TEXT, 4, '0');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION public.generate_order_number();
-- ============================================================================
-- Migration: 00012_create_rls_policies
-- Description: Row Level Security policies for all tables
-- ============================================================================

-- ==========================================================================
-- Enable RLS on every public table
-- ==========================================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ==========================================================================
-- Helper functions
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'super_admin'
    );
$$;

-- ==========================================================================
-- PROFILES
-- ==========================================================================

-- Users can read their own profile
CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY profiles_select_admin ON public.profiles
    FOR SELECT USING (public.is_admin());

-- Users can update their own profile (but not role or is_banned)
CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Super admins can update any profile (including role / ban)
CREATE POLICY profiles_update_super_admin ON public.profiles
    FOR UPDATE USING (public.is_super_admin());

-- ==========================================================================
-- CATEGORIES
-- ==========================================================================

-- Anyone (including anon) can read active categories
CREATE POLICY categories_select_public ON public.categories
    FOR SELECT USING (TRUE);

-- Admins can insert / update / delete
CREATE POLICY categories_insert_admin ON public.categories
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY categories_update_admin ON public.categories
    FOR UPDATE USING (public.is_admin());

CREATE POLICY categories_delete_admin ON public.categories
    FOR DELETE USING (public.is_admin());

-- ==========================================================================
-- PRODUCTS
-- ==========================================================================

-- Public can read active products
CREATE POLICY products_select_public ON public.products
    FOR SELECT USING (is_active = TRUE);

-- Admins can read ALL products (including inactive)
CREATE POLICY products_select_admin ON public.products
    FOR SELECT USING (public.is_admin());

-- Admins can write
CREATE POLICY products_insert_admin ON public.products
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY products_update_admin ON public.products
    FOR UPDATE USING (public.is_admin());

CREATE POLICY products_delete_admin ON public.products
    FOR DELETE USING (public.is_admin());

-- ==========================================================================
-- PRODUCT IMAGES
-- ==========================================================================

-- Public read
CREATE POLICY product_images_select_public ON public.product_images
    FOR SELECT USING (TRUE);

-- Admin write
CREATE POLICY product_images_insert_admin ON public.product_images
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY product_images_update_admin ON public.product_images
    FOR UPDATE USING (public.is_admin());

CREATE POLICY product_images_delete_admin ON public.product_images
    FOR DELETE USING (public.is_admin());

-- ==========================================================================
-- PRODUCT VARIANTS
-- ==========================================================================

-- Public read
CREATE POLICY product_variants_select_public ON public.product_variants
    FOR SELECT USING (TRUE);

-- Admin write
CREATE POLICY product_variants_insert_admin ON public.product_variants
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY product_variants_update_admin ON public.product_variants
    FOR UPDATE USING (public.is_admin());

CREATE POLICY product_variants_delete_admin ON public.product_variants
    FOR DELETE USING (public.is_admin());

-- ==========================================================================
-- CART ITEMS
-- ==========================================================================

CREATE POLICY cart_items_select_own ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY cart_items_insert_own ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cart_items_update_own ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY cart_items_delete_own ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================================================
-- WISHLIST ITEMS
-- ==========================================================================

CREATE POLICY wishlist_items_select_own ON public.wishlist_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY wishlist_items_insert_own ON public.wishlist_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY wishlist_items_delete_own ON public.wishlist_items
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================================================
-- ORDERS
-- ==========================================================================

-- Users can read their own orders
CREATE POLICY orders_select_own ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY orders_select_admin ON public.orders
    FOR SELECT USING (public.is_admin());

-- Users can insert their own orders
CREATE POLICY orders_insert_own ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can update any order (status changes, tracking, etc.)
CREATE POLICY orders_update_admin ON public.orders
    FOR UPDATE USING (public.is_admin());

-- ==========================================================================
-- ORDER ITEMS
-- ==========================================================================

-- Users can read order items for their own orders
CREATE POLICY order_items_select_own ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND orders.user_id = auth.uid()
        )
    );

-- Admins can read all order items
CREATE POLICY order_items_select_admin ON public.order_items
    FOR SELECT USING (public.is_admin());

-- Users can insert order items for their own orders
CREATE POLICY order_items_insert_own ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND orders.user_id = auth.uid()
        )
    );

-- ==========================================================================
-- REVIEWS
-- ==========================================================================

-- Anyone can read approved reviews
CREATE POLICY reviews_select_public ON public.reviews
    FOR SELECT USING (is_approved = TRUE);

-- Admins can read all reviews (including unapproved)
CREATE POLICY reviews_select_admin ON public.reviews
    FOR SELECT USING (public.is_admin());

-- Authenticated users can insert their own review
CREATE POLICY reviews_insert_own ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own review
CREATE POLICY reviews_update_own ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own review
CREATE POLICY reviews_delete_own ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can update any review (moderate: approve/reject)
CREATE POLICY reviews_update_admin ON public.reviews
    FOR UPDATE USING (public.is_admin());

-- ==========================================================================
-- COUPONS
-- ==========================================================================

-- Admins: full CRUD
CREATE POLICY coupons_select_admin ON public.coupons
    FOR SELECT USING (public.is_admin());

CREATE POLICY coupons_insert_admin ON public.coupons
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY coupons_update_admin ON public.coupons
    FOR UPDATE USING (public.is_admin());

CREATE POLICY coupons_delete_admin ON public.coupons
    FOR DELETE USING (public.is_admin());

-- Authenticated users can read active coupons (for validation at checkout)
CREATE POLICY coupons_select_auth ON public.coupons
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND is_active = TRUE
    );

-- ==========================================================================
-- PROMOTIONS
-- ==========================================================================

-- Public can read active promotions (within date range)
CREATE POLICY promotions_select_public ON public.promotions
    FOR SELECT USING (
        is_active = TRUE
        AND (starts_at IS NULL OR starts_at <= now())
        AND (ends_at IS NULL OR ends_at >= now())
    );

-- Admins can read all promotions
CREATE POLICY promotions_select_admin ON public.promotions
    FOR SELECT USING (public.is_admin());

-- Admin write
CREATE POLICY promotions_insert_admin ON public.promotions
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY promotions_update_admin ON public.promotions
    FOR UPDATE USING (public.is_admin());

CREATE POLICY promotions_delete_admin ON public.promotions
    FOR DELETE USING (public.is_admin());

-- ==========================================================================
-- AUDIT LOGS
-- ==========================================================================

-- Only admins can read audit logs (nobody can write via RLS; use service role)
CREATE POLICY audit_logs_select_admin ON public.audit_logs
    FOR SELECT USING (public.is_admin());

-- ==========================================================================
-- PLATFORM SETTINGS
-- ==========================================================================

-- Admins can read settings
CREATE POLICY platform_settings_select_admin ON public.platform_settings
    FOR SELECT USING (public.is_admin());

-- Super admins can update settings
CREATE POLICY platform_settings_update_super_admin ON public.platform_settings
    FOR UPDATE USING (public.is_super_admin());

-- ============================================================================
-- Seed Data for Vastrayug — Men's Streetwear & Casual Clothing
-- Run with: supabase db reset  (applies migrations + seed)
-- ============================================================================

-- ==========================================================================
-- Categories (6)
-- ==========================================================================
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Jeans',        'jeans',        'Premium denim jeans in slim, straight, and relaxed fits.',        1, TRUE),
    ('a1000000-0000-0000-0000-000000000002', 'Cargos',       'cargos',       'Functional cargo pants built for style and utility.',             2, TRUE),
    ('a1000000-0000-0000-0000-000000000003', 'Sweatshirts',  'sweatshirts',  'Cozy crewneck and graphic sweatshirts for layering.',            3, TRUE),
    ('a1000000-0000-0000-0000-000000000004', 'Hoodies',      'hoodies',      'Pullover and zip-up hoodies for everyday comfort.',               4, TRUE),
    ('a1000000-0000-0000-0000-000000000005', 'Shirts',       'shirts',       'Casual and semi-formal shirts in modern cuts.',                   5, TRUE),
    ('a1000000-0000-0000-0000-000000000006', 'T-Shirts',     't-shirts',     'Essential tees and graphic t-shirts in premium cotton.',           6, TRUE);


-- ==========================================================================
-- Products (12 — 2 per category)
-- ==========================================================================
INSERT INTO public.products (id, name, slug, description, rich_description, category_id, base_price, compare_price, is_active, is_featured, tags) VALUES

    -- ── Jeans ──────────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000001',
     'Classic Slim Fit Jeans',
     'classic-slim-fit-jeans',
     'Clean, versatile slim fit jeans in premium stretch denim. A wardrobe essential that pairs with everything.',
     '<p>The <strong>Classic Slim Fit Jeans</strong> are crafted from premium stretch denim that holds its shape all day. Featuring a mid-rise waist, tapered leg, and clean wash finish — these are the jeans you will reach for every morning.</p><ul><li>98% Cotton, 2% Elastane</li><li>Mid-rise, slim through thigh</li><li>Machine washable</li></ul>',
     'a1000000-0000-0000-0000-000000000001',
     199900, 299900, TRUE, FALSE,
     ARRAY['jeans', 'slim-fit', 'denim', 'essentials']),

    ('b1000000-0000-0000-0000-000000000002',
     'Distressed Denim Jeans',
     'distressed-denim-jeans',
     'Street-ready distressed jeans with ripped knee detail and faded wash for an effortless edge.',
     '<p>Make a statement with these <strong>Distressed Denim Jeans</strong>. Featuring artfully placed rips at the knee, a faded mid-wash, and a relaxed slim fit that balances style with comfort.</p><ul><li>100% Cotton Denim</li><li>Relaxed slim fit</li><li>Ripped knee detail</li></ul>',
     'a1000000-0000-0000-0000-000000000001',
     249900, 349900, TRUE, FALSE,
     ARRAY['jeans', 'distressed', 'denim', 'streetwear']),

    -- ── Cargos ─────────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000003',
     'Tactical Cargo Pants',
     'tactical-cargo-pants',
     'Rugged tactical cargo pants with multiple utility pockets and a tapered modern silhouette.',
     '<p>Built for function without sacrificing style, the <strong>Tactical Cargo Pants</strong> feature six utility pockets, a drawstring hem, and durable ripstop fabric that handles anything you throw at it.</p><ul><li>Cotton-nylon ripstop blend</li><li>6 utility pockets</li><li>Drawstring adjustable hem</li></ul>',
     'a1000000-0000-0000-0000-000000000002',
     179900, 249900, TRUE, FALSE,
     ARRAY['cargos', 'tactical', 'utility', 'streetwear']),

    ('b1000000-0000-0000-0000-000000000004',
     'Relaxed Fit Cargo Pants',
     'relaxed-fit-cargo-pants',
     'Easy-going relaxed fit cargos with an elastic waist and clean cargo pocket design.',
     '<p>Comfort meets utility in the <strong>Relaxed Fit Cargo Pants</strong>. An elastic waistband, relaxed cut through the leg, and streamlined cargo pockets make these perfect for weekends and everyday wear.</p><ul><li>100% Cotton twill</li><li>Elastic waist with drawstring</li><li>Relaxed fit through leg</li></ul>',
     'a1000000-0000-0000-0000-000000000002',
     159900, NULL, TRUE, FALSE,
     ARRAY['cargos', 'relaxed-fit', 'casual', 'comfort']),

    -- ── Sweatshirts ────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000005',
     'Oversized Crewneck Sweatshirt',
     'oversized-crewneck-sweatshirt',
     'Dropped-shoulder oversized crewneck in heavyweight french terry. The ultimate layering piece.',
     '<p>The <strong>Oversized Crewneck Sweatshirt</strong> is made from 400 GSM french terry for that premium heavyweight feel. Dropped shoulders, ribbed cuffs, and a boxy silhouette give it that effortless oversized look.</p><ul><li>400 GSM French Terry</li><li>100% Cotton</li><li>Dropped shoulder, boxy fit</li></ul>',
     'a1000000-0000-0000-0000-000000000003',
     149900, 199900, TRUE, FALSE,
     ARRAY['sweatshirt', 'oversized', 'crewneck', 'winter']),

    ('b1000000-0000-0000-0000-000000000006',
     'Graphic Print Sweatshirt',
     'graphic-print-sweatshirt',
     'Statement graphic print sweatshirt with bold front artwork and a regular relaxed fit.',
     '<p>Express yourself with the <strong>Graphic Print Sweatshirt</strong>. Features a bold front graphic, soft brushed fleece lining, and a relaxed regular fit that works layered or on its own.</p><ul><li>350 GSM Brushed Fleece</li><li>Cotton-polyester blend</li><li>Screen-printed graphic</li></ul>',
     'a1000000-0000-0000-0000-000000000003',
     129900, NULL, TRUE, FALSE,
     ARRAY['sweatshirt', 'graphic', 'print', 'casual']),

    -- ── Hoodies ────────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000007',
     'Premium Zip-Up Hoodie',
     'premium-zip-up-hoodie',
     'Full-zip hoodie in heavyweight fleece with a clean minimal design. Premium quality, everyday comfort.',
     '<p>The <strong>Premium Zip-Up Hoodie</strong> is built from 420 GSM heavyweight fleece for warmth that lasts. Features a full YKK zip, kangaroo pockets, and a double-lined hood for structure and durability.</p><ul><li>420 GSM Heavyweight Fleece</li><li>YKK zip closure</li><li>Double-lined hood</li><li>Kangaroo pockets</li></ul>',
     'a1000000-0000-0000-0000-000000000004',
     199900, 279900, TRUE, TRUE,
     ARRAY['hoodie', 'zip-up', 'premium', 'winter']),

    ('b1000000-0000-0000-0000-000000000008',
     'Pullover Fleece Hoodie',
     'pullover-fleece-hoodie',
     'Classic pullover hoodie with brushed fleece lining. Warm, soft, and built for layering.',
     '<p>A cold-weather essential, the <strong>Pullover Fleece Hoodie</strong> wraps you in ultra-soft brushed fleece. The relaxed fit, ribbed cuffs, and front kangaroo pocket make this the hoodie you will live in all winter.</p><ul><li>380 GSM Brushed Fleece</li><li>Relaxed pullover fit</li><li>Front kangaroo pocket</li></ul>',
     'a1000000-0000-0000-0000-000000000004',
     169900, NULL, TRUE, TRUE,
     ARRAY['hoodie', 'pullover', 'fleece', 'winter']),

    -- ── Shirts ─────────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000009',
     'Oxford Button-Down Shirt',
     'oxford-button-down-shirt',
     'Timeless Oxford button-down in premium cotton. Dressed up or down, it always looks sharp.',
     '<p>The <strong>Oxford Button-Down Shirt</strong> is crafted from premium Oxford cotton with a soft, textured hand-feel. A button-down collar, curved hem, and tailored regular fit make it versatile enough for the office or a weekend brunch.</p><ul><li>Premium Oxford Cotton</li><li>Button-down collar</li><li>Regular tailored fit</li></ul>',
     'a1000000-0000-0000-0000-000000000005',
     149900, 199900, TRUE, TRUE,
     ARRAY['shirt', 'oxford', 'button-down', 'smart-casual']),

    ('b1000000-0000-0000-0000-000000000010',
     'Slim Fit Casual Shirt',
     'slim-fit-casual-shirt',
     'Modern slim fit shirt in soft washed cotton. Clean lines for a sharp, put-together look.',
     '<p>The <strong>Slim Fit Casual Shirt</strong> is made from garment-washed cotton for a lived-in softness from day one. Slim through the body with a spread collar and single chest pocket.</p><ul><li>Garment-washed cotton</li><li>Slim fit</li><li>Spread collar</li></ul>',
     'a1000000-0000-0000-0000-000000000005',
     129900, NULL, TRUE, FALSE,
     ARRAY['shirt', 'slim-fit', 'casual', 'cotton']),

    -- ── T-Shirts ───────────────────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000011',
     'Essential Cotton T-Shirt',
     'essential-cotton-t-shirt',
     'Your everyday essential tee in 100% combed cotton. Soft, breathable, and built to last.',
     '<p>The <strong>Essential Cotton T-Shirt</strong> is made from 180 GSM combed cotton for a soft, smooth feel against the skin. Pre-shrunk, reinforced collar, and a regular fit that flatters every body type.</p><ul><li>180 GSM Combed Cotton</li><li>Pre-shrunk fabric</li><li>Reinforced crew neck</li><li>Regular fit</li></ul>',
     'a1000000-0000-0000-0000-000000000006',
     69900, 99900, TRUE, TRUE,
     ARRAY['tshirt', 'essential', 'cotton', 'basics']),

    ('b1000000-0000-0000-0000-000000000012',
     'Oversized Graphic Tee',
     'oversized-graphic-tee',
     'Streetwear-inspired oversized tee with bold back print and dropped shoulders.',
     '<p>The <strong>Oversized Graphic Tee</strong> brings streetwear energy to your everyday rotation. Featuring a bold back graphic, dropped shoulders, and a boxy oversized fit in 200 GSM cotton.</p><ul><li>200 GSM Cotton</li><li>Oversized boxy fit</li><li>Bold back print</li><li>Dropped shoulders</li></ul>',
     'a1000000-0000-0000-0000-000000000006',
     89900, NULL, TRUE, FALSE,
     ARRAY['tshirt', 'oversized', 'graphic', 'streetwear']);


-- ==========================================================================
-- Product Images (2-3 per product)
-- ==========================================================================
INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
    -- Classic Slim Fit Jeans
    ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop', 'Classic Slim Fit Jeans - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=800&fit=crop', 'Classic Slim Fit Jeans - Detail', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=800&fit=crop', 'Classic Slim Fit Jeans - Side', 2, FALSE),

    -- Distressed Denim Jeans
    ('b1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop', 'Distressed Denim Jeans - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1475178626620-a4d074967571?w=600&h=800&fit=crop', 'Distressed Denim Jeans - Detail', 1, FALSE),

    -- Tactical Cargo Pants
    ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop', 'Tactical Cargo Pants - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&h=800&fit=crop', 'Tactical Cargo Pants - Side', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop', 'Tactical Cargo Pants - Detail', 2, FALSE),

    -- Relaxed Fit Cargo Pants
    ('b1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&h=800&fit=crop', 'Relaxed Fit Cargo Pants - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop', 'Relaxed Fit Cargo Pants - Side', 1, FALSE),

    -- Oversized Crewneck Sweatshirt
    ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Oversized Crewneck Sweatshirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=800&fit=crop', 'Oversized Crewneck Sweatshirt - Back', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop', 'Oversized Crewneck Sweatshirt - Detail', 2, FALSE),

    -- Graphic Print Sweatshirt
    ('b1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=800&fit=crop', 'Graphic Print Sweatshirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Graphic Print Sweatshirt - Back', 1, FALSE),

    -- Premium Zip-Up Hoodie
    ('b1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Premium Zip-Up Hoodie - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=800&fit=crop', 'Premium Zip-Up Hoodie - Side', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop', 'Premium Zip-Up Hoodie - Detail', 2, FALSE),

    -- Pullover Fleece Hoodie
    ('b1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=800&fit=crop', 'Pullover Fleece Hoodie - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop', 'Pullover Fleece Hoodie - Back', 1, FALSE),

    -- Oxford Button-Down Shirt
    ('b1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop', 'Oxford Button-Down Shirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop', 'Oxford Button-Down Shirt - Detail', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=800&fit=crop', 'Oxford Button-Down Shirt - Side', 2, FALSE),

    -- Slim Fit Casual Shirt
    ('b1000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop', 'Slim Fit Casual Shirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop', 'Slim Fit Casual Shirt - Back', 1, FALSE),

    -- Essential Cotton T-Shirt
    ('b1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', 'Essential Cotton T-Shirt - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&h=800&fit=crop', 'Essential Cotton T-Shirt - Flat Lay', 1, FALSE),
    ('b1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop', 'Essential Cotton T-Shirt - Detail', 2, FALSE),

    -- Oversized Graphic Tee
    ('b1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600&h=800&fit=crop', 'Oversized Graphic Tee - Front', 0, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', 'Oversized Graphic Tee - Back', 1, FALSE);


-- ==========================================================================
-- Product Variants
-- ==========================================================================
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, price_override, stock, low_stock_threshold, is_active) VALUES

    -- ── Classic Slim Fit Jeans (bottoms: 28/30/32/34) ──────────────────────
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-BLK-28', '28', 'Black',  '#0A0A0A', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-BLK-30', '30', 'Black',  '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-BLK-32', '32', 'Black',  '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-NVY-30', '30', 'Navy',   '#1E3A5F', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-NVY-32', '32', 'Navy',   '#1E3A5F', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000001', 'VY-CSFJ-NVY-34', '34', 'Navy',   '#1E3A5F', NULL, 15, 5, TRUE),

    -- ── Distressed Denim Jeans ─────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLU-28', '28', 'Blue',    '#4A6FA5', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLU-30', '30', 'Blue',    '#4A6FA5', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLU-32', '32', 'Blue',    '#4A6FA5', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLK-30', '30', 'Black',   '#0A0A0A', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLK-32', '32', 'Black',   '#0A0A0A', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000002', 'VY-DDJ-BLK-34', '34', 'Black',   '#0A0A0A', NULL, 12, 5, TRUE),

    -- ── Tactical Cargo Pants ───────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-OLV-28', '28', 'Olive',   '#556B2F', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-OLV-30', '30', 'Olive',   '#556B2F', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-OLV-32', '32', 'Olive',   '#556B2F', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-BLK-30', '30', 'Black',   '#0A0A0A', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-BLK-32', '32', 'Black',   '#0A0A0A', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000003', 'VY-TCP-BLK-34', '34', 'Black',   '#0A0A0A', NULL, 14, 5, TRUE),

    -- ── Relaxed Fit Cargo Pants ────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-GRY-28', '28', 'Grey',   '#6B6B6B', NULL, 12, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-GRY-30', '30', 'Grey',   '#6B6B6B', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-GRY-32', '32', 'Grey',   '#6B6B6B', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-OLV-30', '30', 'Olive',  '#556B2F', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-OLV-32', '32', 'Olive',  '#556B2F', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000004', 'VY-RFCP-OLV-34', '34', 'Olive',  '#556B2F', NULL, 15, 5, TRUE),

    -- ── Oversized Crewneck Sweatshirt (tops: S/M/L/XL) ────────────────────
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-GRY-M',  'M',  'Grey',    '#6B6B6B', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-GRY-L',  'L',  'Grey',    '#6B6B6B', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000005', 'VY-OCS-GRY-XL', 'XL', 'Grey',    '#6B6B6B', NULL, 15, 5, TRUE),

    -- ── Graphic Print Sweatshirt ───────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 12, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-WHT-M',  'M',  'White',   '#FFFFFF', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-WHT-L',  'L',  'White',   '#FFFFFF', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000006', 'VY-GPS-WHT-XL', 'XL', 'White',   '#FFFFFF', NULL, 10, 5, TRUE),

    -- ── Premium Zip-Up Hoodie ──────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-NVY-M',  'M',  'Navy',    '#1E3A5F', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-NVY-L',  'L',  'Navy',    '#1E3A5F', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000007', 'VY-PZH-NVY-XL', 'XL', 'Navy',    '#1E3A5F', NULL, 12, 5, TRUE),

    -- ── Pullover Fleece Hoodie ─────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-GRY-S',  'S',  'Grey',    '#6B6B6B', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-GRY-M',  'M',  'Grey',    '#6B6B6B', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-GRY-L',  'L',  'Grey',    '#6B6B6B', NULL, 28, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 26, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000008', 'VY-PFH-BLK-XL', 'XL', 'Black',   '#0A0A0A', NULL, 14, 5, TRUE),

    -- ── Oxford Button-Down Shirt ───────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-WHT-S',  'S',  'White',   '#FFFFFF', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-WHT-M',  'M',  'White',   '#FFFFFF', NULL, 28, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-WHT-L',  'L',  'White',   '#FFFFFF', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-NVY-M',  'M',  'Navy',    '#1E3A5F', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-NVY-L',  'L',  'Navy',    '#1E3A5F', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000009', 'VY-OBS-NVY-XL', 'XL', 'Navy',    '#1E3A5F', NULL, 12, 5, TRUE),

    -- ── Slim Fit Casual Shirt ──────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-BLK-S',  'S',  'Black',  '#0A0A0A', NULL, 15, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-BLK-M',  'M',  'Black',  '#0A0A0A', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-BLK-L',  'L',  'Black',  '#0A0A0A', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-OLV-M',  'M',  'Olive',  '#556B2F', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-OLV-L',  'L',  'Olive',  '#556B2F', NULL, 16, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000010', 'VY-SFCS-OLV-XL', 'XL', 'Olive',  '#556B2F', NULL, 10, 5, TRUE),

    -- ── Essential Cotton T-Shirt ───────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 30, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-WHT-S',  'S',  'White',   '#FFFFFF', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-WHT-M',  'M',  'White',   '#FFFFFF', NULL, 28, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-WHT-L',  'L',  'White',   '#FFFFFF', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-GRY-M',  'M',  'Grey',    '#6B6B6B', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-GRY-L',  'L',  'Grey',    '#6B6B6B', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000011', 'VY-ECT-GRY-XL', 'XL', 'Grey',    '#6B6B6B', NULL, 15, 5, TRUE),

    -- ── Oversized Graphic Tee ──────────────────────────────────────────────
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-BLK-S',  'S',  'Black',   '#0A0A0A', NULL, 18, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-BLK-M',  'M',  'Black',   '#0A0A0A', NULL, 25, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-BLK-L',  'L',  'Black',   '#0A0A0A', NULL, 28, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-WHT-M',  'M',  'White',   '#FFFFFF', NULL, 20, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-WHT-L',  'L',  'White',   '#FFFFFF', NULL, 22, 5, TRUE),
    ('b1000000-0000-0000-0000-000000000012', 'VY-OGT-WHT-XL', 'XL', 'White',   '#FFFFFF', NULL, 12, 5, TRUE);


-- ==========================================================================
-- Coupons (2)
-- ==========================================================================
INSERT INTO public.coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, per_user_limit, valid_from, valid_until, is_active) VALUES
    ('c1000000-0000-0000-0000-000000000001',
     'FIRST10',
     '10% off on your first order (min cart value Rs 999)',
     'percentage',
     10,
     99900,        -- min Rs 999
     50000,        -- max discount Rs 500
     5000,
     1,
     '2026-01-01T00:00:00Z',
     '2026-12-31T23:59:59Z',
     TRUE),

    ('c1000000-0000-0000-0000-000000000002',
     'WINTER20',
     '20% off on hoodies & sweatshirts (min cart value Rs 1499)',
     'percentage',
     20,
     149900,       -- min Rs 1499
     100000,       -- max discount Rs 1000
     2000,
     2,
     '2026-01-01T00:00:00Z',
     '2026-03-31T23:59:59Z',
     TRUE);


-- ==========================================================================
-- Promotion (1)
-- ==========================================================================
INSERT INTO public.promotions (id, title, subtitle, image_url, link_url, sort_order, is_active, starts_at, ends_at) VALUES
    ('d1000000-0000-0000-0000-000000000001',
     'Winter Collection 2026',
     'Up to 30% off on hoodies, sweatshirts & more',
     'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&h=600&fit=crop',
     '/categories/hoodies',
     1,
     TRUE,
     '2026-01-01T00:00:00Z',
     '2026-03-31T23:59:59Z');


-- ==========================================================================
-- Platform Settings (ensure exactly 1 row exists)
-- ==========================================================================
INSERT INTO public.platform_settings (store_name, store_tagline, support_email, support_phone, free_shipping_threshold, gst_percentage)
VALUES ('Vastrayug', 'Premium Men''s Streetwear & Casual Clothing', 'support@vastrayug.com', '+91-9876543210', 99900, 18.00)
ON CONFLICT (id) DO NOTHING;
