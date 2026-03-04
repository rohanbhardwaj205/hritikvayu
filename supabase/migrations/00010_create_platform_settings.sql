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
    'Traditional Indian Fashion, Reimagined',
    'support@vastrayug.com',
    99900,
    18.00
);
