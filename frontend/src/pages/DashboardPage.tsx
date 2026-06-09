import { ArrowUpRight, BarChart3, Clapperboard, Loader2, Package, Zap } from "lucide-react";
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
  const [agentForm, setAgentForm] = useState({
    productName: "保湿粉底液",
    category: "美妆",
    sellingPoints: "保湿、不卡粉、持妆8小时",
    targetAudience: "20-30岁女性",
    useScene: "通勤、约会、日常上妆",
    tone: "自然生活化",
  });
  const [agentResult, setAgentResult] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");

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

  const updateAgentForm = (key: keyof typeof agentForm, value: string) => {
    setAgentForm((prev) => ({ ...prev, [key]: value }));
  };

  const runAgentGenerate = async () => {
    setAgentLoading(true);
    setAgentError("");
    setAgentResult(null);
    try {
      const result = await api.agentGenerate({
        productName: agentForm.productName,
        category: agentForm.category,
        sellingPoints: agentForm.sellingPoints
          .split(/[、,，\n]/)
          .map((item) => item.trim())
          .filter(Boolean),
        targetAudience: agentForm.targetAudience,
        platform: "小红书",
        duration: 30,
        tone: agentForm.tone,
        videoType: "口播带货",
        style: agentForm.tone,
        useScene: agentForm.useScene,
        resolution: "1080x1920",
      });
      setAgentResult(result.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setAgentError(
        message.includes("Failed to fetch") || message.includes("资源不存在") || message.includes("404")
          ? "无法调用 /api/agent/generate，请确认后端已启动，并且是包含 Agent 接口的最新版本。"
          : message || "无法连接后端，请确认后端已启动。",
      );
    } finally {
      setAgentLoading(false);
    }
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

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-neutral-500">Agent 一键生成联调</p>
            <h2 className="mt-1 text-xl font-extrabold text-neutral-950">电商带货视频生成</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              输入商品信息后，调用后端 <span className="font-semibold text-neutral-700">/api/agent/generate</span>，返回商品分析、脚本、分镜、视频 Prompt 和 mock 任务结果。
            </p>
          </div>
          <button onClick={runAgentGenerate} disabled={agentLoading || !agentForm.productName.trim()} className="btn-primary">
            {agentLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            一键生成带货视频
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <label className="grid gap-2">
            <span className="label">商品标题</span>
            <input className="input" value={agentForm.productName} onChange={(e) => updateAgentForm("productName", e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="label">类目</span>
            <input className="input" value={agentForm.category} onChange={(e) => updateAgentForm("category", e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="label">目标用户</span>
            <input className="input" value={agentForm.targetAudience} onChange={(e) => updateAgentForm("targetAudience", e.target.value)} />
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="label">卖点</span>
            <input className="input" value={agentForm.sellingPoints} onChange={(e) => updateAgentForm("sellingPoints", e.target.value)} placeholder="用顿号或逗号分隔" />
          </label>
          <label className="grid gap-2">
            <span className="label">风格语气</span>
            <input className="input" value={agentForm.tone} onChange={(e) => updateAgentForm("tone", e.target.value)} />
          </label>
          <label className="grid gap-2 lg:col-span-3">
            <span className="label">使用场景</span>
            <textarea className="input min-h-[88px] resize-y" value={agentForm.useScene} onChange={(e) => updateAgentForm("useScene", e.target.value)} />
          </label>
        </div>

        {agentError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {agentError.includes("Failed to fetch") ? "无法连接后端，请确认 backend 已启动并运行在 8787 端口。" : agentError}
          </div>
        )}

        {agentResult && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-black text-neutral-950">商品分析</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{(agentResult.productAnalysis || agentResult.analysis)?.coreValue}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {((agentResult.productAnalysis || agentResult.analysis)?.mainSellingPoints || []).map((point: string) => (
                  <span key={point} className="badge">{point}</span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-black text-neutral-950">带货剧本</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{agentResult.script?.fullVoiceover || agentResult.script?.hook}</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-black text-neutral-950">分镜列表</p>
              <div className="mt-3 space-y-3">
                {(agentResult.storyboard || []).map((shot: any) => (
                  <div key={shot.shotId} className="rounded-lg bg-white p-3 text-sm">
                    <p className="font-bold text-neutral-900">#{shot.shotId} {shot.scene} · {shot.duration}s</p>
                    <p className="mt-1 text-neutral-500">{shot.visual}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-black text-neutral-950">视频 Prompt</p>
              <div className="mt-3 space-y-3">
                {(agentResult.videoPrompts || []).slice(0, 3).map((prompt: any) => (
                  <div key={prompt.shotId} className="rounded-lg bg-white p-3 text-sm">
                    <p className="font-bold text-neutral-900">镜头 {prompt.shotId} · {prompt.aspectRatio}</p>
                    <p className="mt-1 line-clamp-3 text-neutral-500">{prompt.prompt}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 lg:col-span-2">
              <p className="text-sm font-black text-neutral-950">任务结果</p>
              <div className="mt-3 grid gap-3 text-sm text-neutral-600 sm:grid-cols-3">
                <div><span className="font-bold text-neutral-900">任务 ID：</span>{agentResult.taskId}</div>
                <div><span className="font-bold text-neutral-900">任务状态：</span>{agentResult.taskStatus}</div>
                <div>
                  <span className="font-bold text-neutral-900">mock 预览：</span>
                  {agentResult.previewUrl || agentResult.mockVideoUrl || agentResult.previewResult?.previewUrl}
                </div>
              </div>
            </div>
          </div>
        )}
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
