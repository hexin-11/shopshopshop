import { Copy, Magnet, Minus, Plus, Redo2, Scissors, Trash2, Undo2, type LucideIcon } from "lucide-react";

const tracks = [
  { name: "视频轨道", color: "bg-brand-500", blocks: ["w-32", "w-40", "w-36", "w-28", "w-24"] },
  { name: "字幕轨道", color: "bg-indigo-300", blocks: ["w-36", "w-28", "w-44", "w-32"] },
  { name: "旁白轨道", color: "bg-emerald-300", blocks: ["w-44", "w-48", "w-40"] },
  { name: "BGM 轨道", color: "bg-amber-300", blocks: ["w-[420px]"] },
  { name: "贴纸 / 标注轨道", color: "bg-violet-300", blocks: ["w-24", "w-28"] }
];

export default function Timeline() {
  const tools: Array<[string, LucideIcon]> = [
    ["拆分", Scissors],
    ["删除", Trash2],
    ["复制", Copy],
    ["撤销", Undo2],
    ["重做", Redo2],
    ["吸附", Magnet],
    ["放大", Plus],
    ["缩小", Minus]
  ];

  return (
    <div className="card p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tools.map(([label, Icon]) => <button key={label} className="btn-secondary px-3 py-1.5"><Icon size={15} />{label}</button>)}
      </div>
      <div className="relative overflow-x-auto pb-2">
        <div className="absolute left-36 top-0 z-10 h-full w-0.5 bg-rose-500" />
        <div className="min-w-[760px] space-y-3">
          {tracks.map((track) => (
            <div key={track.name} className="grid grid-cols-[112px_1fr] items-center gap-3">
              <div className="text-xs font-medium text-slate-500">{track.name}</div>
              <div className="flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-2">
                {track.blocks.map((w, index) => (
                  <div key={index} className={`${w} ${track.color} h-6 rounded-md opacity-90 shadow-sm`}>
                    <div className="h-full w-2 rounded-l-md bg-white/40" />
                  </div>
                ))}
                {track.name === "旁白轨道" && <div className="flex gap-1">{Array.from({ length: 18 }).map((_, i) => <span key={i} className="block w-1 rounded bg-emerald-500/50" style={{ height: `${10 + (i % 5) * 3}px` }} />)}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
