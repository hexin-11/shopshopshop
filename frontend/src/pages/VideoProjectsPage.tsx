import { Lock, Plus, Share2, Users } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MemberAvatarGroup from "../components/MemberAvatarGroup";
import StatusBadge from "../components/StatusBadge";
import { projects } from "../data/mockData";

export default function VideoProjectsPage({ openProject }: { openProject: (projectId: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="视频项目"
        description="管理商品短视频项目、权限、协作成员和编辑进度。"
        action={<button onClick={() => openProject("p-new")} className="btn-primary"><Plus size={16} />新建项目</button>}
      />
      <section className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <button key={project.id} onClick={() => openProject(project.id)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{project.product} · {project.ratio} · {project.updated}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {project.visibility === "Private" ? <Lock size={16} /> : <Share2 size={16} />}
                {project.visibility === "Private" ? "私密项目" : "公开协作"}
              </div>
              <MemberAvatarGroup limit={3} />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs text-slate-500">
                <span>项目进度</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${project.progress}%` }} /></div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <Users size={14} />
              负责人：{project.owner}
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
