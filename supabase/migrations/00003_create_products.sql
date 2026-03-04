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
