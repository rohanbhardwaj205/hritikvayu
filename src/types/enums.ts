export const Roles = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  CUSTOMER: "customer",
} as const;
export type Role = (typeof Roles)[keyof typeof Roles];

export const OrderStatuses = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;
export type OrderStatus = (typeof OrderStatuses)[keyof typeof OrderStatuses];

export const PaymentStatuses = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;
export type PaymentStatus =
  (typeof PaymentStatuses)[keyof typeof PaymentStatuses];

export const DiscountTypes = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
} as const;
export type DiscountType =
  (typeof DiscountTypes)[keyof typeof DiscountTypes];
