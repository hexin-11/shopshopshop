import { MoreHorizontal } from "lucide-react";
import type { assets } from "../data/mockData";

type Asset = (typeof assets)[number];

export default function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="card overflow-hidden">
      <div className={`h-36 bg-gradient-to-br ${asset.color} p-4`}>
        <div className="flex h-full items-end justify-between">
          <span className="rounded bg-white/80 px-2 py-1 text-xs font-medium text-slate-700">{asset.type}</span>
          <button className="rounded bg-white/80 p-1 text-slate-600"><MoreHorizontal size={16} /></button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate font-medium text-slate-900">{asset.name}</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {asset.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{t}</span>)}
        </div>
        <div className="mt-4 flex justify-between text-xs text-slate-500">
          <span>{asset.owner}</span>
          <span>使用 {asset.used} 次</span>
        </div>
      </div>
    </div>
  );
}
