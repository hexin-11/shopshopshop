import {
  ArrowUpRight,
  Clapperboard,
  Clock3,
  Package,
  TrendingUp,
  FileVideo,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardMetrics, jobs, platformPerformance, catalog } from "../data/mockData";
import { api } from "../lib/api";

export default function DashboardPage({
  navigate,
}: {
  navigate: (r: "projects" | "products") => void;
}) {
  const [dashboard, setDashboard] = useState({
    metrics: [...dashboardMetrics] as any[],
    activeJobs: jobs.filter((j) => j.type === "generating") as any[],
    recentProducts: [...catalog.slice(0, 5)] as any[],
    platformPerformance: [...platformPerformance] as any[],
  });

  useEffect(() => {
    api.dashboard().then((next) =>
      setDashboard({
        metrics: [...(next.metrics || [])],
        activeJobs: [...(next.activeJobs || [])],
        recentProducts: [...(next.recentProducts || [])],
        platformPerformance: [...(next.platformPerformance || [])],
      })
    );
  }, []);

  const activeJobs = dashboard.activeJobs;

  return (
    <div className="flex flex-col gap-10 animate-fade-in mx-auto w-full">
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
          )
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
                className="animate-slide-up-card rounded-xl border border-[#E5E7EB] bg-neutral-50 p-6 transition-colors hover:bg-neutral-100"
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
                  <span className="badge">{job.stage}</span>
                </div>
                {/* 进度条 */}
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-[14px] text-[#171719]/60">
                    <span>渲染进度</span>
                    <span className="font-bold text-[#171719]">{job.progress}%</span>
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
                onClick={() => navigate("products")}
                className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-neutral-50"
              >
                <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center text-xl grayscale border border-[#E5E7EB]">
                  📦
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-bold text-[#171719]">{prod.name}</p>
                  <p className="mt-0.5 text-[13px] text-[#171719]/40">
                    {prod.scriptCount} 脚本 · {prod.projectCount} 项目
                  </p>
                </div>
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
          {dashboard.platformPerformance.map((platform, pi) => (
            <div
              key={platform.platform}
              style={{ animationDelay: `${360 + pi * 60}ms` }}
              className="animate-slide-up-card rounded-xl border border-[#E5E7EB] bg-neutral-50 p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[17px] font-bold text-[#171719]">{platform.platform}</p>
                  <p className="mt-1 text-[13px] text-[#171719]/50">
                    {platform.views} 播放 · {platform.conversion} 转化
                  </p>
                </div>
              </div>
              <svg viewBox="0 0 240 64" className="h-16 w-full overflow-visible">
                <defs>
                  <linearGradient id={`grad-${pi}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4684EE" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4684EE" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points={[
                    ...platform.series.map((v, i) => `${i * 40},${64 - v * 0.64}`),
                    `${(platform.series.length - 1) * 40},64`,
                    "0,64",
                  ].join(" ")}
                  fill={`url(#grad-${pi})`}
                />
                <polyline
                  points={platform.series
                    .map((v, i) => `${i * 40},${64 - v * 0.64}`)
                    .join(" ")}
                  fill="none"
                  stroke="#4684EE"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {platform.series.map((v, i) => (
                  <circle
                    key={i}
                    cx={i * 40}
                    cy={64 - v * 0.64}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#4684EE"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
