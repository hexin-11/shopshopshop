import { BarChart2, Clapperboard, Package, type LucideIcon } from "lucide-react";
import type { RouteKey } from "../data/mockData";

export const routePaths: Record<RouteKey, string> = {
  dashboard: "/dashboard",
  products: "/products",
  projects: "/projects",
};

export const navItems = [
  { key: "dashboard", label: "概览", icon: BarChart2 },
  { key: "products", label: "商品管理", icon: Package },
  { key: "projects", label: "视频项目", icon: Clapperboard },
] as const satisfies ReadonlyArray<{
  key: RouteKey;
  label: string;
  icon: LucideIcon;
}>;

export function getRouteKeyFromPath(pathname: string): RouteKey {
  if (pathname.startsWith("/products")) return "products";
  if (pathname === "/settings") return "dashboard";
  const match = Object.entries(routePaths).find(([, path]) => path === pathname);
  return (match?.[0] as RouteKey | undefined) ?? "dashboard";
}
