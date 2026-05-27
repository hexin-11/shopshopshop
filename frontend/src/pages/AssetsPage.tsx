import { Filter, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import AssetCard from "../components/AssetCard";
import { assets } from "../data/mockData";
import PageHeader from "../components/PageHeader";

export default function AssetsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("全部");
  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesType = type === "全部" || asset.type === type;
      const matchesQuery = !normalizedQuery || [asset.name, asset.type, asset.owner, ...asset.tags].join(" ").toLowerCase().includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
  }, [query, type]);

  return (
    <div className="space-y-6">
      <PageHeader title="素材库" description="集中管理商品图片、视频、参考素材和音频。" action={<div className="flex gap-3"><button className="btn-secondary">新建素材集合</button><button className="btn-primary"><Upload size={16} />上传素材</button></div>} />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Filter size={17} />筛选</h2>
          <label className="mb-4 block"><span className="label">商品分类</span><select className="input mt-1"><option>全部</option><option>数码配件</option><option>美妆护肤</option><option>运动户外</option></select></label>
          <label className="mb-4 block"><span className="label">素材类型</span><select value={type} onChange={(event) => setType(event.target.value)} className="input mt-1"><option>全部</option><option>商品图片</option><option>商品视频</option><option>生活方式图</option><option>参考视频</option><option>音频 / BGM</option></select></label>
          {["标签", "上传者", "更新时间"].map((f) => <label key={f} className="mb-4 block"><span className="label">{f}</span><select className="input mt-1"><option>全部</option><option>最近 7 天</option><option>何鑫</option><option>通勤</option></select></label>)}
        </aside>
        <main>
          <div className="card mb-4 flex items-center gap-3 p-3">
            <Search className="text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="flex-1 border-0 bg-transparent text-sm outline-none" placeholder="搜索素材、标签、上传者…" />
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">{filteredAssets.length} 个素材</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredAssets.map((a) => <AssetCard key={a.name} asset={a} />)}</div>
        </main>
      </div>
    </div>
  );
}
