import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/enums";
import { Roles } from "@/types/enums";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  avatar_url: string | null;
  is_banned: boolean;
};

export async function getServerUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url, is_banned")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  if (profile.is_banned) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as Role,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    is_banned: profile.is_banned,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getServerUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== Roles.ADMIN && user.role !== Roles.SUPER_ADMIN) {
    throw new Error("Admin access required");
  }

  return user;
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== Roles.SUPER_ADMIN) {
    throw new Error("Super admin access required");
  }

  return user;
}
