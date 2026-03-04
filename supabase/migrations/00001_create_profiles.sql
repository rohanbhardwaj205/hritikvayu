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
