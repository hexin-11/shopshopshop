import { ArrowLeft, CheckCircle2, Clapperboard, Download, Film, Lock, Play, Plus, Share2, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { projects } from "../data/mockData";
import { api } from "../lib/api";
import { AnimatePresence, motion } from "framer-motion";

const workStatusLabels: Record<string, string> = {
  已完成: "已发布",
  "渲染中 60%": "制作中",
  待审核: "待审核",
  排队中: "草稿",
};

const statusStyles: Record<string, string> = {
  已发布: "border-emerald-200 bg-emerald-50 text-emerald-700",
  制作中: "border-neutral-200 bg-neutral-100 text-neutral-700",
  待审核: "border-amber-200 bg-amber-50 text-amber-700",
  草稿: "border-neutral-200 bg-white text-neutral-500",
};

function getWorkStatus(project: any) {
  return project.workStatus || project.publishStatus || workStatusLabels[project.status] || "草稿";
}

export default function VideoProjectsPage({ openProject }: { openProject: (id: string) => void }) {
  const [projectList, setProjectList] = useState<any[]>([...projects]);
  const [previewProject, setPreviewProject] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState("全部");

  useEffect(() => {
    api.projects().then((items) => setProjectList(items as any[]));
  }, []);

  const works = useMemo(
    () =>
      projectList.map((project, index) => ({
        ...project,
        workStatus: getWorkStatus(project),
        thumbnail:
          project.thumbnail ||
          [
            "https://picsum.photos/seed/tikframe-earphone/720/1080",
            "https://picsum.photos/seed/tikframe-serum/720/1080",
            "https://picsum.photos/seed/tikframe-bottle/720/1080",
            "https://picsum.photos/seed/tikframe-shoes/720/1080",
          ][index % 4],
        channel: project.ratio === "16:9" ? "YouTube" : project.ratio === "1:1" ? "Instagram" : "TikTok",
      })),
    [projectList],
  );

  const filters = useMemo(() => ["全部", ...Array.from(new Set(works.map((work) => work.workStatus)))], [works]);
  const filteredWorks = statusFilter === "全部" ? works : works.filter((work) => work.workStatus === statusFilter);

  const openCreation = () => {
    window.dispatchEvent(new CustomEvent("tikframe:openVideoCreation", { detail: { productId: "" } }));
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 animate-fade-in">
      <section className="flex flex-col gap-5 border-b border-neutral-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="text-left">
          <p className="text-sm font-semibold text-neutral-500">作品库</p>
          <h1 className="mt-2 text-[32px] font-black tracking-tight text-neutral-950">视频作品</h1>
          <p className="mt-2 max-w-[620px] text-base text-neutral-500">
            这里展示已经形成作品形态的视频。生成进度和失败重试请在右上角任务托盘查看。
          </p>
        </div>
        <button onClick={openCreation} className="btn-primary shrink-0">
          <Plus size={18} />
          AI 创作视频
        </button>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-1">
          <SlidersHorizontal size={16} className="ml-3 text-neutral-400" />
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                statusFilter === filter ? "bg-neutral-950 text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <p className="text-sm font-medium text-neutral-500">{filteredWorks.length} 条作品</p>
      </div>

      {filteredWorks.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredWorks.map((work) => (
            <article key={work.id} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition-transform hover:-translate-y-0.5">
              <button onClick={() => setPreviewProject(work)} className="block w-full text-left">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <img src={work.thumbnail} alt={work.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${statusStyles[work.workStatus] || statusStyles["草稿"]}`}>
                      {work.workStatus}
                    </span>
                    <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-neutral-700 backdrop-blur">
                      {work.ratio}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/0 opacity-0 transition group-hover:bg-neutral-950/20 group-hover:opacity-100">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-950 shadow-sm">
                      <Play size={20} fill="currentColor" />
                    </span>
                  </div>
                </div>
              </button>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-neutral-950">{work.name}</h2>
                    <p className="mt-1 truncate text-sm text-neutral-500">
                      {work.product} · {work.channel} · {work.updated}
                    </p>
                  </div>
                  {work.visibility === "Private" ? (
                    <Lock size={17} className="mt-1 shrink-0 text-neutral-400" />
                  ) : (
                    <Share2 size={17} className="mt-1 shrink-0 text-neutral-400" />
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4">
                  <div>
                    <p className="text-xs text-neutral-400">播放</p>
                    <p className="mt-1 text-sm font-bold text-neutral-900">{work.views || "12.8K"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">转化</p>
                    <p className="mt-1 text-sm font-bold text-neutral-900">{work.conversion || "3.4%"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">负责人</p>
                    <p className="mt-1 truncate text-sm font-bold text-neutral-900">{work.owner}</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button onClick={() => setPreviewProject(work)} className="btn-secondary flex-1 justify-center">
                    <Film size={16} />
                    预览
                  </button>
                  <button onClick={() => openProject(work.id)} className="btn-ghost flex-1 justify-center">
                    精剪
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-20 text-center">
          <Clapperboard size={36} className="mx-auto text-neutral-300" />
          <p className="mt-4 text-lg font-bold text-neutral-950">暂无对应作品</p>
          <p className="mt-2 text-sm text-neutral-500">切换筛选条件，或从 Agent 创建一条新视频。</p>
          <button onClick={openCreation} className="btn-primary mx-auto mt-6">
            <Plus size={18} />
            AI 创作视频
          </button>
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {previewProject && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewProject(null)}
                className="absolute inset-0 bg-neutral-950"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 p-6 sticky top-0 bg-white z-10">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-black text-neutral-950">{previewProject.name}</h3>
                    <p className="mt-1 truncate text-sm text-neutral-500">
                      {previewProject.product} · {previewProject.ratio} · {previewProject.updated}
                    </p>
                  </div>
                  <button onClick={() => setPreviewProject(null)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700" aria-label="返回">
                    <ArrowLeft size={16} />
                    返回
                  </button>
                </div>

                <div className="grid gap-0 md:grid-cols-[320px_1fr]">
                  <div className="bg-neutral-950 p-6">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-holding-headphones-40054-large.mp4"
                      controls
                      className="mx-auto aspect-[9/16] max-h-[520px] w-full rounded-xl object-cover"
                      poster={previewProject.thumbnail}
                    />
                  </div>

                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${statusStyles[previewProject.workStatus] || statusStyles["草稿"]}`}>
                        {previewProject.workStatus}
                      </span>
                      <div className="mt-6 grid grid-cols-3 gap-4">
                        {[
                          ["播放量", previewProject.views || "12.8K"],
                          ["转化率", previewProject.conversion || "3.4%"],
                          ["渠道", previewProject.channel],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                            <p className="text-xs font-medium text-neutral-500">{label}</p>
                            <p className="mt-2 text-lg font-black text-neutral-950">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 space-y-2">
                      <button className="btn-primary w-full justify-center">
                        <Download size={18} />
                        下载 MP4
                      </button>
                      <button onClick={() => openProject(previewProject.id)} className="btn-secondary w-full justify-center">
                        <CheckCircle2 size={18} />
                        进入精剪
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
