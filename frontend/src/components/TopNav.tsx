import { useState, useRef, useEffect } from "react";
import { Bell, Settings, LogOut, ChevronDown } from "lucide-react";
import type { RouteKey } from "../data/mockData";
import { navItems } from "../lib/routes";
import { user } from "../data/mockData";
import { cn } from "../lib/utils";

interface TopNavProps {
  current: RouteKey;
  navigate: (r: RouteKey) => void;
}

export default function TopNav({ current, navigate }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const mainNav = navItems.filter((item) => item.key !== "settings");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-[#E5E7EB]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-[90px] max-w-[1440px] items-center px-8 lg:px-12">
        
        {/* 左区：品牌名 siter.io style */}
        <div className="flex w-0 flex-1 items-center">
          <button
            onClick={() => navigate("dashboard")}
            className="text-[24px] font-[900] tracking-[-0.03em] text-[#171719] hover:opacity-80 transition-opacity"
          >
            shopclip·ai
          </button>
        </div>

        {/* 中区：导航 */}
        <nav className="hidden md:flex items-center gap-12">
          {mainNav.map(({ key, label }) => {
            const isActive =
              current === key ||
              (current === ("productDetail" as RouteKey) && key === "products");

            return (
              <button
                key={key}
                onClick={() => navigate(key as RouteKey)}
                className={cn(
                  "text-[17px] font-bold transition-colors",
                  isActive
                    ? "text-[#171719]"
                    : "text-[#171719]/60 hover:text-[#171719]"
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* 右区：工具 */}
        <div className="flex w-0 flex-1 items-center justify-end gap-5">
          <button className="text-[#171719]/60 hover:text-[#171719] transition-colors">
            <Bell size={20} strokeWidth={2} />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 text-[#171719]/80 hover:text-[#171719] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4684EE] text-sm font-bold text-white shadow-sm">
                {user.avatar}
              </div>
              <ChevronDown size={14} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+16px)] w-56 animate-slide-up rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
                <div className="px-3 py-2">
                  <p className="text-[15px] font-semibold text-[#171719]">{user.name}</p>
                  <p className="text-[13px] text-[#171719]/50">{user.email}</p>
                </div>
                <div className="my-2 h-px bg-[#E5E7EB]" />
                <button
                  onClick={() => { navigate("settings"); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-[#171719]/80 transition-colors hover:bg-neutral-50 hover:text-[#171719]"
                >
                  <Settings size={16} className="text-[#171719]/50" />
                  偏好设置
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-red-500 transition-colors hover:bg-red-50 hover:text-red-600">
                  <LogOut size={16} className="text-red-400" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
