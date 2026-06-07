import { useState } from "react";
import { ArrowRight, ArrowLeft, FileText, Image, Play, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";

// Simple stepper for creating a project
export function CreateProjectWizard({
  open,
  onOpenChange,
  product,
  scripts = [],
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  scripts?: any[];
  onCreated?: (project: any) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3);

  const reset = () => {
    setStep(1);
    setSelectedAsset(null);
    setSelectedScript(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const project = (await api.createProject({
        productId: product?.id || null,
        product: product?.brand || product?.name || "",
        name: product ? `${product.name} 短视频项目` : "新建视频项目",
        ratio: "9:16",
        status: "排队中",
        progress: 0,
        visibility: "Private",
      })) as any;
      await api.createJob({
        projectId: project.id,
        name: `${project.name} 生成任务`,
        project: project.name,
        stage: "等待中",
        progress: 0,
        status: "等待中",
        type: "generating",
        trace: [`已选择素材：${selectedAsset || "未选择"}`, `已选择脚本：${selectedScript || "未选择"}`],
      });
      onCreated?.(project);
      onOpenChange(false);
      reset();
    } finally {
      setIsGenerating(false);
    }
  };

  const scriptOptions = scripts.length
    ? scripts.map((script) => ({
        id: script.id,
        label: script.versionLabel,
        desc: `${script.content?.length || 0} 个分镜 · ${script.note || "AI 脚本"}`,
      }))
    : [
        { id: "v1 初版脚本 (侧重功能介绍)", label: "v1 初版脚本 (侧重功能介绍)", desc: "包含 5 个分镜 · 预计时长 25 秒" },
        { id: "v2 修改版 (侧重痛点开场)", label: "v2 修改版 (侧重痛点开场)", desc: "包含 5 个分镜 · 预计时长 25 秒" },
      ];

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) { setTimeout(reset, 200); }
    }}>
      <DialogContent className="sm:max-w-[700px] gap-0 p-0 overflow-hidden bg-white">
        
        {/* Wizard Header / Stepper Progress */}
        <div className="bg-neutral-50 px-8 py-6 border-b border-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-xl">新建视频项目</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4 mt-6">
            {[ 
              { num: 1, label: "确认素材" }, 
              { num: 2, label: "选定脚本" }, 
              { num: 3, label: "微调与生成" } 
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${step === s.num ? 'bg-blue-600 text-white' : step > s.num ? 'bg-blue-100 text-blue-600' : 'bg-neutral-200 text-neutral-500'}
                `}>
                  {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <span className={`text-sm font-medium ${step >= s.num ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  {s.label}
                </span>
                {i < 2 && <div className={`h-px flex-1 ${step > s.num ? 'bg-blue-200' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Content */}
        <div className="p-8 min-h-[360px]">
          {step === 1 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <p className="text-sm text-neutral-500">选择您要在视频中使用的主要素材，或从本地上传新素材。</p>
              <div className="grid grid-cols-2 gap-4">
                {['产品白底图.png', '使用场景参考.mp4'].map((asset) => (
                  <button 
                    key={asset} 
                    onClick={() => setSelectedAsset(asset)}
                    className={`
                      flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all
                      ${selectedAsset === asset ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-blue-200'}
                    `}
                  >
                    <div className="w-12 h-12 rounded-lg bg-white border border-neutral-100 flex items-center justify-center shrink-0">
                      <Image className="text-neutral-400" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{asset}</p>
                      <p className="text-xs text-neutral-500 mt-1">系统已解析出 3 个商品卖点</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <p className="text-sm text-neutral-500">选择基于 AI 生成的视频分镜脚本。不同的脚本侧重不同的转化目标。</p>
              <div className="grid gap-4">
                {scriptOptions.map((script) => (
                  <button 
                    key={script.id} 
                    onClick={() => setSelectedScript(script.label)}
                    className={`
                      flex items-center justify-between p-5 rounded-xl border-2 text-left transition-all
                      ${selectedScript === script.label ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-blue-200'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <FileText className={selectedScript === script.label ? 'text-blue-500' : 'text-neutral-400'} size={24} />
                      <div>
                        <p className="font-bold text-neutral-900">{script.label}</p>
                        <p className="text-sm text-neutral-500 mt-1">{script.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <p className="text-sm text-neutral-500">最后一步，确认视频基础参数即可进入生成队列。</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-neutral-700 block mb-2">视频画幅比例</label>
                  <select className="input w-full bg-white h-12">
                    <option>9:16 (适合 TikTok, Shorts)</option>
                    <option>16:9 (适合 YouTube 横屏)</option>
                    <option>1:1 (适合 Instagram)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-neutral-700 block mb-2">旁白声音风格</label>
                  <select className="input w-full bg-white h-12">
                    <option>自然女声 (轻松欢快)</option>
                    <option>沉稳男声 (专业信赖)</option>
                    <option>无旁白 (仅字幕+BGM)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100 mt-4">
                <h4 className="font-bold text-sm text-neutral-900 mb-2">项目摘要</h4>
                <ul className="text-sm text-neutral-600 space-y-2">
                  <li>素材源: {selectedAsset || '未选择'}</li>
                  <li>使用脚本: {selectedScript || '未选择'}</li>
                  <li>预计消耗 GPU 资源: ~3.5 credits</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer */}
        <div className="bg-neutral-50 px-8 py-5 border-t border-neutral-100 flex items-center justify-between">
          <button 
            onClick={step === 1 ? () => onOpenChange(false) : handlePrev} 
            className="btn-ghost font-medium"
          >
            {step === 1 ? '取消' : <><ArrowLeft size={16} /> 上一步</>}
          </button>
          
          {step < 3 ? (
            <button 
              onClick={handleNext} 
              disabled={(step === 1 && !selectedAsset) || (step === 2 && !selectedScript)}
              className="btn-primary"
            >
              下一步 <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-emerald-600/20 shadow-lg"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="fill-current" />}
              开始生成视频
            </button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
