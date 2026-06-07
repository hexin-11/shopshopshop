import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import type { RouteKey } from "../data/mockData";
import { user as fallbackUser } from "../data/mockData";
import { navItems } from "../lib/routes";
import { api } from "../lib/api";
import { cn } from "../lib/utils";

interface TopNavProps {
  current: RouteKey;
  navigate: (r: RouteKey) => void;
  onLogout: () => void;
}

export default function TopNav({ current, navigate, onLogout }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(fallbackUser);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    api.currentUser().then((nextUser) => {
      if (nextUser) setUser(nextUser);
    });
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

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-[#E5E7EB] bg-white/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[90px] max-w-[1440px] items-center px-8 lg:px-12">
        <div className="flex w-0 flex-1 items-center">
          <button
            onClick={() => navigate("dashboard")}
            className="text-[24px] font-[900] tracking-[-0.03em] text-[#171719] transition-opacity hover:opacity-80"
          >
            VibeGen AI
          </button>
        </div>

        <nav className="hidden items-center gap-12 md:flex">
          {navItems.map(({ key, label }) => {
            const isActive = current === key;
            return (
              <button
                key={key}
                onClick={() => navigate(key)}
                className={cn(
                  "text-[17px] font-bold transition-colors",
                  isActive ? "text-[#171719]" : "text-[#171719]/60 hover:text-[#171719]",
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex w-0 flex-1 items-center justify-end gap-5">
          <button
            aria-label="通知"
            className="text-[#171719]/60 transition-colors hover:text-[#171719]"
          >
            <Bell size={20} strokeWidth={2} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 text-[#171719]/80 transition-colors hover:text-[#171719]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4684EE] text-sm font-bold text-white shadow-sm">
                {user.avatar}
              </div>
              <ChevronDown
                size={14}
                className={cn("transition-transform", dropdownOpen && "rotate-180")}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+16px)] w-56 animate-slide-up rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
                <div className="px-3 py-2">
                  <p className="text-[15px] font-semibold text-[#171719]">{user.name}</p>
                  <p className="text-[13px] text-[#171719]/50">{user.email}</p>
                </div>
                <div className="my-2 h-px bg-[#E5E7EB]" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
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
