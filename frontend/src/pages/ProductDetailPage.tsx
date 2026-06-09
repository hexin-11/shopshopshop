import {
  ArrowLeft,
  Clapperboard,
  Image as ImageIcon,
  Package,
  Plus,
  Zap,
  Users,
  CheckCircle2,
  Trash2,
  Star,
  Video,
  Music,
  Camera,
  Film,
  FolderOpen,
  BarChart2
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { assets as mockAssets, catalog, platformPerformance } from "../data/mockData";
import { api } from "../lib/api";
import { EditProductDialog } from "../components/product/EditProductDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

type Tab = "dashboard" | "assets";

const getAssetTypeIcon = (type: string) => {
  switch (type) {
    case "商品图片": return <ImageIcon size={48} strokeWidth={1.5} />;
    case "商品视频": return <Clapperboard size={48} strokeWidth={1.5} />;
    case "生活方式图": return <Camera size={48} strokeWidth={1.5} />;
    case "参考视频": return <Film size={48} strokeWidth={1.5} />;
    case "音频 / BGM": return <Music size={48} strokeWidth={1.5} />;
    default: return <FolderOpen size={48} strokeWidth={1.5} />;
  }
};

const getAssetCategory = (type: string) => {
  if (type.includes("图")) return "image";
  if (type.includes("视频")) return "video";
  if (type.includes("音频") || type.includes("BGM")) return "audio";
  return "other";
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "TikTok") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    )
  }
  if (platform === "YouTube") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
  if (platform === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  }
  return <span className="font-bold">{platform[0]}</span>;
};

