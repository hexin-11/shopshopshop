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
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { assets, catalog, productScripts, projects } from "../data/mockData";

type Tab = "assets" | "scripts" | "projects";

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
  const [tab, setTab] = useState<Tab>("assets");
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);

  const product = catalog.find((p) => p.id === productId) ?? catalog[0];
  const scripts = productScripts[productId] ?? [];
  const activeScript = scripts.find((s) => s.id === selectedScriptId) ?? scripts[0];
  const relatedProjects = projects.filter((p) =>
    p.product === product.brand || p.name.includes(product.brand)
  );

  const tabs = [
    { key: "assets",   label: "素材",   icon: Image,       count: product.assetCount },
    { key: "scripts",  label: "AI 脚本",    icon: FileText,    count: product.scriptCount },
    { key: "projects", label: "项目",   icon: Clapperboard, count: product.projectCount },
  ] as const;

  return (
    <div className="flex flex-col gap-10 animate-fade-in max-w-6xl mx-auto">
      {/* 面包屑 + 标题 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="btn-ghost mt-2 p-2"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[14px] font-medium text-[#171719]/40 mb-1">
              商品库 <span className="mx-2 text-[#171719]/20">/</span>
              <span className="text-[#171719]/80">{product.name}</span>
            </p>
            <h1 className="text-[32px] font-bold text-[#171719] tracking-tight">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3 text-[14px] font-medium text-[#171719]/50">
              <Package size={16} />
              <span>{product.brand}</span>
              <span className="text-[#171719]/20">·</span>
              <span>{product.category}</span>
              <span className="text-[#171719]/20">·</span>
              <span>更新于 {product.updatedAt}</span>
            </div>
          </div>
        </div>

        <button onClick={onQuickGenerate} className="btn-primary shrink-0">
          <Sparkles size={18} />
          一键生成视频
        </button>
      </div>

      {/* 数据带 */}
      <div className="card p-10 flex items-center gap-16">
        <div>
          <p className="text-[15px] font-medium text-[#171719]/40">总素材数</p>
          <p className="mt-2 text-[48px] font-bold tracking-tighter text-[#171719]">{product.assetCount}</p>
        </div>
        <div className="h-16 w-px bg-[#E5E7EB]" />
        <div>
          <p className="text-[15px] font-medium text-[#171719]/40">脚本方案</p>
          <p className="mt-2 text-[48px] font-bold tracking-tighter text-[#171719]">{product.scriptCount}</p>
        </div>
        <div className="h-16 w-px bg-[#E5E7EB]" />
        <div>
          <p className="text-[15px] font-medium text-[#171719]/40">视频项目</p>
          <p className="mt-2 text-[48px] font-bold tracking-tighter text-[#171719]">{product.projectCount}</p>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-8 border-b border-[#E5E7EB]">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`
              group relative flex items-center gap-2 pb-5 text-[16px] font-bold transition-colors
              ${tab === key
                ? "text-[#171719]"
                : "text-[#171719]/40 hover:text-[#171719]/80"
              }
            `}
          >
            <Icon size={18} />
            <span>{label}</span>
            <span className={`ml-1 rounded px-2 py-0.5 text-[12px] font-bold ${tab === key ? "bg-[#4684EE] text-white" : "bg-[#171719]/5 text-[#171719]/50 group-hover:bg-[#171719]/10"}`}>
              {count}
            </span>
            {/* 激活指示线 */}
            {tab === key && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#4684EE]" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 内容 ──────────────────────────────────────────────────── */}

      {tab === "assets" && (
        <div className="flex flex-col gap-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="h2-siter text-[28px]">素材集合</h2>
            <div className="flex gap-3">
              <button className="btn-secondary">新建集合</button>
              <button className="btn-primary">
                <Plus size={18} />
                上传素材
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {assets.map((asset, i) => (
              <div
                key={asset.name}
                style={{ animationDelay: `${i * 50}ms` }}
                className="card group overflow-hidden transition-all duration-300 animate-slide-up"
              >
                <div className={`h-48 bg-neutral-50 border-b border-[#E5E7EB] flex items-center justify-center`}>
                  <span className="text-5xl opacity-40 select-none grayscale">
                    {assetTypeIcon[asset.type] ?? "📁"}
                  </span>
                </div>
                <div className="p-6">
                  <p className="truncate text-[18px] font-bold text-[#171719]">{asset.name}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {asset.tags.map((tag) => (
                      <span key={tag} className="rounded bg-[#171719]/5 px-2.5 py-1 text-[12px] font-medium text-[#171719]/60">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between text-[14px] font-medium text-[#171719]/40">
                    <span>{asset.type}</span>
                    <span>已使用 {asset.used} 次</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "scripts" && (
        <div className="animate-fade-in">
          {scripts.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 py-24 text-center">
              <FileText size={48} className="text-[#171719]/20" />
              <div>
                <p className="h2-siter">还没有脚本</p>
                <p className="mt-3 p-siter-large">让 AI 为这个商品创作第一份脚本。</p>
              </div>
              <button className="btn-primary mt-4">生成脚本</button>
            </div>
          ) : (
            <div className="grid gap-8 xl:grid-cols-[340px_1fr]">
              {/* 左：版本列表 */}
              <aside className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] font-bold text-[#171719]">脚本版本</h2>
                  <button className="btn-primary px-4 py-2 text-[14px]">
                    <Sparkles size={16} />
                    生成新版本
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {scripts.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScriptId(s.id)}
                      className={`
                        rounded-xl border p-5 text-left transition-all duration-300
                        ${(selectedScriptId ?? scripts[0]?.id) === s.id
                          ? "border-[#4684EE] bg-[#4684EE]/5"
                          : "border-[#E5E7EB] bg-white hover:bg-neutral-50"
                        }
                      `}
                    >
                      <p className={`text-[16px] font-bold ${(selectedScriptId ?? scripts[0]?.id) === s.id ? "text-[#4684EE]" : "text-[#171719]"}`}>
                        {s.versionLabel}
                      </p>
                      <p className={`mt-2 text-[14px] ${(selectedScriptId ?? scripts[0]?.id) === s.id ? "text-[#4684EE]/80" : "text-[#171719]/50"}`}>{s.note}</p>
                      <p className={`mt-4 text-[12px] font-medium ${(selectedScriptId ?? scripts[0]?.id) === s.id ? "text-[#4684EE]/60" : "text-[#171719]/40"}`}>{s.author} · {s.time}</p>
                    </button>
                  ))}
                </div>

                <div className="card mt-2 p-6">
                  <h3 className="mb-5 text-[12px] font-bold uppercase tracking-widest text-[#171719]/40">生成参数</h3>
                  <div className="space-y-5">
                    {[
                      ["视频目标", ["种草转化", "品牌宣传", "新品发布"]],
                      ["预计时长", ["15秒", "30秒", "60秒"]],
                      ["目标语言", ["中文", "英文", "韩文"]],
                      ["视频风格", ["生活方式", "专业测评", "休闲口播"]],
                    ].map(([label, opts]) => (
                      <label key={label as string} className="block">
                        <span className="label block mb-2">{label as string}</span>
                        <select className="input">
                          {(opts as string[]).map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
              </aside>

              {/* 右：脚本内容 */}
              {activeScript && (
                <div className="flex flex-col gap-6">
                  <div className="card p-10">
                    <div className="mb-10 flex items-start justify-between gap-6 border-b border-[#E5E7EB] pb-8">
                      <div>
                        <h2 className="text-[32px] font-extrabold tracking-tight text-[#171719]">{product.name}</h2>
                        <p className="mt-2 text-[16px] text-[#171719]/50">当前版本：{activeScript.versionLabel}</p>
                      </div>
                      <div className="flex gap-3">
                        <button className="btn-secondary px-4 py-2 text-[14px]"><RefreshCw size={16} /> 重新生成</button>
                        <button className="btn-secondary px-4 py-2 text-[14px]"><Save size={16} /> 保存</button>
                        <button onClick={onQuickGenerate} className="btn-primary px-4 py-2 text-[14px]"><Send size={16} /> 生成视频</button>
                      </div>
                    </div>

                    <div className="space-y-10">
                      {activeScript.content.map(({ heading, body }) => (
                        <div key={heading} className="border-l-[3px] border-[#4684EE] pl-6">
                          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#4684EE]">{heading}</h3>
                          <p className="mt-4 text-[18px] leading-loose text-[#171719]/80">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "projects" && (
        <div className="flex flex-col gap-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="h2-siter text-[28px]">关联视频项目</h2>
            <button onClick={onQuickGenerate} className="btn-primary">
              <Plus size={18} />
              新建项目
            </button>
          </div>

          {relatedProjects.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 py-24 text-center">
              <Clapperboard size={48} className="text-[#171719]/20" />
              <div>
                <p className="h2-siter">暂无视频项目</p>
                <p className="mt-3 p-siter-large">先生成 AI 脚本，再一键制作视频。</p>
              </div>
              <button className="btn-secondary mt-4" onClick={() => setTab("scripts")}>去生成脚本</button>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {relatedProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => openProject(project.id)}
                  className="card p-8 text-left transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[20px] font-bold text-[#171719]">{project.name}</h3>
                      <p className="mt-2 text-[14px] text-[#171719]/50">{project.ratio} · {project.updated}</p>
                    </div>
                    <span className="badge">{project.status}</span>
                  </div>
                  <div className="mt-8">
                    <div className="mb-2 flex justify-between text-[14px] font-medium text-[#171719]/50">
                      <span>生成进度</span>
                      <span className="text-[#171719]">{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div
                        className="h-full rounded-full bg-[#4684EE]"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-[#E5E7EB] pt-5 text-[14px] font-medium text-[#171719]/50">
                    <div className="flex items-center gap-2">
                      {project.visibility === "Private" ? <Lock size={16} /> : <Share2 size={16} />}
                      {project.visibility === "Private" ? "私密" : "公开协作"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>负责人: {project.owner}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {relatedProjects.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                className="btn-secondary"
                onClick={() => openProject(relatedProjects[0].id)}
              >
                <Play size={18} />
                打开最近项目
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
