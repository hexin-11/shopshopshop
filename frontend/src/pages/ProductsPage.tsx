import { ArrowUpRight, Package, Search, SlidersHorizontal, ArrowDownAZ } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { catalog } from "../data/mockData";
import { api } from "../lib/api";
import { AddProductDialog } from "../components/product/AddProductDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export default function ProductsPage({ onSelectProduct }: { onSelectProduct: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [sortBy, setSortBy] = useState("latest");
  const [products, setProducts] = useState<any[]>([...catalog]);

  useEffect(() => {
    api.products().then((items) => setProducts(items as any[]));
  }, []);

  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = products.filter((p) => {
    const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === "全部" || p.category === category;
    return matchQuery && matchCat;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    // basic mock sort for "latest"
    return 0;
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">

      {/* 标题区 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[#171719] tracking-tight">商品库</h1>
          <p className="mt-2 text-[16px] text-[#171719]/60">集中管理您的所有带货商品，并生成专属视频。</p>
        </div>
        <AddProductDialog onCreated={(product) => setProducts((prev) => [product, ...prev])} />
      </div>

      {/* 搜索 + 分类过滤 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#171719]/40" size={18} />
          <input
            className="input pl-12 h-[52px] w-full"
            placeholder="搜索商品名称或品牌…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="w-[160px]">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-[52px] bg-white font-medium text-[15px]" icon={<SlidersHorizontal />}>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[160px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-[52px] bg-white font-medium text-[15px]" icon={<ArrowDownAZ />}>
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最近更新</SelectItem>
                <SelectItem value="name">按名称排序</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 商品网格 */}
      {filtered.length > 0 ? (
        <motion.div 
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.02 } }
          }}
        >
          {filtered.map((product) => (
            <motion.button
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`
                card card-hover group relative flex flex-col overflow-hidden text-left
              `}
            >
              {/* 封面 */}
              <div className="h-48 bg-neutral-50 border-b border-[#E5E7EB] relative flex items-center justify-center overflow-hidden">
                {product.mainImage ? (
                  <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <span className="text-5xl opacity-40 grayscale">📦</span>
                )}
                <div className="absolute right-4 top-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight
                    size={16}
                    className="text-[#171719]"
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
            </motion.button>
          ))}
        </motion.div>
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
