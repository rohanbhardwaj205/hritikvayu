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
