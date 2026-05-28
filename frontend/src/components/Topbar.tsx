import { Bell, Search } from "lucide-react";
import { user } from "../data/mockData";

interface TopbarProps {
  pageTitle?: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 h-14 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="flex h-full items-center gap-4 px-5 lg:px-8">
        {/* 页面标题（小屏）或搜索框 */}
        {pageTitle ? (
          <h1 className="text-base font-semibold text-zinc-900">{pageTitle}</h1>
        ) : (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
            <input
              className="input pl-9 h-9 text-sm"
              placeholder="搜索项目、商品、脚本…"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* 通知 */}
          <button className="relative rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100">
            <Bell size={17} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
          </button>

          {/* 用户头像 */}
          <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-zinc-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
              {user.avatar}
            </div>
            <span className="hidden text-sm font-medium text-zinc-700 md:block">{user.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
