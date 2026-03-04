import { z } from "zod/v4";

// ---------- Auth ----------

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

// ---------- Product ----------

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  base_price: z.number().int().positive("Price must be positive"),
  compare_price: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});
export type ProductInput = z.infer<typeof productSchema>;

// ---------- Address ----------

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z.string().default("India"),
});
export type AddressInput = z.infer<typeof addressSchema>;

// ---------- Review ----------

export const reviewSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  rating: z.number().int().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  title: z.string().optional(),
  body: z.string().optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

// ---------- Coupon ----------

export const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive("Discount value must be positive"),
  min_order_value: z.number().int().positive().optional(),
  max_discount: z.number().int().positive().optional(),
  usage_limit: z.number().int().positive().optional(),
  per_user_limit: z.number().int().positive().default(1),
  valid_from: z.string().datetime("Invalid start date"),
  valid_until: z.string().datetime("Invalid end date").optional(),
});
export type CouponInput = z.infer<typeof couponSchema>;
