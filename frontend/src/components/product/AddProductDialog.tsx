import { useState } from "react";
import { Link2, Loader2, Plus, Upload, X, CheckCircle2, Image as ImageIcon, Video, Music, PlayCircle, AudioWaveform, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AssetType = "image" | "video" | "audio";
interface Asset {
  id: string;
  url: string;
  name: string;
  type: AssetType;
  isGenerating?: boolean;
}

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    details: "",
    category: "",
  });

  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', name: 'product-front.jpg', type: 'image' },
    { id: '2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', name: 'product-side.jpg', type: 'image' },
    { id: '3', url: '', name: 'presentation.mp4', type: 'video' },
    { id: '4', url: '', name: 'review.mp3', type: 'audio' }
  ]);
  const [mainImageId, setMainImageId] = useState('1');
  const [activeTab, setActiveTab] = useState<"all" | AssetType>("all");
  const [genStyle, setGenStyle] = useState("realistic");

  const filteredAssets = assets.filter(a => activeTab === "all" || a.type === activeTab);

  const handleSimulateFetch = () => {
    if (!url) return;
    setIsLoading(true);
    setTimeout(() => {
      setFormData({
        name: "自动提取商品名称",
        brand: "示例品牌",
        details: "这是通过链接自动解析出来的商品详情...",
        category: "数码配件",
      });
      setIsLoading(false);
    }, 1500);
  };

  const removeAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (mainImageId === id) setMainImageId('');
  };

  const handleGenerateAIAsset = () => {
    const newId = `gen-${Date.now()}`;
    // Insert skeleton
    setAssets(prev => [{ id: newId, url: '', name: 'Generated_Scene.jpg', type: 'image', isGenerating: true }, ...prev]);
    // Simulate generation delay
    setTimeout(() => {
      setAssets(prev => prev.map(a => 
        a.id === newId 
          ? { ...a, isGenerating: false, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' }
          : a
      ));
    }, 3000);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setTimeout(() => setStep(1), 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="btn-primary">
          <Plus size={18} />
          添加商品
        </button>
      </DialogTrigger>
      <DialogContent 
        className={`gap-0 p-0 overflow-hidden bg-white transition-all duration-300 ${step === 1 ? 'sm:max-w-[650px]' : 'sm:max-w-5xl'}`}
      >
        {/* Header */}
        <div className="bg-neutral-50 px-8 py-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div>
            <DialogHeader>
              <DialogTitle className="text-xl">添加新商品</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-4 mt-4">
              {[ 
                { num: 1, label: "基础信息提取" }, 
                { num: 2, label: "商品素材管理" }
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 flex-1 min-w-[120px] whitespace-nowrap">
                  <div className={`
                    w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${step === s.num ? 'bg-blue-600 text-white' : step > s.num ? 'bg-blue-100 text-blue-600' : 'bg-neutral-200 text-neutral-500'}
                  `}>
                    {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                  </div>
                  <span className={`text-sm font-medium ${step >= s.num ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {s.label}
                  </span>
                  {i < 1 && <div className={`h-px w-8 sm:w-16 ${step > s.num ? 'bg-blue-200' : 'bg-neutral-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-8 flex flex-col gap-6"
            >
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    className="input pl-10 h-10 w-full bg-neutral-50 focus:bg-white transition-colors"
                    placeholder="粘贴商品链接 (如亚马逊、淘宝等) 智能提取信息"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSimulateFetch}
                  disabled={isLoading || !url}
                  className="btn-secondary h-10 px-4 min-w-[100px] border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : "智能提取"}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label mb-2 block text-neutral-700">商品名称</label>
                  <input
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：Havit H630BT"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label mb-2 block text-neutral-700">品牌</label>
                    <input
                      className="input w-full"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="品牌名称"
                    />
                  </div>
                  <div>
                    <label className="label mb-2 block text-neutral-700">分类</label>
                    <input
                      className="input w-full"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="所属分类"
                    />
                  </div>
                </div>
                <div>
                  <label className="label mb-2 block text-neutral-700">商品详情</label>
                  <textarea
                    className="input w-full h-24 py-3 resize-none"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="简要描述商品核心卖点..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col h-[500px]"
            >
              {/* 顶栏控制区 */}
              <div className="bg-neutral-50/80 border-b border-neutral-100 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 p-1 bg-neutral-200/50 rounded-lg">
                  {[
                    { id: 'all', label: '全部' },
                    { id: 'image', label: '图片', icon: <ImageIcon size={14} /> },
                    { id: 'video', label: '视频', icon: <Video size={14} /> },
                    { id: 'audio', label: '音频', icon: <Music size={14} /> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`
                        px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-md transition-colors
                        ${activeTab === tab.id ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'}
                      `}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 border-r border-neutral-200 pr-4">
                    <select 
                      value={genStyle} 
                      onChange={e => setGenStyle(e.target.value)}
                      className="input h-9 py-0 text-sm bg-white min-w-[120px] whitespace-nowrap"
                    >
                      <option value="realistic">写实产品图</option>
                      <option value="3d">3D 产品图</option>
                      <option value="minimalist">纯色背景图</option>
                    </select>
                    <button 
                      onClick={handleGenerateAIAsset}
                      className="btn-secondary h-9 px-3 gap-1.5 border-neutral-200 group relative whitespace-nowrap shrink-0"
                    >
                      <ImagePlus size={16} className="text-blue-500" /> 
                      <span className="text-neutral-700 font-medium">AI 产品图生成</span>
                      
                      {/* Tooltip */}
                      <div className="absolute top-full mt-2 right-0 w-52 p-2.5 bg-neutral-800 text-white text-xs whitespace-normal leading-relaxed rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left">
                        系统将读取您在第一步填写的“商品详情”，为您自动生成对应的商品使用场景图。
                      </div>
                    </button>
                  </div>
                  <button className="btn-primary h-9 px-4 gap-1.5 whitespace-nowrap shrink-0">
                    <Upload size={16} /> 本地上传
                  </button>
                </div>
              </div>

              {/* 素材画廊区 */}
              <div className="p-6 flex-1 overflow-y-auto bg-neutral-50/30">
                {filteredAssets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-3 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                    <Upload size={24} />
                    <p className="text-sm font-medium text-neutral-600">暂无对应素材</p>
                    <p className="text-xs">点击右上角按钮上传或生成</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredAssets.map((asset) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={asset.id} 
                          className={`relative group rounded-lg overflow-hidden border-2 transition-all h-40 bg-neutral-100 flex items-center justify-center
                            ${mainImageId === asset.id ? 'border-blue-500 shadow-sm' : 'border-neutral-200'}
                          `}
                        >
                          {/* Render based on Asset State/Type */}
                          {asset.isGenerating ? (
                            <div className="flex flex-col items-center gap-3 text-neutral-600/70">
                              <Loader2 size={24} className="animate-spin" />
                              <span className="text-xs font-bold tracking-wider">系统生成中...</span>
                            </div>
                          ) : asset.type === 'image' ? (
                            <img src={asset.url} alt="asset" className="w-full h-full object-cover" />
                          ) : asset.type === 'video' ? (
                            <div className="w-full h-full bg-neutral-800 flex flex-col items-center justify-center text-white/50 gap-2">
                              <PlayCircle size={32} />
                              <span className="text-xs font-medium truncate w-full px-4 text-center">{asset.name}</span>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-blue-400/50 gap-2">
                              <AudioWaveform size={32} />
                              <span className="text-xs font-medium truncate w-full px-4 text-center">{asset.name}</span>
                            </div>
                          )}
                          
                          {/* Delete button */}
                          {!asset.isGenerating && (
                            <button 
                              onClick={() => removeAsset(asset.id)}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10"
                            >
                              <X size={14} />
                            </button>
                          )}

                          {/* Set Main Image logic (only for images) */}
                          {!asset.isGenerating && asset.type === 'image' && (
                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent pt-6">
                              {mainImageId === asset.id ? (
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                  <CheckCircle2 size={14} className="text-blue-400" /> 商品主图
                                </span>
                              ) : (
                                <button 
                                  onClick={() => setMainImageId(asset.id)}
                                  className="text-xs font-medium text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  设为主图
                                </button>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-8 py-4 border-t border-neutral-100 flex items-center justify-between shrink-0">
          <button 
            onClick={step === 1 ? () => setOpen(false) : () => setStep(1)} 
            className="btn-ghost font-medium whitespace-nowrap shrink-0"
          >
            {step === 1 ? '取消' : '上一步'}
          </button>
          
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)} 
              className="btn-primary whitespace-nowrap shrink-0"
            >
              下一步，管理素材
            </button>
          ) : (
            <button onClick={() => setOpen(false)} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 whitespace-nowrap shrink-0">
              确认添加商品
            </button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
