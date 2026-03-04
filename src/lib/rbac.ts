import type { Role } from "@/types/enums";
import { Roles } from "@/types/enums";

export type Permission =
  | "products:read"
  | "products:create"
  | "products:update"
  | "products:delete"
  | "orders:read"
  | "orders:update"
  | "orders:cancel"
  | "users:read"
  | "users:update"
  | "users:ban"
  | "categories:read"
  | "categories:create"
  | "categories:update"
  | "categories:delete"
  | "coupons:read"
  | "coupons:create"
  | "coupons:update"
  | "coupons:delete"
  | "promotions:read"
  | "promotions:create"
  | "promotions:update"
  | "promotions:delete"
  | "reviews:read"
  | "reviews:moderate"
  | "settings:read"
  | "settings:update"
  | "audit:read"
  | "analytics:read";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Roles.SUPER_ADMIN]: [
    "products:read",
    "products:create",
    "products:update",
    "products:delete",
    "orders:read",
    "orders:update",
    "orders:cancel",
    "users:read",
    "users:update",
    "users:ban",
    "categories:read",
    "categories:create",
    "categories:update",
    "categories:delete",
    "coupons:read",
    "coupons:create",
    "coupons:update",
    "coupons:delete",
    "promotions:read",
    "promotions:create",
    "promotions:update",
    "promotions:delete",
    "reviews:read",
    "reviews:moderate",
    "settings:read",
    "settings:update",
    "audit:read",
    "analytics:read",
  ],
  [Roles.ADMIN]: [
    "products:read",
    "products:create",
    "products:update",
    "orders:read",
    "orders:update",
    "orders:cancel",
    "users:read",
    "categories:read",
    "categories:create",
    "categories:update",
    "coupons:read",
    "coupons:create",
    "coupons:update",
    "promotions:read",
    "promotions:create",
    "promotions:update",
    "reviews:read",
    "reviews:moderate",
    "analytics:read",
  ],
  [Roles.CUSTOMER]: [],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requireRole(role: Role, allowed: Role[]): void {
  if (!allowed.includes(role)) {
    throw new Error(`Role "${role}" is not authorized. Required: ${allowed.join(", ")}`);
  }
}

export function isAdmin(role: Role): boolean {
  return role === Roles.ADMIN || role === Roles.SUPER_ADMIN;
}
