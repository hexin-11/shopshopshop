import { Boxes, CheckCircle2, Clock3, FileVideo, Timer } from "lucide-react";
import StatCard from "../components/StatCard";
import ProjectTable from "../components/ProjectTable";
import VideoPreviewCard from "../components/VideoPreviewCard";
import TaskProgressCard from "../components/TaskProgressCard";
import { activeWorkflows, dashboardMetrics, platformPerformance } from "../data/mockData";

export default function DashboardPage({ navigate }: { navigate: (r: "projects" | "analytics") => void }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-brand-100 bg-gradient-to-r from-white to-brand-50 p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">欢迎回来，开始创建你的带货视频</h1>
            <p className="mt-2 text-slate-600">上传商品素材，生成脚本，编辑分镜，并快速导出短视频。</p>
          </div>
          <button onClick={() => navigate("projects")} className="btn-primary">新建视频</button>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="视频项目" value="128" icon={FileVideo} />
        <StatCard label="素材数量" value="542" icon={Boxes} />
        <StatCard label="进行中任务" value="6" icon={Clock3} />
        <StatCard label="平均生成时间" value="3m 42s" icon={Timer} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} onClick={() => navigate("analytics")} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        {activeWorkflows.length > 0 && <section className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">正在进行的流程</h2>
            <button onClick={() => navigate("projects")} className="text-sm font-medium text-brand-600">继续创建</button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {activeWorkflows.map((item, index) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">步骤 {index + 1}</span>
                  <CheckCircle2 size={17} className={item.done ? "text-emerald-500" : "text-slate-300"} />
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>}
        <section className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-900">平台发布概览</h2>
          <div className="flex flex-col gap-3">
            {platformPerformance.map((platform) => (
              <div key={platform.platform} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: platform.color }}>{platform.logo}</div>
                  <div>
                  <p className="font-medium text-slate-900">{platform.platform}</p>
                  <p className="text-xs text-slate-500">{platform.views} 播放</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand-700">{platform.conversion}</p>
                  <p className="text-xs text-slate-500">转化率</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <ProjectTable />
        <aside className="space-y-6">
          <VideoPreviewCard />
          <TaskProgressCard />
          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-slate-900">团队动态</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>李明修改了镜头 2 的字幕</p>
              <p>王艺上传了 3 张商品图</p>
              <p>何鑫评论了脚本版本 v2</p>
            </div>
          </div>
        </aside>
      </div>
      <section className="card p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">多平台表现</h2>
            <p className="mt-1 text-sm text-slate-500">横向对比 TikTok、YouTube 与 Instagram 的播放趋势。</p>
          </div>
          <button onClick={() => navigate("analytics")} className="btn-secondary">查看详细分析</button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {platformPerformance.map((platform) => (
            <div key={platform.platform} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: platform.color }}>{platform.logo}</div>
                  <div>
                    <p className="font-semibold text-slate-900">{platform.platform}</p>
                    <p className="text-xs text-slate-500">{platform.views} 播放 · {platform.conversion} 转化</p>
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 240 96" className="h-24 w-full overflow-visible">
                <polyline points="0,82 40,68 80,74 120,50 160,36 200,26 240,18" fill="none" stroke="#CBD5E1" strokeWidth="2" />
                <polyline points={platform.series.map((value, index) => `${index * 40},${96 - value}`).join(" ")} fill="none" stroke={platform.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
