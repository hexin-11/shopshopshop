import { ChevronDown, ChevronRight, TerminalSquare, X } from "lucide-react";
import { useMemo, useState } from "react";
import { jobs } from "../data/mockData";
import StatusBadge from "./StatusBadge";

export default function TaskQueuePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"generating" | "history">("generating");
  const [expanded, setExpanded] = useState<string>(jobs[0].id);
  const visibleJobs = useMemo(() => jobs.filter((job) => job.type === tab), [tab]);

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 z-50 flex h-screen w-full justify-end bg-slate-900/20">
      <aside className="h-full w-full max-w-xl border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">任务队列</h2>
            <p className="text-sm text-slate-500">查看生成任务与 Trace 终端日志。</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="关闭任务队列"><X size={18} /></button>
        </div>
        <div className="border-b border-slate-200 px-5 py-3">
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {[
              ["generating", "正在生成"],
              ["history", "历史生成"]
            ].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as "generating" | "history")} className={`rounded-md px-4 py-2 text-sm font-medium ${tab === key ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex h-[calc(100vh-132px)] flex-col gap-3 overflow-y-auto p-5">
          {visibleJobs.map((job) => {
            const isExpanded = expanded === job.id;
            return (
              <div key={job.id} className="rounded-lg border border-slate-200 bg-white">
                <button onClick={() => setExpanded(isExpanded ? "" : job.id)} className="flex w-full items-center justify-between gap-4 p-4 text-left">
                  <div className="flex min-w-0 items-center gap-3">
                    {isExpanded ? <ChevronDown className="text-slate-400" size={17} /> : <ChevronRight className="text-slate-400" size={17} />}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{job.name}</p>
                      <p className="text-sm text-slate-500">{job.stage} · {job.progress}%</p>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </button>
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-950 p-4 font-mono text-xs text-emerald-300">
                    <div className="mb-3 flex items-center gap-2 text-slate-300"><TerminalSquare size={15} />Trace Terminal</div>
                    <div className="flex flex-col gap-2">
                      {job.trace.map((line) => <p key={line}>$ {line}</p>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
