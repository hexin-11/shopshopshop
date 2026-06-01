import {
  Clapperboard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  Lock,
  Plus,
  Share2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { jobs, projects } from "../data/mockData";
import { api } from "../lib/api";

export default function VideoProjectsPage({ openProject }: { openProject: (id: string) => void }) {
  const [projectList, setProjectList] = useState<any[]>([...projects]);
  const [jobList, setJobList] = useState<any[]>([...jobs]);

  useEffect(() => {
    api.projects().then((items) => setProjectList(items as any[]));
    api.jobs().then((items) => setJobList(items as any[]));
  }, []);

  const activeJobs = jobList.filter((j) => j.type === "generating");

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-6xl mx-auto">
      {/* 标题 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[#171719] tracking-tight">视频项目</h1>
          <p className="mt-2 text-[16px] text-[#171719]/60">管理所有生成任务进度与团队协作。</p>
        </div>
        <button onClick={() => openProject("p-new")} className="btn-primary">
          <Plus size={18} />
          新建项目
        </button>
      </div>

      {/* ── 正在生成 ──────────────────────────────────────────────────── */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-6 items-center justify-center rounded-full bg-[#4684EE]/10">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#4684EE]" />
          </div>
          <h2 className="h2-siter text-[24px] sm:text-[28px]">正在生成</h2>
          <span className="badge ml-2">
            {activeJobs.length} 个任务
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {activeJobs.map((job) => (
            <div key={job.id} className="card p-8">
              <div className="flex items-start gap-6">
                <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-neutral-50">
                  <Clapperboard size={20} className="text-[#4684EE]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[18px] font-bold text-[#171719]">{job.name}</p>
                      <p className="mt-1 text-[14px] text-[#171719]/50">{job.project} · {job.creator}</p>
                    </div>
                    <span className="text-[14px] font-medium text-[#4684EE]">{job.stage}</span>
                  </div>
                  {/* 进度条 */}
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-[14px] text-[#171719]/50">
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
                  {/* 日志 */}
                  <div className="mt-6 rounded-lg bg-neutral-50 border border-[#E5E7EB] p-4">
                    {job.trace.slice(-2).map((line, i) => (
                      <p key={i} className="text-[13px] text-[#171719]/50 leading-loose">
                        <span className="mr-2 text-[#171719]/30">›</span>{line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {activeJobs.length === 0 && (
            <div className="card flex flex-col items-center gap-4 py-20 text-center">
              <Clapperboard size={40} className="text-[#171719]/20" />
              <p className="text-[16px] font-medium text-[#171719]/50">暂无进行中的生成任务</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 项目卡片列表 ─────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-6 h2-siter text-[24px] sm:text-[28px]">所有项目</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          {projectList.map((project) => (
            <button
              key={project.id}
              onClick={() => openProject(project.id)}
              className="card p-8 text-left transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[20px] font-bold text-[#171719]">{project.name}</h3>
                  <p className="mt-1.5 text-[14px] text-[#171719]/50">{project.product} · {project.ratio} · {project.updated}</p>
                </div>
                <div className="badge bg-neutral-50 text-[#171719]/70 border border-[#E5E7EB]">
                  {project.status === "已完成" ? <CheckCircle2 size={14} className="text-[#27AE60]"/> : <Clock3 size={14} className="text-[#171719]/40" />}
                  {project.status}
                </div>
              </div>
              <div className="mt-8">
                <div className="mb-2 flex justify-between text-[14px] text-[#171719]/50">
                  <span>项目进度</span>
                  <span className="text-[#171719] font-bold">{project.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full bg-[#27AE60] transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[#E5E7EB] pt-5 text-[14px] font-medium text-[#171719]/50">
                <div className="flex items-center gap-2">
                  {project.visibility === "Private" ? <Lock size={16} /> : <Share2 size={16} />}
                  {project.visibility === "Private" ? "私密" : "公开协作"}
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
    </div>
  );
}
