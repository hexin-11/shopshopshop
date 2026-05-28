import { ArrowUpRight, Package, Plus, Search } from "lucide-react";
import { useState } from "react";
import { catalog } from "../data/mockData";

export default function ProductsPage({ onSelectProduct }: { onSelectProduct: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");

  const filtered = catalog.filter((p) => {
    const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === "全部" || p.category === category;
    return matchQuery && matchCat;
  });

  const categories = ["全部", ...Array.from(new Set(catalog.map((p) => p.category)))];

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-6xl mx-auto">

      {/* 标题区 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[#171719] tracking-tight">商品库</h1>
          <p className="mt-2 text-[16px] text-[#171719]/60">集中管理您的所有带货商品，并生成专属视频。</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          添加商品
        </button>
      </div>

      {/* 搜索 + 分类过滤 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#171719]/40" size={18} />
          <input
            className="input pl-12 h-[52px]"
            placeholder="搜索商品名称或品牌…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-lg px-5 py-3 text-[15px] font-medium transition-colors ${
                category === cat
                  ? "bg-[#171719] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#171719]/70 hover:bg-neutral-50 hover:text-[#171719]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 商品网格 */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product, index) => (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              style={{ animationDelay: `${index * 60}ms` }}
              className={`
                card card-hover group relative flex flex-col overflow-hidden text-left
                animate-slide-up-card
              `}
            >
              {/* 封面 */}
              <div className="h-40 bg-neutral-50 border-b border-[#E5E7EB] relative flex items-center justify-center">
                <span className="text-5xl opacity-40 grayscale">📦</span>
                <div className="absolute right-4 top-4">
                  <ArrowUpRight
                    size={20}
                    className="text-[#171719]/40 transition-colors group-hover:text-[#171719]"
                  />
                </div>
              </div>

              {/* 商品信息 */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-bold text-[#171719]">{product.name}</p>
                    <p className="mt-1 text-[14px] text-[#171719]/50">{product.brand}</p>
                  </div>
                  <span className="badge">
                    {product.status}
                  </span>
                </div>

                <div className="mt-5">
                  <span className="rounded bg-neutral-50 border border-[#E5E7EB] px-2.5 py-1 text-[13px] font-medium text-[#171719]/60">
                    {product.category}
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-4 border-t border-[#E5E7EB] pt-5 text-[14px] font-medium text-[#171719]/50">
                  <span>{product.assetCount} 个素材</span>
                  <span>{product.scriptCount} 个脚本</span>
                  <span>{product.projectCount} 个项目</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Package size={40} className="text-[#171719]/20" />
          <div>
            <p className="text-[20px] font-bold text-[#171719]">未找到匹配的商品</p>
            <p className="mt-2 text-[15px] text-[#171719]/50">请尝试调整您的搜索词或分类过滤条件。</p>
          </div>
          <button onClick={() => { setQuery(""); setCategory("全部"); }} className="btn-secondary mt-2">
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  );
}
