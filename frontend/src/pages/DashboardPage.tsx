import { ArrowUpRight, BarChart3, Clapperboard, Package, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { catalog, dashboardMetrics, platformPerformance, projects } from "../data/mockData";
import { api } from "../lib/api";

export default function DashboardPage({
  navigate,
  selectProduct,
}: {
  navigate: (r: "projects" | "products") => void;
  selectProduct: (id: string) => void;
}) {
  const [dashboard, setDashboard] = useState({
    metrics: [...dashboardMetrics] as any[],
    recentProducts: [...catalog.slice(0, 4)] as any[],
    featuredProjects: [...projects.slice(0, 3)] as any[],
    platformPerformance: [...platformPerformance] as any[],
  });

  useEffect(() => {
    api.dashboard().then((next) =>
      setDashboard((prev) => ({
        metrics: [...(next.metrics || prev.metrics)],
        recentProducts: [...(next.recentProducts || prev.recentProducts)].slice(0, 4),
        featuredProjects: [...projects.slice(0, 3)],
        platformPerformance: [...(next.platformPerformance || prev.platformPerformance)],
      })),
    );
  }, []);

  const openCreation = () => {
    window.dispatchEvent(new CustomEvent("tikframe:openVideoCreation", { detail: { productId: "" } }));
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 animate-fade-in">
      <section className="grid gap-8 border-b border-neutral-200 pb-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="text-left">
          <p className="text-sm font-semibold text-neutral-500">TikFrame 工作台</p>
          <h1 className="mt-3 max-w-[720px] text-[34px] font-black leading-tight tracking-tight text-neutral-950">
            从商品素材开始，快速产出可发布的带货视频。
          </h1>
          <p className="mt-4 max-w-[620px] text-base leading-7 text-neutral-500">
            首页只保留经营概览和创作入口；生成任务进度统一在右上角任务托盘查看。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={openCreation} className="btn-primary">
              <Zap size={18} />
              AI 创作视频
            </button>
            <button onClick={() => navigate("products")} className="btn-secondary">
              <Package size={18} />
              管理商品
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-500">最近作品</p>
              <h2 className="mt-1 text-xl font-extrabold text-neutral-950">可继续优化的内容</h2>
            </div>
            <button onClick={() => navigate("projects")} className="btn-ghost">
              全部作品 <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="mt-5 divide-y divide-neutral-100">
            {dashboard.featuredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate("projects")}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-neutral-950">{project.name}</p>
                  <p className="mt-1 truncate text-sm text-neutral-500">
                    {project.product} · {project.ratio} · {project.updated}
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  {project.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 text-left lg:grid-cols-4">
        {dashboard.metrics.map((metric) => (
          <button
            key={metric.label}
            onClick={() => navigate("projects")}
            className="rounded-2xl border border-neutral-200 bg-white p-6 text-left transition-colors hover:bg-neutral-50"
          >
            <p className="text-sm font-medium text-neutral-500">{metric.label}</p>
            <p className="mt-5 text-3xl font-black tracking-tight text-neutral-950 tabular-nums">{metric.value}</p>
            <p className="mt-2 text-sm font-semibold text-emerald-600">{metric.delta}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-500">近期商品</p>
              <h2 className="mt-1 text-xl font-extrabold text-neutral-950">从商品继续创作</h2>
            </div>
            <button onClick={() => navigate("products")} className="btn-ghost">
              商品库 <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="space-y-2">
            {dashboard.recentProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => selectProduct(product.id)}
                className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-neutral-50"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                  {product.mainImage ? (
                    <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="m-3 text-neutral-400" size={24} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-neutral-950">{product.name}</p>
                  <p className="mt-1 truncate text-sm text-neutral-500">
                    {product.brand} · {product.category}
                  </p>
                </div>
                <span className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  {product.commerceStatus || product.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-500">作品表现摘要</p>
              <h2 className="mt-1 text-xl font-extrabold text-neutral-950">跨平台分发结果</h2>
            </div>
            <BarChart3 size={22} className="text-neutral-400" />
          </div>

          <div className="space-y-4">
            {dashboard.platformPerformance.map((platform) => (
              <div key={platform.platform} className="grid grid-cols-[110px_1fr_auto] items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white" style={{ backgroundColor: platform.color }}>
                    {platform.logo}
                  </span>
                  <span className="text-sm font-bold text-neutral-800">{platform.platform}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-neutral-900" style={{ width: `${Math.min(96, Math.max(24, platform.series.at(-1) || 0))}%` }} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-950">{platform.views}</p>
                  <p className="text-xs text-neutral-500">{platform.conversion}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => navigate("projects")} className="btn-secondary mt-7 w-full justify-center">
            <Clapperboard size={18} />
            查看作品列表
          </button>
        </div>
      </section>
    </div>
  );
}
