import { ChevronsLeft, ChevronsRight, Film, Sparkles } from "lucide-react";
import type { RouteKey } from "../data/mockData";
import { navItems } from "../lib/routes";
import { cn } from "../lib/utils";

interface SidebarProps {
  current: RouteKey;
  collapsed: boolean;
  onToggle: () => void;
  navigate: (r: RouteKey) => void;
  onQuickGenerate: () => void;
}

export default function Sidebar({ current, collapsed, onToggle, navigate, onQuickGenerate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 hidden h-screen flex-col border-r border-zinc-200/80 bg-white transition-all duration-300 ease-in-out lg:flex",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Logo 区域 */}
      <div className={cn("flex h-16 items-center border-b border-zinc-100 px-4", collapsed && "justify-center px-0")}>
        <button
          onClick={() => navigate("dashboard")}
          className={cn("flex min-w-0 items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-zinc-50", collapsed && "justify-center px-0")}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Film size={18} strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-tight text-zinc-900">ShopClip AI</div>
              <div className="text-[10px] text-zinc-400">电商短视频工作台</div>
            </div>
          )}
        </button>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="收起侧边栏"
          >
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      {/* 一键成片 CTA */}
      <div className={cn("px-3 py-4", collapsed && "flex justify-center px-2")}>
        <button
          onClick={onQuickGenerate}
          className={cn(
            "btn-primary w-full gap-1.5 text-sm shadow-sm",
            collapsed && "w-auto px-2.5 py-2.5"
          )}
          title={collapsed ? "一键成片" : undefined}
        >
          <Sparkles size={15} />
          {!collapsed && "一键成片"}
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = current === key;
          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              title={collapsed ? label : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                collapsed && "justify-center px-0 py-3",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2 : 1.75}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-brand-600" : "text-zinc-400 group-hover:text-zinc-700"
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部展开按钮（仅折叠状态） */}
      {collapsed && (
        <div className="flex justify-center border-t border-zinc-100 py-3">
          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="展开侧边栏"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
