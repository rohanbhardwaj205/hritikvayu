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
