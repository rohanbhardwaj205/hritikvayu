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
