import { MessageSquare } from "lucide-react";
import type { scenes } from "../data/mockData";

type Scene = (typeof scenes)[number];

export default function SceneCard({ scene, active, onClick }: { scene: Scene; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full rounded-lg border p-3 text-left transition ${active ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
      <div className="flex gap-3">
        <div className="h-16 w-12 rounded-md bg-gradient-to-br from-slate-200 to-brand-100" />
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-2">
            <p className="font-medium text-slate-900">镜头 {scene.id}：{scene.title}</p>
            <span className="text-xs text-slate-500">{scene.duration}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1">{scene.tag}</span>
            <span>{scene.owner}</span>
            <span className="inline-flex items-center gap-1"><MessageSquare size={13} />{scene.comments}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
