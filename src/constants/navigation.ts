import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Users,
  Ticket,
  Megaphone,
  Star,
  Settings,
  ScrollText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface AdminSidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const storefrontNavLinks: NavLink[] = [
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const adminSidebarItems: AdminSidebarItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Promotions", href: "/admin/promotions", icon: Megaphone },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
