import {
  ArrowLeft,
  Clapperboard,
  FileText,
  Image,
  Lock,
  Package,
  Play,
  Plus,
  RefreshCw,
  Save,
  Send,
  Share2,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { assets, catalog, productScripts, projects, dashboardMetrics } from "../data/mockData";
import { CreateProjectWizard } from "../components/project/CreateProjectWizard";

type Tab = "overview" | "assets" | "scripts";

const assetTypeIcon: Record<string, string> = {
  "商品图片":   "🖼",
  "商品视频":   "🎬",
  "生活方式图": "📷",
  "参考视频":   "🎞",
  "音频 / BGM": "🎵",
};

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  openProject: (projectId: string) => void;
  onQuickGenerate: () => void;
}

export default function ProductDetailPage({
  productId,
  onBack,
  openProject,
  onQuickGenerate,
}: ProductDetailPageProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const product = catalog.find((p) => p.id === productId) ?? catalog[0];
  const scripts = productScripts[productId] ?? [];
  const activeScript = scripts.find((s) => s.id === selectedScriptId);

  const toggleAsset = (assetName: string) => {
    const newSet = new Set(selectedAssets);
    if (newSet.has(assetName)) newSet.delete(assetName);
    else newSet.add(assetName);
    setSelectedAssets(newSet);
  };

  const handleCreateScriptFromAssets = () => {
    setTab("scripts");
    // future integration logic
  };

  const tabs = [
    { key: "overview", label: "商品概览", icon: Package },
    { key: "assets",   label: "项目素材库", icon: Image },
    { key: "scripts",  label: "AI 脚本",    icon: FileText },
  ] as const;

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-7xl mx-auto pb-24">
      {/* 顶部导航与操作栏 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="btn-ghost mt-2 p-2 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[14px] font-medium text-neutral-400 mb-1">
              商品库 <span className="mx-2 text-neutral-200">/</span>
              <span className="text-neutral-800">{product.name}</span>
            </p>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm font-medium text-neutral-500">
              <span className="bg-neutral-100 px-2.5 py-0.5 rounded text-neutral-700">{product.brand}</span>
              <span className="bg-neutral-100 px-2.5 py-0.5 rounded text-neutral-700">{product.category}</span>
              <span className="text-neutral-300">·</span>
              <span>更新于 {product.updatedAt}</span>
            </div>
          </div>
        </div>

        <button onClick={() => setIsWizardOpen(true)} className="btn-primary shrink-0 shadow-sm">
          <Zap size={18} />
          新建视频项目
        </button>
      </div>

      {/* 左右分栏布局：左侧信息，右侧功能 */}
      <div className="grid lg:grid-cols-[320px_1fr] gap-8 mt-4 items-start">
        
        {/* 左侧固定信息栏 */}
        <div className="flex flex-col gap-6 sticky top-8">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-neutral-100 relative">
              {product.mainImage ? (
                <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-20 grayscale">📦</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-neutral-900 mb-2">商品详情</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                这是 {product.name} 的内部参考详情。包含了基础尺寸、适用人群、主要卖点等信息，供 AI 脚本生成器参考。
              </p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">资产统计</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">素材数</span>
                <span className="font-bold text-neutral-900">{product.assetCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">脚本方案</span>
                <span className="font-bold text-neutral-900">{product.scriptCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">视频项目</span>
                <span className="font-bold text-neutral-900">{product.projectCount}</span>
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
                  relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors
                  ${tab === key
                    ? "text-blue-600 bg-white rounded-t-xl border-t border-x border-neutral-200/50"
                    : "text-neutral-500 hover:text-neutral-800"
                  }
                `}
                style={{
                  marginBottom: tab === key ? "-1px" : "0"
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* 1. 商品概览 Tab */}
              {tab === "overview" && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-8"
                >
                  <div className="grid grid-cols-2 gap-6">
                    {dashboardMetrics.map((metric) => (
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
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <button className="btn-primary">
                        <Plus size={16} />上传新素材
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {assets.map((asset, i) => (
                      <motion.button
                        key={asset.name}
                        onClick={() => toggleAsset(asset.name)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ y: -2 }}
                        className={`
                          group relative flex flex-col overflow-hidden transition-all duration-200 text-left
                          rounded-xl border-2
                          ${selectedAssets.has(asset.name) ? 'border-blue-500 bg-blue-50/20' : 'border-neutral-100 bg-white hover:border-neutral-300'}
                        `}
                      >
                        <div className="absolute top-3 left-3 z-10">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                            ${selectedAssets.has(asset.name) ? 'bg-blue-500 border-blue-500 text-white' : 'border-neutral-300 bg-white/80'}
                          `}>
                            {selectedAssets.has(asset.name) && <CheckCircle2 size={14} />}
                          </div>
                        </div>
                        <div className={`h-40 bg-neutral-50 border-b border-neutral-100 flex items-center justify-center ${selectedAssets.has(asset.name) ? 'opacity-80' : ''}`}>
                          <span className="text-5xl opacity-40 select-none grayscale">
                            {assetTypeIcon[asset.type] ?? "📁"}
                          </span>
                        </div>
                        <div className="p-4">
                          <p className="truncate text-base font-bold text-neutral-900">{asset.name}</p>
                          <p className="mt-1 text-xs text-neutral-400">{asset.type} · 使用 {asset.used} 次</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* 悬浮操作栏 */}
                  <AnimatePresence>
                    {selectedAssets.size > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50"
                      >
                        <span className="text-sm font-medium">已选择 {selectedAssets.size} 个素材</span>
                        <div className="w-px h-4 bg-neutral-700"></div>
                        <button onClick={handleCreateScriptFromAssets} className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                          <Zap size={16} /> 基于所选素材生成脚本
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* 3. AI 脚本 Tab */}
              {tab === "scripts" && (
                <motion.div 
                  key="scripts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  {!activeScript ? (
                    // 脚本列表视图
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-neutral-500">选择一个脚本开始调整，或创建新版本。</p>
                        <button onClick={() => setSelectedScriptId(scripts[0]?.id)} className="btn-primary">
                          <Plus size={16} /> 生成新脚本
                        </button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {scripts.map((s, i) => (
                          <motion.button
                            key={s.id}
                            onClick={() => setSelectedScriptId(s.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 rounded-xl border border-neutral-200 bg-white text-left hover:border-blue-400 hover:shadow-sm transition-all group"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">{s.versionLabel}</h3>
                              <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-500">{s.content.length} 个分镜</span>
                            </div>
                            <p className="text-sm text-neutral-500 mb-6 line-clamp-2">{s.note}</p>
                            <div className="flex items-center justify-between text-xs font-medium text-neutral-400 border-t border-neutral-100 pt-4">
                              <span>{s.author}</span>
                              <span>{s.time}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // 对话式生成视图
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid xl:grid-cols-[300px_1fr] gap-8"
                    >
                      <div className="flex flex-col gap-4">
                        <button onClick={() => setSelectedScriptId(null)} className="text-sm font-bold text-neutral-400 hover:text-neutral-800 flex items-center gap-2 mb-4 transition-colors">
                          <ArrowLeft size={16} /> 返回列表
                        </button>
                        <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100">
                          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Zap size={16} /> 脚本助手</h4>
                          <p className="text-sm text-blue-700/80 mb-4">
                            “我已经为您生成了这段 {activeScript.content.length * 5} 秒的带货分镜。您可以随时要求我调整某个特定镜头的语气。”
                          </p>
                          <textarea className="input w-full resize-none text-sm" placeholder="例如：将第二个分镜改得更情绪化一些..." rows={3}></textarea>
                          <button className="btn-primary w-full mt-3"><Send size={16} /> 发送</button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-neutral-900">{activeScript.versionLabel}</h3>
                          <div className="flex gap-2">
                            <button className="btn-secondary px-3 py-1.5"><Save size={16} /> 保存</button>
                            <button onClick={() => setIsWizardOpen(true)} className="btn-primary px-3 py-1.5"><Play size={16} /> 从此脚本新建项目</button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {activeScript.content.map((shot, index) => (
                            <motion.div 
                              key={index} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex gap-4"
                            >
                              {/* 素材占位映射框 */}
                              <button className="w-32 h-24 shrink-0 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-neutral-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                                <Image size={20} className="mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">指定素材</span>
                              </button>
                              
                              {/* 文本内容 */}
                              <div className="flex-1 p-5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors group cursor-text">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">分镜 {index + 1} - {shot.heading}</span>
                                  <span className="text-xs font-medium text-neutral-400">约 5s</span>
                                </div>
                                <p className="text-base text-neutral-700 leading-relaxed group-hover:text-neutral-900">{shot.body}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <CreateProjectWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
    </div>
  );
}
