import { Bell, ChevronDown, Search } from "lucide-react";
import MemberAvatarGroup from "./MemberAvatarGroup";
import { user } from "../data/mockData";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="搜索项目、素材、脚本、商品…" />
        </div>
        <button className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 md:flex">
          耳机夏季促销 <ChevronDown size={16} />
        </button>
        <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><Bell size={18} /></button>
        <MemberAvatarGroup />
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">{user.avatar}</div>
          <span className="hidden text-sm font-medium text-slate-700 md:block">{user.name}</span>
        </button>
      </div>
    </header>
  );
}
