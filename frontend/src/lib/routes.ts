import { BarChart3, Boxes, Clapperboard, LayoutDashboard, PenLine, Settings, type LucideIcon } from "lucide-react";
import type { RouteKey } from "../data/mockData";

export const routePaths: Record<RouteKey, string> = {
  dashboard: "/dashboard",
  assets: "/assets",
  scripts: "/scripts",
  projects: "/projects",
  analytics: "/analytics",
  settings: "/settings"
};

export const navItems = [
  { key: "dashboard", label: "仪表盘", icon: LayoutDashboard },
  { key: "assets", label: "素材库", icon: Boxes },
  { key: "scripts", label: "AI 脚本", icon: PenLine },
  { key: "projects", label: "视频项目", icon: Clapperboard },
  { key: "analytics", label: "数据分析", icon: BarChart3 },
  { key: "settings", label: "设置", icon: Settings }
] as const satisfies ReadonlyArray<{
  key: RouteKey;
  label: string;
  icon: LucideIcon;
}>;

export function getRouteKeyFromPath(pathname: string): RouteKey {
  const match = Object.entries(routePaths).find(([, path]) => path === pathname);
  return (match?.[0] as RouteKey | undefined) ?? "dashboard";
}
