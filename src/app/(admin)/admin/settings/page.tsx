"use client";

import { useState, useEffect } from "react";
import { Save, Settings, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/stores/authStore";
import type { PlatformSettings } from "@/types";

export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "super_admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [storeTagline, setStoreTagline] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [gstPercentage, setGstPercentage] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const json = await res.json();
          const settings = json.data as PlatformSettings;
          setStoreName(settings.store_name || "");
          setStoreTagline(settings.store_tagline || "");
          setSupportEmail(settings.support_email || "");
          setSupportPhone(settings.support_phone || "");
          setFreeShippingThreshold(
            settings.free_shipping_threshold
              ? String(settings.free_shipping_threshold)
              : ""
          );
          setGstPercentage(
            settings.gst_percentage ? String(settings.gst_percentage) : ""
          );
          setRazorpayKeyId(settings.razorpay_key_id || "");
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName,
          store_tagline: storeTagline || null,
          support_email: supportEmail || null,
          support_phone: supportPhone || null,
          free_shipping_threshold: freeShippingThreshold
            ? parseInt(freeShippingThreshold, 10)
            : 0,
          gst_percentage: gstPercentage
            ? parseFloat(gstPercentage)
            : 0,
          razorpay_key_id: razorpayKeyId || null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Save settings error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldAlert className="h-12 w-12 text-admin-muted" />
        <p className="mt-4 text-lg font-medium text-admin-text">
          Access Denied
        </p>
        <p className="mt-1 text-sm text-admin-muted">
          Only super admins can access platform settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-primary-light" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">
          Platform Settings
        </h1>
        <p className="mt-1 text-sm text-admin-muted">
          Manage your store configuration
        </p>
      </div>

      {/* Store Info */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <div className="mb-5 flex items-center gap-2">
          <Settings className="h-5 w-5 text-admin-muted" />
          <h3 className="text-base font-semibold text-admin-text">
            Store Information
          </h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Store Name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Vastrayug"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Tagline"
            value={storeTagline}
            onChange={(e) => setStoreTagline(e.target.value)}
            placeholder="Your tagline"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Support Email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="support@example.com"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="Support Phone"
            type="tel"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
        </div>
      </div>

      {/* Pricing & Tax */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <h3 className="mb-5 text-base font-semibold text-admin-text">
          Pricing & Tax
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Free Shipping Threshold (paise)"
            type="number"
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(e.target.value)}
            placeholder="e.g. 99900 for Rs 999"
            min="0"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
          <Input
            label="GST Percentage"
            type="number"
            value={gstPercentage}
            onChange={(e) => setGstPercentage(e.target.value)}
            placeholder="e.g. 18"
            min="0"
            step="0.01"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-6">
        <h3 className="mb-5 text-base font-semibold text-admin-text">
          Payment Gateway
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Razorpay Key ID"
            value={razorpayKeyId}
            onChange={(e) => setRazorpayKeyId(e.target.value)}
            placeholder="rzp_live_xxxxx"
            className="!bg-admin-bg !text-admin-text !border-admin-border"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
        {success && (
          <span className="text-sm font-medium text-emerald-400">
            Settings saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}
