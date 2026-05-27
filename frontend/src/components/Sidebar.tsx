import { ChevronsLeft, ChevronsRight, Film } from "lucide-react";
import type { RouteKey } from "../data/mockData";
import { navItems } from "../lib/routes";
import { cn } from "../lib/utils";

export default function Sidebar({ current, collapsed, onToggle, navigate }: { current: RouteKey; collapsed: boolean; onToggle: () => void; navigate: (r: RouteKey) => void }) {
  return (
    <aside className={cn("fixed left-0 top-0 z-20 hidden h-screen border-r border-slate-200 bg-white px-3 py-5 transition-all lg:block", collapsed ? "w-20" : "w-64")}>
      <div className="mb-8 flex items-center justify-between gap-2">
        <button onClick={() => navigate("dashboard")} className={cn("flex min-w-0 items-center gap-3 rounded-lg px-2 py-1 text-left hover:bg-slate-50", collapsed && "justify-center")}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white"><Film size={21} /></div>
          {!collapsed && <div className="min-w-0">
          <div className="text-base font-bold text-slate-900">ShopClip AI</div>
          <div className="text-xs text-slate-500">电商短视频工作台</div>
        </div>}
        </button>
        {!collapsed && <button onClick={onToggle} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="收起侧边栏"><ChevronsLeft size={18} /></button>}
      </div>
      {collapsed && <button onClick={onToggle} className="mb-4 flex w-full justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="展开侧边栏"><ChevronsRight size={18} /></button>}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => navigate(key)}
            title={collapsed ? label : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              collapsed && "justify-center px-2",
              current === key ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Icon size={18} />
            {!collapsed && label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
