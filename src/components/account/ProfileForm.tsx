"use client";

import { useState, useRef } from "react";
import { Save, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/providers/ToastProvider";

interface ProfileFormProps {
  className?: string;
}

export function ProfileForm({ className }: ProfileFormProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneLoaded, setPhoneLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch full profile on mount to get phone
  useState(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setPhone(data.data?.phone ?? "");
        }
      } catch {
        // silently fail
      } finally {
        setPhoneLoaded(true);
      }
    }
    loadProfile();
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast("Image must be smaller than 2MB", "error");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      addToast("Full name is required", "error");
      return;
    }

    setLoading(true);

    try {
      // Upload avatar first if changed
      let avatarUrl = user?.avatar_url ?? null;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.data?.url ?? avatarUrl;
        } else {
          addToast("Failed to upload avatar", "error");
        }
      }

      // Update profile
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          avatar_url: avatarUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update auth store with new user info
        if (user) {
          setUser({
            ...user,
            full_name: fullName.trim(),
            avatar_url: avatarUrl,
          });
        }
        addToast("Profile updated successfully", "success");
        setAvatarFile(null);
      } else {
        const errData = await res.json();
        addToast(errData.error || "Failed to update profile", "error");
      }
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar
            src={avatarPreview || user?.avatar_url}
            alt={user?.full_name}
            fallback={user?.full_name}
            size="lg"
            className="h-20 w-20 text-lg"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-hover transition-colors cursor-pointer"
            aria-label="Change avatar"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Profile Photo</p>
          <p className="text-xs text-muted mt-0.5">
            JPG, PNG or WebP. Max 2MB.
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />

        <Input
          label="Email"
          type="email"
          value={user?.email ?? ""}
          disabled
          className="bg-surface"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9876543210"
        />
      </div>

      <Button type="submit" variant="primary" loading={loading} disabled={loading}>
        <Save className="h-4 w-4" />
        Save Changes
      </Button>
    </form>
  );
}
