"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import type { Role } from "@/types/enums";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile(userId: string, email: string) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, role")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        // If profile doesn't exist yet, set a minimal user
        setUser({
          id: userId,
          email,
          full_name: "",
          avatar_url: null,
          role: "customer" as Role,
        });
        return;
      }

      setUser({
        id: profile.id,
        email: profile.email ?? email,
        full_name: profile.full_name ?? "",
        avatar_url: profile.avatar_url ?? null,
        role: (profile.role as Role) ?? "customer",
      });
    }

    // Check existing session on mount
    async function initAuth() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await fetchProfile(user.id, user.email ?? "");
      } else {
        setUser(null);
      }
    }

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchProfile(session.user.id, session.user.email ?? "");
      } else if (event === "SIGNED_OUT") {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, logout]);

  return <>{children}</>;
}
