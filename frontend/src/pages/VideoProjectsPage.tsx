import {
  CheckCircle2,
  Clock3,
  Lock,
  Plus,
  Share2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { projects } from "../data/mockData";
import { api } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoProjectsPage({ openProject }: { openProject: (id: string) => void }) {
  const [projectList, setProjectList] = useState<any[]>([...projects]);
  const [previewProject, setPreviewProject] = useState<any | null>(null);

  useEffect(() => {
    api.projects().then((items) => setProjectList(items as any[]));
  }, []);

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-6xl mx-auto w-full">
      {/* 标题 */}
      <div className="flex items-end justify-between border-b border-[#E5E7EB] pb-8">
        <div className="text-left">
          <h1 className="text-[32px] font-bold text-[#171719] tracking-tight">视频项目</h1>
          <p className="mt-2 text-[16px] text-[#171719]/60">浏览生成的视频历史、分发表现以及进行视频精剪。</p>
        </div>
        <button onClick={() => openProject("p-new")} className="btn-primary">
          <Plus size={18} />
          新建项目
        </button>
      </div>

      {/* ── 项目列表 ─────────────────────────────────────────────── */}
      <section>
        <div className="grid gap-6 xl:grid-cols-2 text-left">
          {projectList.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                if (project.status === "已完成") {
                  setPreviewProject(project);
                } else {
                  openProject(project.id);
                }
              }}
              className="card p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[20px] font-bold text-[#171719] group-hover:text-[#4684EE] transition-colors">
                    {project.name}
                  </h3>
                  <p className="mt-1.5 text-[14px] text-[#171719]/50">
                    {project.product} · {project.ratio} · {project.updated}
                  </p>
                </div>
                <div className="badge bg-neutral-50 text-[#171719]/70 border border-[#E5E7EB] shrink-0">
                  {project.status === "已完成" ? (
                    <CheckCircle2 size={14} className="text-[#27AE60]" />
                  ) : (
                    <Clock3 size={14} className="text-[#171719]/40" />
                  )}
                  {project.status}
                </div>
              </div>
              
              <div className="mt-8">
                <div className="mb-2 flex justify-between text-[14px] text-[#171719]/50">
                  <span>项目生成进度</span>
                  <span className="text-[#171719] font-bold font-mono">{project.progress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full bg-[#27AE60] transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-between border-t border-[#E5E7EB] pt-5 text-[14px] font-medium text-[#171719]/50">
                <div className="flex items-center gap-2">
                  {project.visibility === "Private" ? <Lock size={16} /> : <Share2 size={16} />}
                  <span>{project.visibility === "Private" ? "私密" : "公开协作"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>负责人：{project.owner}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 成品预览与分发面板 */}
      <AnimatePresence>
        {previewProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewProject(null)}
              className="fixed inset-0 z-55 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed left-1/2 top-1/2 z-55 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-6">
                <div>
                  <h3 className="text-[20px] font-bold text-[#171719]">{previewProject.name}</h3>
                  <p className="text-[13px] text-[#171719]/50 mt-1">{previewProject.product} · {previewProject.ratio} · {previewProject.updated}</p>
                </div>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 左边：模拟视频播放器 */}
                <div className="bg-black aspect-[9/16] rounded-xl overflow-hidden relative flex items-center justify-center shadow-inner max-h-[320px] mx-auto w-full max-w-[180px]">
                  <video
                    src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-holding-headphones-40054-large.mp4"
                    controls
                    className="w-full h-full object-cover"
                    poster="https://picsum.photos/seed/shopclip/400/700"
                  />
                </div>

                {/* 右边：分发操作 */}
                <div className="flex flex-col justify-between py-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">全渠道曝光表现</p>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-neutral-500">播放量</p>
                          <p className="text-[20px] font-extrabold text-[#171719] mt-0.5 font-mono">1.2M</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-neutral-500">转化率 (ROI)</p>
                          <p className="text-[20px] font-extrabold text-[#27AE60] mt-0.5 font-mono">4.8%</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          alert("成品视频已开始下载！");
                        }}
                        className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold"
                      >
                        下载成品视频 (MP4)
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("https://shopclip.ai/share/v-12345");
                          alert("分享链接已成功复制到剪贴板！");
                        }}
                        className="btn-secondary w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold"
                      >
                        复制分享链接
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPreviewProject(null);
                      openProject(previewProject.id);
                    }}
                    className="w-full py-3 text-[#4684EE] hover:bg-blue-50 font-bold rounded-xl transition-all border border-dashed border-[#4684EE]/30 hover:border-[#4684EE] text-center mt-6 block"
                  >
                    进入视频精剪 (Twick Editor) ›
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
