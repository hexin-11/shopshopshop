import { BarChart2, Package, Clapperboard, Settings, type LucideIcon } from "lucide-react";
import type { RouteKey } from "../data/mockData";

export const routePaths: Record<RouteKey, string> = {
  dashboard: "/dashboard",
  products:  "/products",
  projects:  "/projects",
  settings:  "/settings",
};

export const navItems = [
  { key: "dashboard", label: "概览",     icon: BarChart2 },
  { key: "products",  label: "商品管理", icon: Package },
  { key: "projects",  label: "视频项目", icon: Clapperboard },
  { key: "settings",  label: "设置",     icon: Settings },
] as const satisfies ReadonlyArray<{
  key: RouteKey;
  label: string;
  icon: LucideIcon;
}>;

export function getRouteKeyFromPath(pathname: string): RouteKey {
  if (pathname.startsWith("/products")) return "products";
  const match = Object.entries(routePaths).find(([, path]) => path === pathname);
  return (match?.[0] as RouteKey | undefined) ?? "dashboard";
}
