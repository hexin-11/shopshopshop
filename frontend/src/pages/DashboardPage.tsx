import {
  ArrowUpRight,
  Clapperboard,
  Clock3,
  Package,
  TrendingUp,
  Zap,
  X,
  Pause,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardMetrics, jobs, platformPerformance, catalog } from "../data/mockData";
import { api } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

export default function DashboardPage({
  navigate,
  selectProduct,
}: {
  navigate: (r: "projects" | "products") => void;
  selectProduct: (id: string) => void;
}) {
  const [dashboard, setDashboard] = useState({
    metrics: [...dashboardMetrics] as any[],
    activeJobs: jobs.filter((j) => j.type === "generating") as any[],
    recentProducts: [...catalog.slice(0, 5)] as any[],
    platformPerformance: [...platformPerformance] as any[],
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchDashboardData = () => {
    api.dashboard().then((next) =>
      setDashboard({
        metrics: [...(next.metrics || [])],
        activeJobs: [...(next.activeJobs || [])],
        recentProducts: [...(next.recentProducts || [])],
        platformPerformance: [...(next.platformPerformance || [])],
      })
    );
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeJobs = dashboard.activeJobs;

  return (
    <div className="flex flex-col gap-10 animate-fade-in mx-auto w-full">
      {/* 头部展示区 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E5E7EB] pb-8">
        <div className="text-left">
          <h1 className="text-[32px] font-[900] text-[#171719] tracking-tight">你好，欢迎回来</h1>
          <p className="mt-2 text-[16px] text-[#171719]/60">一站式管理视频内容分发、生产进度与商品库。</p>
        </div>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("shopclip:openVideoCreation", { detail: { productId: "" } }));
          }}
          className="btn-primary flex items-center gap-2 px-5 py-3 rounded-xl shadow-[0_4px_12px_rgba(70,132,238,0.15)] hover:shadow-[0_6px_16px_rgba(70,132,238,0.25)] transition-all shrink-0"
        >
          <Zap size={18} /> AI 创作视频
        </button>
      </div>

      {/* ── 核心指标 ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-4 text-left">
        {dashboard.metrics.map((m, i) => {
          return (
            <button
              key={m.label}
              onClick={() => navigate("projects")}
              style={{ animationDelay: `${i * 55}ms` }}
              className="card card-hover p-8 animate-slide-up-card flex flex-col justify-between h-[180px]"
            >
              <p className="text-[16px] font-medium text-[#171719]/60">{m.label}</p>
              <div>
                <p className="text-[40px] font-bold tabular-nums tracking-tighter text-[#171719]">
                  {m.value}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[15px] font-medium text-[#171719]/40">
                  <TrendingUp size={16} className="text-[#27AE60]" />
                  <span className="text-[#27AE60]">{m.delta}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 主 Bento ─────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr] text-left">
        {/* 左：渲染任务 */}
        <div
          className="card animate-slide-up-card p-8"
          style={{ animationDelay: "180ms" }}
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="h2-siter flex items-center gap-3">
              <Zap size={24} className="text-[#4684EE]" />
              正在渲染
            </h2>
            <button
              onClick={() => navigate("projects")}
              className="btn-ghost"
            >
              全部任务 <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {activeJobs.map((job, i) => (
              <div
                key={job.id}
                style={{ animationDelay: `${220 + i * 60}ms` }}
                className="animate-slide-up-card rounded-xl border border-[#E5E7EB] bg-neutral-50 p-6 transition-colors hover:bg-neutral-100/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="relative mt-1.5 flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4684EE] opacity-80" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4684EE]" />
                    </span>
                    <div>
                      <p className="text-[17px] font-bold text-[#171719]">{job.name}</p>
                      <p className="mt-1 text-[14px] text-[#171719]/50">{job.project}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="badge">{job.stage}</span>
                    <button
                      onClick={() => {
                        // 模拟取消任务
                        api.jobs().then((items) => {
                          const next = (items as any[]).map((j) =>
                            j.id === job.id ? { ...j, type: "queued", stage: "排队中", progress: 0 } : j
                          );
                          // 这里模拟API更新后重新拉取
                          setDashboard(prev => ({
                            ...prev,
                            activeJobs: next.filter(x => x.type === "generating")
                          }));
                        });
                      }}
                      className="text-[12px] font-bold text-red-500 hover:bg-red-50 px-2.5 py-1 rounded transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
                {/* 进度条 */}
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-[14px] text-[#171719]/60">
                    <span>渲染进度</span>
                    <span className="font-bold text-[#171719] font-mono">{job.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full bg-[#4684EE] transition-all duration-700"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {activeJobs.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <Clock3 size={32} className="text-[#171719]/20" />
                <p className="text-[16px] text-[#171719]/50">暂无正在进行的渲染任务</p>
              </div>
            )}
          </div>
        </div>

        {/* 右：近期商品 */}
        <div className="card animate-slide-up-card flex flex-col p-8" style={{ animationDelay: "270ms" }}>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="h2-siter flex items-center gap-3">
              <Package size={24} className="text-[#171719]/40" />
              近期商品
            </h2>
            <button
              onClick={() => navigate("products")}
              className="btn-ghost"
            >
              全部 <ArrowUpRight size={16} />
            </button>
          </div>
          
          <div className="space-y-3 flex-1">
            {dashboard.recentProducts.map((prod) => (
              <button
                key={prod.id}
                onClick={() => selectProduct(prod.id)}
                className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-neutral-50 border border-transparent hover:border-neutral-100 group"
              >
                <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-50 flex items-center justify-center text-xl border border-[#E5E7EB] overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                  {prod.mainImage ? (
                    <img src={prod.mainImage} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    "📦"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-bold text-[#171719] group-hover:text-[#4684EE] transition-colors">{prod.name}</p>
                  <p className="mt-0.5 text-[13px] text-[#171719]/40">
                    {prod.scriptCount} 脚本 · {prod.projectCount} 项目
                  </p>
                </div>
                <ArrowUpRight size={14} className="text-neutral-300 group-hover:text-[#4684EE] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 底部：平台趋势 ─────────────────────────────────────── */}
      <div
        className="card animate-slide-up-card p-8 text-left max-w-none"
        style={{ animationDelay: "320ms" }}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="h2-siter">全网分发表现</h2>
          <button
            onClick={() => navigate("projects")}
            className="btn-secondary"
          >
            <Clapperboard size={18} />
            所有视频
          </button>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {dashboard.platformPerformance.map((platform, pi) => {
            const chartData = platform.series.map((val, idx) => ({
              name: `Day ${idx + 1}`,
              value: val,
            }));

            return (
              <div
                key={platform.platform}
                style={{ animationDelay: `${360 + pi * 60}ms` }}
                className="animate-slide-up-card rounded-xl border border-[#E5E7EB] bg-neutral-50 p-6 flex flex-col justify-between"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[17px] font-bold text-[#171719]">{platform.platform}</p>
                    <p className="mt-1 text-[13px] text-[#171719]/50">
                      {platform.views} 播放 · {platform.conversion} 转化
                    </p>
                  </div>
                </div>
                
                {/* 替换原手绘 SVG 曲线，采用 Recharts 交互图表 */}
                <div className="h-[90px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <defs>
                        <linearGradient id={`gradValue-${pi}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4684EE" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#4684EE" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-neutral-900 text-white text-[12px] px-2 py-1 rounded shadow-md font-mono border border-neutral-800">
                                {payload[0].value}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4684EE"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill={`url(#gradValue-${pi})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 快速选择商品制作视频弹窗 */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-4">
                <h3 className="text-[18px] font-bold text-[#171719]">选择制作视频的商品</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {catalog.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      selectProduct(prod.id);
                    }}
                    className="flex w-full items-center gap-4 rounded-xl border border-neutral-100 p-3 text-left transition-all hover:border-[#4684EE] hover:bg-blue-50/20 group"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-50 flex items-center justify-center border border-[#E5E7EB] text-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      {prod.mainImage ? (
                        <img src={prod.mainImage} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#171719] truncate group-hover:text-[#4684EE] transition-colors">{prod.name}</p>
                      <p className="text-[12px] text-[#171719]/40 mt-0.5">{prod.brand} · {prod.category}</p>
                    </div>
                    <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-[#4684EE] transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