const InteractiveLineChart = ({ platform, idx }: { platform: any, idx: number }) => {
  const chartData = platform.series.map((val: number, i: number) => ({
    name: `Day ${i + 1}`,
    value: val,
  }));

  return (
    <div className="h-16 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id={`grad-product-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={platform.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={platform.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-neutral-900 text-white text-[12px] px-2 py-0.5 rounded shadow-md font-mono border border-neutral-800">
                    {payload[0].value}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={platform.color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#grad-product-${idx})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  openProject: (projectId: string) => void;
}

export default function ProductDetailPage({
  productId,
  onBack,
  openProject,
}: ProductDetailPageProps) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [product, setProduct] = useState<any>(catalog.find((p) => p.id === productId) ?? catalog[0]);
  const [localAssets, setLocalAssets] = useState<any[]>(mockAssets);

  // --- Product State ---
  const [localProduct, setLocalProduct] = useState<any>(
    catalog.find((p) => p.id === productId) ?? catalog[0]
  );

  // --- Asset Library State ---
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [mainImageId, setMainImageId] = useState<string>("产品正面主图_4K.jpg"); // Mock default
  const [activeCategory, setActiveCategory] = useState<"all" | "image" | "video" | "audio">("all");
  const [assetToSetMain, setAssetToSetMain] = useState<string | null>(null);

  // --- Asset Upload Simulator ---
  const handleUploadAsset = () => {
    const assetTypes = ["商品图片", "商品视频", "生活方式图", "参考视频", "音频 / BGM"];
    const randomType = assetTypes[Math.floor(Math.random() * assetTypes.length)];
    
    let randomName = "";
    const randId = Math.floor(Math.random() * 1000);
    if (randomType === "商品图片") {
      randomName = `新商品图_${randId}.jpg`;
    } else if (randomType === "商品视频") {
      randomName = `细节特写视频_${randId}.mp4`;
    } else if (randomType === "生活方式图") {
      randomName = `生活场景图_${randId}.jpg`;
    } else if (randomType === "参考视频") {
      randomName = `开箱参考_${randId}.mp4`;
    } else {
      randomName = `背景配乐_${randId}.wav`;
    }

    const newAsset = {
      name: randomName,
      type: randomType,
      tags: ["新上传", randomType.split(" / ")[0]],
      owner: "何鑫",
      used: 0,
      color: "from-blue-100 to-indigo-100",
    };

    setLocalAssets(prev => [newAsset, ...prev]);
  };



  useEffect(() => {
    const defaultProduct = catalog.find((p) => p.id === productId) ?? catalog[0];
    setProduct(defaultProduct);
    setLocalProduct(defaultProduct);
    setLocalAssets(mockAssets);

    api.product(productId).then((p) => {
      setProduct(p);
      setLocalProduct(p);
    });
    api.productAssets(productId).then((items) => {
      setLocalAssets(items as any[]);
    });
  }, [productId]);

  const filteredAssets = localAssets.filter(asset => 
    activeCategory === "all" || getAssetCategory(asset.type) === activeCategory
  );

  // Asset Methods
  const toggleAsset = (assetName: string) => {
    const newSet = new Set(selectedAssets);
    if (newSet.has(assetName)) newSet.delete(assetName);
    else newSet.add(assetName);
    setSelectedAssets(newSet);
  };

  const deleteAsset = (e: React.MouseEvent, assetName: string) => {
    e.stopPropagation();
    setLocalAssets(prev => prev.filter(a => a.name !== assetName));
    if (selectedAssets.has(assetName)) {
      const newSet = new Set(selectedAssets);
      newSet.delete(assetName);
      setSelectedAssets(newSet);
    }
  };

  const bulkDelete = () => {
    setLocalAssets(prev => prev.filter(a => !selectedAssets.has(a.name)));
    setSelectedAssets(new Set());
  };

  const confirmSetMainImage = () => {
    if (assetToSetMain) {
      setMainImageId(assetToSetMain);
      setAssetToSetMain(null);
    }
  };



  const tabs = [
    { key: "dashboard", label: "效果概览", icon: BarChart2 },
    { key: "assets",    label: "项目素材库", icon: ImageIcon },
  ] as const;

  // Dispatch AI creation event with productId
  const handleCreateVideo = () => {
    window.dispatchEvent(
      new CustomEvent("tikframe:openVideoCreation", { detail: { productId: localProduct.id } })
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-7xl mx-auto pb-24">
      {/* 顶部导航与操作栏 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="btn-ghost md:mt-2 p-2 hover:bg-neutral-100 rounded-full transition-colors shrink-0"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-neutral-400 mb-1">
              商品库 <span className="mx-2 text-neutral-200">/</span>
              <span className="text-neutral-800">{localProduct.name}</span>
            </p>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight truncate">{localProduct.name}</h1>
              <EditProductDialog 
                initialData={{ name: localProduct.name, brand: localProduct.brand, category: localProduct.category, details: localProduct.details }}
                onSave={(data) => setLocalProduct({ ...localProduct, ...data })}
              />
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm font-medium text-neutral-500">
              <span className="bg-neutral-100 px-2.5 py-0.5 rounded text-neutral-700">{localProduct.brand}</span>
              <span className="bg-neutral-100 px-2.5 py-0.5 rounded text-neutral-700">{localProduct.category}</span>
              <span className="text-neutral-300">·</span>
              <span>更新于 {localProduct.updatedAt}</span>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white p-4 border-t border-[#E5E7EB] md:static md:bg-transparent md:p-0 md:border-0">
          <button onClick={handleCreateVideo} className="btn-primary w-full md:w-auto shrink-0 shadow-sm justify-center h-12 md:h-auto text-base md:text-sm">
            <Zap size={18} />
            AI 创作视频
          </button>
        </div>
      </div>

      {/* 左右分栏布局 */}
      <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-8 mt-4 items-start">
        
        {/* 左侧固定信息栏 */}
        <div className="flex flex-col gap-6 sticky top-8">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-neutral-100 relative">
              {localProduct.mainImage ? (
                <img src={localProduct.mainImage} alt={localProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                  <Package size={64} strokeWidth={1} />
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-neutral-900 mb-2">商品详情</h3>
              <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-wrap">
                {localProduct.details || `这是 ${localProduct.name} 的内部参考详情。包含了基础尺寸、适用人群、主要卖点等信息，供 AI 脚本生成器参考。`}
              </p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">资产统计</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">素材数</span>
                <span className="font-bold text-neutral-900">{localAssets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">脚本方案</span>
                <span className="font-bold text-neutral-900">{localProduct.scriptCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">视频项目</span>
                <span className="font-bold text-neutral-900">{localProduct.projectCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧核心工作区 */}
        <div className="flex flex-col min-h-[600px] border border-neutral-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tab 导航 */}
          <div className="flex px-2 pt-2 border-b border-neutral-100 bg-neutral-50/50">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={`
                  relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap shrink-0
                  ${tab === key
                    ? "text-blue-600 bg-white rounded-t-xl border-t border-x border-neutral-200/50"
                    : "text-neutral-500 hover:text-neutral-800"
                  }
                `}
                style={{ marginBottom: tab === key ? "-1px" : "0" }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* 1. 数据大盘 Tab */}
              {tab === "dashboard" && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-8"
                >
                  {/* KPI 指标 */}
                  {(() => {
                    const isEarphone = localProduct.id === "prod-earphone";
                    const isSerum = localProduct.id === "prod-serum";
                    const isBottle = localProduct.id === "prod-bottle";
                    
                    const totalViews = isEarphone ? "128.4K" : isSerum ? "88.6K" : isBottle ? "52.1K" : "32.0K";
                    const totalViewsDelta = isEarphone ? "+15.2%" : isSerum ? "+8.4%" : isBottle ? "+12.1%" : "+4.8%";
                    
                    const estROI = isEarphone ? "3.6x" : isSerum ? "2.8x" : isBottle ? "2.4x" : "1.8x";
                    const estROIDelta = isEarphone ? "+0.4" : isSerum ? "+0.2" : isBottle ? "+0.1" : "+0.0";

                    const productMetrics = [
                      { label: "关联项目数", value: `${localProduct.projectCount ?? 0} 个`, delta: "+1" },
                      { label: "已发布视频数", value: `${Math.max(0, (localProduct.projectCount ?? 0) - 1)} 个`, delta: "+1" },
                      { label: "单品全网总播放量", value: totalViews, delta: totalViewsDelta },
                      { label: "预估 ROI", value: estROI, delta: estROIDelta }
                    ];

                    return (
                      <div className="grid grid-cols-2 gap-6">
                        {productMetrics.map((metric) => (
                          <div key={metric.label} className="p-6 rounded-xl border border-neutral-100 bg-neutral-50/50">
                            <p className="text-sm font-medium text-neutral-500 mb-2">{metric.label}</p>
                            <div className="flex items-end justify-between">
                              <span className="text-3xl font-extrabold text-neutral-900">{metric.value}</span>
                              <span className={`text-sm font-bold ${metric.delta.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                {metric.delta}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* 全网分发表现 */}
                  <div className="mt-4 border border-neutral-100 rounded-2xl shadow-sm">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                      <h3 className="font-bold text-neutral-900">全网分发表现</h3>
                      <span className="text-xs font-medium text-neutral-400">近 30 天</span>
                    </div>
                    <div className="p-6 flex flex-col gap-6 bg-white">
                      {platformPerformance.map((platform, idx) => {
                        // Calculate percentage purely for the visual bar (just an example calc based on max views logic)
                        const maxViews = 150; // Mock max base
                        const currentViews = parseInt(platform.views.replace('K', ''));
                        const percentage = Math.min((currentViews / maxViews) * 100, 100);

                        return (
                          <div key={platform.platform} className="flex items-center justify-between py-2 mb-4 group">
                            {/* 平台标识 */}
                            <div className="flex items-center gap-3 w-32 shrink-0">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                                style={{ backgroundColor: platform.color }}
                              >
                                <PlatformIcon platform={platform.platform} />
                              </div>
                              <span className="font-bold text-[15px] text-neutral-800">{platform.platform}</span>
                            </div>
                            
                            {/* 居中显示的微型图表 (Sparkline) */}
                            <div className="flex-1 flex justify-center px-4">
                              <div className="w-[240px]">
                                <InteractiveLineChart platform={platform} idx={idx} />
                              </div>
                            </div>

                            {/* 数据统计 */}
                            <div className="flex gap-8 w-32 shrink-0 justify-end items-center">
                              <div className="flex flex-col items-end">
                                <span className="text-[11px] font-medium text-neutral-400 mb-1">总播放量</span>
                                <span className="font-bold text-[15px] text-neutral-900 leading-none">{platform.views}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[11px] font-medium text-neutral-400 mb-1">转化率</span>
                                <span className="font-bold text-[15px] text-emerald-600 leading-none">{platform.conversion}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. 项目素材库 Tab */}
              {tab === "assets" && (
                <motion.div 
                  key="assets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6 relative"
                >
                  {/* 分类过滤栏 */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-1.5 p-1 bg-neutral-100/80 rounded-lg">
                      {[
                        { id: 'all', label: '全部' },
                        { id: 'image', label: '图片', icon: <ImageIcon size={14} /> },
                        { id: 'video', label: '视频', icon: <Video size={14} /> },
                        { id: 'audio', label: '音频', icon: <Music size={14} /> },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id as any)}
                          className={`
                            px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-md transition-colors whitespace-nowrap shrink-0
                            ${activeCategory === cat.id ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'}
                          `}
                        >
                          {cat.icon} {cat.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleUploadAsset} className="btn-primary shrink-0">
                      <Plus size={16} /> 上传新素材
                    </button>
                  </div>

                  {filteredAssets.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-neutral-400 gap-3 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                      <ImageIcon size={32} />
                      <p className="text-sm font-medium text-neutral-600">暂无对应分类的素材</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <AnimatePresence mode="popLayout">
                        {filteredAssets.map((asset, i) => {
                          const isMain = mainImageId === asset.name;
                          const isImage = getAssetCategory(asset.type) === "image";
                          const isSelected = selectedAssets.has(asset.name);

                          return (
                            <motion.div
                              key={asset.name}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className={`
                                group relative flex flex-col overflow-hidden transition-all duration-200 text-left
                                rounded-xl border-2 cursor-pointer
                                ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-neutral-100 bg-white hover:border-neutral-300'}
                              `}
                              onClick={() => toggleAsset(asset.name)}
                            >
                              <div className="absolute top-3 left-3 z-20">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                                  ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-neutral-300 bg-white/90 group-hover:border-neutral-400'}
                                `}>
                                  {isSelected && <CheckCircle2 size={14} />}
                                </div>
                              </div>

                              <div className="absolute top-0 left-0 right-0 h-40 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex flex-col justify-between p-3 pointer-events-none">
                                <div className="flex justify-end pointer-events-auto">
                                  <button 
                                    onClick={(e) => deleteAsset(e, asset.name)}
                                    className="w-8 h-8 rounded-lg bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <div className="flex justify-center pb-2 pointer-events-auto">
                                  {isImage && !isMain && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssetToSetMain(asset.name);
                                      }}
                                      className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white backdrop-blur-sm text-white hover:text-blue-600 font-bold text-sm flex items-center gap-2 transition-all shadow-xl"
                                    >
                                      <Star size={16} className="fill-current" /> 设为主图
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className={`h-40 bg-neutral-50 border-b border-neutral-100 flex items-center justify-center relative text-neutral-300 ${isSelected ? 'opacity-80' : ''}`}>
                                {getAssetTypeIcon(asset.type)}
                                {isMain && (
                                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded flex items-center gap-1 uppercase tracking-wider z-20 shadow-md">
                                    <Star size={12} className="fill-current" /> 商品主图
                                  </div>
                                )}
                              </div>
                              <div className="p-4 z-20 bg-white">
                                <p className="truncate text-base font-bold text-neutral-900">{asset.name}</p>
                                <p className="mt-1 text-xs text-neutral-400">{asset.type} · 使用 {asset.used} 次</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}

                  <AnimatePresence>
                    {selectedAssets.size > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 z-50 whitespace-nowrap"
                      >
                        <span className="text-sm font-medium shrink-0">已选择 {selectedAssets.size} 个素材</span>
                        <div className="w-px h-4 bg-neutral-700 shrink-0"></div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={bulkDelete} 
                            className="text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={16} /> 批量删除
                          </button>
                          <button 
                            onClick={handleCreateVideo} 
                            className="text-sm font-bold text-blue-900 bg-blue-400 hover:bg-blue-300 px-5 py-2 rounded-full transition-colors flex items-center gap-2"
                          >
                            <Zap size={16} /> AI 创作视频
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AlertDialog open={!!assetToSetMain} onOpenChange={(open) => !open && setAssetToSetMain(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>设为商品主图</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将素材 <span className="font-bold text-neutral-900">"{assetToSetMain}"</span> 设为当前商品的主图吗？这将更新商品库列表和概览页的封面显示。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <button className="btn-ghost">取消</button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <button onClick={confirmSetMainImage} className="btn-primary">确认设置</button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
