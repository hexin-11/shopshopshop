import { ArrowLeft, Bell, Captions, Clapperboard, History, ListChecks, MessageSquare, Play, Share2, Users } from "lucide-react";
import { useState } from "react";
import CommentPanel from "../components/CommentPanel";
import MemberAvatarGroup from "../components/MemberAvatarGroup";
import SceneCard from "../components/SceneCard";
import TaskQueuePanel from "../components/TaskQueuePanel";
import Timeline from "../components/Timeline";
import { members, projects, scenes, versions } from "../data/mockData";

export default function ProjectWorkspacePage({ navigate }: { navigate: (route: "projects" | "analytics") => void }) {
  const projectId = window.location.pathname.split("/").pop() ?? "p-earphone";
  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const [sceneId, setSceneId] = useState(scenes[0].id);
  const [panel, setPanel] = useState<"scene" | "collab" | "comments" | "history">("scene");
  const [queueOpen, setQueueOpen] = useState(false);
  const isShared = project.visibility !== "Private";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => navigate("projects")} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="返回项目列表"><ArrowLeft size={18} /></button>
          <div className="min-w-0">
            <h1 className="truncate font-semibold">{project.name}</h1>
            <p className="text-xs text-slate-400">{project.product} · {project.visibility === "Private" ? "私密" : "公开协作"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setQueueOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"><ListChecks size={16} />任务队列</button>
          <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><Bell size={18} /></button>
          <MemberAvatarGroup limit={4} />
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"><Share2 size={16} />邀请协作</button>
        </div>
      </header>
      <main className="grid h-[calc(100vh-64px)] grid-cols-[300px_1fr_360px] overflow-hidden">
        <aside className="flex flex-col border-r border-white/10 bg-slate-900/70">
          <div className="border-b border-white/10 p-4">
            <h2 className="font-semibold">分镜列表</h2>
            <p className="mt-1 text-xs text-slate-400">选择镜头后可编辑字幕、音频和素材。</p>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {scenes.map((scene) => <SceneCard key={scene.id} scene={scene} active={scene.id === sceneId} onClick={() => setSceneId(scene.id)} />)}
          </div>
        </aside>
        <section className="flex flex-col overflow-hidden bg-slate-950">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clapperboard size={16} />
              创作编辑空间
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">保存草稿</button>
              <button className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-950">生成视频</button>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            <div className="mx-auto flex aspect-[9/16] max-h-[480px] w-[270px] flex-col justify-end rounded-2xl bg-gradient-to-b from-slate-700 via-slate-800 to-brand-700 p-5 shadow-2xl">
              <div className="rounded-xl bg-black/30 p-4 text-center backdrop-blur">
                <p className="text-lg font-semibold">沉浸音效，全天在线</p>
                <p className="mt-1 text-sm text-slate-200">主动降噪头戴式耳机</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium"><Play size={16} />播放</button>
              <span className="text-sm text-slate-400">00:05 / 00:27</span>
              <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300">9:16</button>
              <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300">16:9</button>
              <button className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300">1:1</button>
            </div>
            <div className="text-slate-950"><Timeline /></div>
          </div>
        </section>
        <aside className="flex flex-col border-l border-white/10 bg-slate-900/70">
          <div className="grid grid-cols-4 border-b border-white/10 p-2">
            {[
              ["scene", Captions, "镜头"],
              ["collab", Users, "协作"],
              ["comments", MessageSquare, "评论"],
              ["history", History, "版本"]
            ].map(([key, Icon, label]) => {
              const I = Icon as typeof Captions;
              return <button key={key as string} onClick={() => setPanel(key as "scene" | "collab" | "comments" | "history")} className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs ${panel === key ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/10"}`}><I size={16} />{label as string}</button>;
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {panel === "scene" && <div className="flex flex-col gap-4">
              <label><span className="text-sm text-slate-300">镜头名称</span><input className="input mt-1 text-slate-900" defaultValue={`镜头 ${sceneId}：${scenes.find((scene) => scene.id === sceneId)?.title}`} /></label>
              <label><span className="text-sm text-slate-300">字幕内容</span><textarea className="input mt-1 min-h-24 text-slate-900" defaultValue="沉浸音效，全天在线" /></label>
              <label><span className="text-sm text-slate-300">镜头运动</span><select className="input mt-1 text-slate-900"><option>平稳推进</option><option>产品环绕</option><option>快速切换</option></select></label>
              <button className="btn-primary">应用修改</button>
            </div>}
            {panel === "collab" && <div className="flex flex-col gap-3">
              <h2 className="font-semibold">协作空间</h2>
              {!isShared && <div className="rounded-lg border border-amber-300/40 bg-amber-500/10 p-3 text-sm text-amber-100">当前为私密项目，切换为公开协作后可邀请成员同步编辑。</div>}
              {members.map((member) => <div key={member.name} className="rounded-lg border border-white/10 bg-white/5 p-3"><p className="font-medium">{member.name}</p><p className="mt-1 text-sm text-slate-400">{member.role} · {member.online ? "在线" : "离线"} · {member.editing}</p></div>)}
            </div>}
            {panel === "comments" && <div className="text-slate-950"><CommentPanel /></div>}
            {panel === "history" && <div className="flex flex-col gap-3">{versions.map((version) => <div key={version.name} className="rounded-lg border border-white/10 bg-white/5 p-3"><p className="font-medium">{version.name}</p><p className="mt-1 text-sm text-slate-400">{version.author} · {version.time}</p><p className="mt-2 text-sm text-slate-300">{version.note}</p></div>)}</div>}
          </div>
        </aside>
      </main>
      <TaskQueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />
    </div>
  );
}
