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
