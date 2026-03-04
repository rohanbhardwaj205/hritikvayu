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
