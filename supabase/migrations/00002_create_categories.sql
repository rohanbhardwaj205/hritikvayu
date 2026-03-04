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
