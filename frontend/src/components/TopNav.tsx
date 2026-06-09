import { useState, useRef, useEffect } from "react";
import { Bell, Settings, LogOut, ChevronDown, Clapperboard, X, Menu } from "lucide-react";
import type { RouteKey } from "../data/mockData";
import { user as fallbackUser } from "../data/mockData";
import { navItems } from "../lib/routes";
import { api } from "../lib/api";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  const [trayOpen, setTrayOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobsList, setJobList] = useState<any[]>([]);

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

  const fetchJobs = () => {
    api.jobs().then((items) => {
      if (items) setJobList(items as any[]);
    });
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeJobsCount = jobsList.filter((j) => j.type === "generating").length;

  const mainNav = navItems;

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
        <div className="flex w-0 flex-1 items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#171719] hover:opacity-80 transition-opacity"
          >
            <Menu size={24} />
          </button>
          <button
            onClick={() => navigate("dashboard")}
            className="text-[20px] md:text-[24px] font-[900] tracking-[-0.03em] text-[#171719] transition-opacity hover:opacity-80 truncate"
          >
            TikFrame AI
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
            onClick={() => setTrayOpen(true)}
            className="relative text-[#171719]/60 hover:text-[#171719] transition-colors p-1"
          >
            <Clapperboard size={20} strokeWidth={2} />
            {activeJobsCount > 0 && (
              <span className="absolute right-0 top-0 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4684EE] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4684EE]" />
              </span>
            )}
          </button>

          <button className="text-[#171719]/60 hover:text-[#171719] transition-colors">
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

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-[#E5E7EB] bg-white overflow-hidden"
          >
            <nav className="flex flex-col py-2 px-6">
              {navItems.map(({ key, label }) => {
                const isActive = current === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      navigate(key);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "py-3 text-[16px] font-bold text-left transition-colors",
                      isActive ? "text-[#4684EE]" : "text-[#171719]/70 hover:text-[#171719]"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全局任务托盘抽屉 */}
      <AnimatePresence>
        {trayOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrayOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 right-0 top-0 z-[60] w-full max-w-[400px] border-l border-[#E5E7EB] bg-white p-4 md:p-6 shadow-2xl flex flex-col text-left"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                <div className="flex items-center gap-2">
                  <Clapperboard size={20} className="text-[#4684EE]" />
                  <h3 className="text-[18px] font-bold text-[#171719]">视频生成进度</h3>
                </div>
                <button
                  onClick={() => setTrayOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                {jobsList.map((job) => {
                  const isActive = job.type === "generating";
                  return (
                    <div key={job.id} className="rounded-xl border border-[#E5E7EB] bg-neutral-50 p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[15px] font-bold text-[#171719]">{job.name}</p>
                          <p className="text-[12px] text-[#171719]/50 mt-0.5">{job.project}</p>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                          isActive ? "bg-blue-50 text-[#4684EE]" : "bg-neutral-100 text-neutral-500"
                        )}>
                          {job.stage}
                        </span>
                      </div>
                      
                      {isActive && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[12px] text-[#171719]/60">
                            <span>正在生成...</span>
                            <span className="font-mono">{job.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#4684EE] transition-all duration-500"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 行内动作：取消/重试 */}
                      <div className="flex justify-end gap-2 pt-1">
                        {isActive ? (
                          <button
                            onClick={() => {
                              // 模拟取消
                              api.jobs().then((items) => {
                                const next = (items as any[]).map((j) =>
                                  j.id === job.id ? { ...j, type: "queued", stage: "排队中", progress: 0 } : j
                                );
                                setJobList(next);
                              });
                            }}
                            className="text-[12px] font-semibold text-red-500 hover:bg-red-50 px-2.5 py-1 rounded transition-colors"
                          >
                            取消任务
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              // 模拟启动
                              api.jobs().then((items) => {
                                const next = (items as any[]).map((j) =>
                                  j.id === job.id ? { ...j, type: "generating", stage: "渲染中", progress: 10 } : j
                                );
                                setJobList(next);
                              });
                            }}
                            className="text-[12px] font-semibold text-[#4684EE] hover:bg-blue-50 px-2.5 py-1 rounded transition-colors"
                          >
                            启动任务
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {jobsList.length === 0 && (
                  <div className="text-center py-12 text-neutral-400">
                    <p className="text-[14px]">暂无任务队列</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
