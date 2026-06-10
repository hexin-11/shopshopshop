import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Download,
  FileText,
  Film,
  Image,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Pin,
  PinOff,
  Play,
  Plus,
  RefreshCw,
  Scissors,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  Wrench,
  X,
  Zap,
  Bug,
} from "lucide-react";
import { api } from "../lib/api";
import { catalog, productScripts } from "../data/mockData";

// ── Existing types ────────────────────────────────────────────────────────────

interface AgentDockProps {
  children: ReactNode;
}

type ChatMessage = {
  id: number | string;
  role: "user" | "agent";
  text: string;
  thinking?: string[];
  changes?: AgentChange[];
};
type AgentChange = {
  type: string;
  target: string;
  summary: string;
  newText?: string;
  status?: string;
  imageCandidates?: AgentImageCandidate[];
  videoPlan?: AgentVideoPlan;
  editActions?: AgentEditAction[];
};
type AgentImageCandidate = {
  id: string;
  title: string;
  style?: string;
  prompt: string;
  imageUrl: string;
};
type AgentVideoPlan = {
  duration?: number;
  aspectRatio?: string;
  motion?: string;
  prompt?: string;
  shots?: string[];
};
type AgentEditAction = {
  action: string;
  target: string;
  value: string;
};
type Conversation = {
  id: number | string;
  title: string;
  updatedAt: string;
  pinned?: boolean;
  messages: ChatMessage[];
  references: string[];
};
type LibraryItem = {
  id: string;
  type: string;
  title: string;
  detail: string;
};

// ── Video creation types ──────────────────────────────────────────────────────

type VideoCreationStage = "setup" | "outlining" | "canvas" | "generating" | "storyboard" | "preview";

interface VCFormData {
  productId: string;
  description: string;
  videoType: string;
  style: string;
  customStyle: string;
  aspectRatio: string;
  duration: string;
  resolution: string;
  frameRate: string;
  generationCount: string;
  seed: string;
  negativePrompt: string;
  referenceWeight: string;
  references: string[];
}

interface StoryBeat {
  id: string;
  order: number;
  heading: string;
  description: string;
  subtitle?: string;
  voiceover?: string;
  duration: number;
  status: "pending" | "generating" | "generated" | "failed" | "prompt_ready";
  videoClipUrl?: string;   // 只有真实 http/https 视频才存这里
  errorMessage?: string;   // failed 时的错误原因
}

interface VisualRef {
  id: string;
  type: "brand" | "character" | "scene" | "custom";
  label: string;
  url: string;
}

interface VideoProjectData {
  title: string;
  summary: string;
  fullPrompt?: string;
  productName: string;
  videoType: string;
  style: string;
  aspectRatio: string;
  duration: string;
  resolution: string;
  frameRate?: string;
  generationCount?: string;
  seed?: string;
  negativePrompt?: string;
  referenceWeight?: string;
  storyBeats: StoryBeat[];
  visualRefs: VisualRef[];
    avatar?: string;
    ttsVoice?: string;
  }

interface VCSession {
  id: string;
  conversationId: number | string;
  title: string;
  videoType: string;
  stage: VideoCreationStage;
  thumbnail?: string;
  createdAt: string;
  project?: VideoProjectData;
  form: VCFormData;
}

// ── Existing constants ────────────────────────────────────────────────────────

const agentHistoryFlag = "tikframe-agent";
const STORAGE_KEY = "tikframe-agent-conversations";

const libraryItems: LibraryItem[] = [
  { id: "earphone", type: "商品", title: "Havit H630BT 主动降噪耳机", detail: "含主图、卖点、短视频脚本和 2 个项目。" },
  { id: "script-hook", type: "脚本", title: "开场三秒强钩子模板", detail: "适合数码、美妆、家居类商品，可直接生成分镜。" },
  { id: "project-618", type: "项目", title: "618 爆品短视频队列", detail: "包含待审核项目、生成中任务和历史导出记录。" },
  { id: "cover", type: "素材", title: "竖版封面标题模板", detail: "适合 9:16 带货视频封面，留有商品与标题空间。" },
];

const quickActions = [
  { label: "商品卖点", prompt: "帮我把当前商品整理成 5 个带货卖点", reply: "已整理卖点框架：痛点开场、核心参数、使用场景、对比优势、下单理由。你可以继续让我生成短视频脚本。", icon: FileText },
  { label: "素材检查", prompt: "检查当前素材是否适合生成短视频", reply: "素材检查完成：主图清晰度可用，建议补 2 张使用场景图，并把字幕卖点控制在 12 字以内。", icon: Image },
  { label: "文生图", prompt: "帮我生成 3 张适合短视频开场的商品图片候选，先问清楚风格也可以", reply: "我会先确认商品和视觉风格，再给你 3 张候选图，选中后可以继续图生视频。", icon: Sparkles },
  { label: "图生视频", prompt: "用我选中的图片生成一个 6 秒图生视频方案，包含运镜、字幕和节奏", reply: "我会把选中的图片转成视频任务方案，并拆出运镜、字幕和镜头节奏。", icon: Film },
  { label: "项目推进", prompt: "把当前脚本推进到视频生成队列", reply: "已把当前工作流整理为生成任务：脚本、素材、口播和封面都进入待处理清单。你可以从项目页继续查看。", icon: Clapperboard },
];

const firstConversation: Conversation = {
  id: 1,
  title: "TikFrame AI 创作助手",
  updatedAt: "今天",
  references: [],
  messages: [{ id: 1, role: "agent", text: "我可以帮你找商品、改脚本、检查素材，或者把项目推进到生成队列。" }],
};

const VIDEO_TYPES = [
  { id: "influencer", label: "口播带货" },
  { id: "product", label: "商品展示" },
  { id: "unboxing", label: "开箱评测" },
  { id: "skit", label: "情景剧带货" },
  { id: "comparison", label: "对比测评" },
];

const STYLE_PRESETS = [
  { id: "luxury", label: "高端质感" },
  { id: "lively", label: "轻快活泼" },
  { id: "cinematic", label: "电影感" },
  { id: "guochao", label: "国潮" },
  { id: "fresh", label: "清新" },
];

const ASPECT_RATIOS = [
  { id: "9:16", label: "9:16 竖版" },
  { id: "16:9", label: "16:9 横版" },
  { id: "1:1", label: "1:1 方形" },
];

const DURATIONS_MAP = [
  { id: "15", label: "~15s" },
  { id: "30", label: "~30s" },
  { id: "60", label: "~60s" },
];

const RESOLUTIONS_MAP = [
  { id: "720p", label: "720p" },
  { id: "1080p", label: "1080p" },
  { id: "2k", label: "2K" },
];

const FRAME_RATES = [
  { id: "24", label: "24 fps" },
  { id: "30", label: "30 fps" },
  { id: "60", label: "60 fps" },
];

const GENERATION_COUNTS = [
  { id: "1", label: "1 个" },
  { id: "2", label: "2 个" },
  { id: "4", label: "4 个" },
];

const defaultVCForm: VCFormData = {
  productId: "",
  description: "",
  videoType: "influencer",
  style: "luxury",
  customStyle: "",
  aspectRatio: "9:16",
  duration: "30",
  resolution: "1080p",
  frameRate: "30",
  generationCount: "1",
  seed: "",
  negativePrompt: "",
  referenceWeight: "0.65",
  references: [],
};



const stageLabel: Record<VideoCreationStage, string> = {
  setup: "设置",
  outlining: "生成大纲",
  canvas: "编辑大纲",
  generating: "生成中",
  storyboard: "分镜调整",
  preview: "预览",
};

// ── Utility ───────────────────────────────────────────────────────────────────

/**
 * 只有 http/https 开头的真实 URL 才能渲染 video 播放器
 * mock 路径（/uploads/mock/...）或 picsum 图片都不算真实视频
 */
function isPlayableVideoUrl(url?: string): boolean {
  return typeof url === 'string' && /^https?:\/\//.test(url);
}

function parseDurationSeconds(value: unknown, fallback = 5): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) return Number(match[0]);
  }
  return fallback;
}

function normalizeStoryBeatFromAgent(raw: any, index: number): StoryBeat {
  const heading =
    raw.heading ||
    raw.scene ||
    raw.title ||
    raw["场景"] ||
    raw["画面"] ||
    raw["景别"] ||
    raw["镜号"] ||
    `分镜 ${index + 1}`;
  const description =
    raw.description ||
    raw.visual ||
    raw.prompt ||
    raw["画面内容"] ||
    raw["画面描述"] ||
    raw["内容"] ||
    "";

  return {
    id: String(raw.id || raw.shotId || raw["分镜编号"] || raw["镜号"] || `shot-${index + 1}`),
    order: index,
    heading: String(heading),
    description: String(description),
    subtitle: raw.subtitle || raw["字幕"] || "",
    voiceover: raw.voiceover || raw["台词"] || raw["旁白"] || "",
    duration: parseDurationSeconds(raw.duration || raw["时长"], 5),
    status: "pending",
  };
}

function displayBeatHeading(heading: string, index: number): string {
  const labels: Record<string, string> = {
    hook: "开场钩子",
    product_reveal: "产品亮相",
    key_selling_point: "核心卖点",
    usage_scene: "使用场景",
    result_cta: "转化引导",
  };
  return labels[heading] || heading || `分镜 ${index + 1}`;
}

const createConversation = (): Conversation => {
  const id = Date.now();
  return { id, title: "新会话", updatedAt: "刚刚", references: [], messages: [] };
};

const loadConversations = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [firstConversation];
    const parsed = JSON.parse(saved) as Conversation[];
    return parsed.length ? parsed : [firstConversation];
  } catch {
    return [firstConversation];
  }
};

const normalizeRemoteConversations = (items: unknown[]): Conversation[] =>
  items
    .map((item) => item as Partial<Conversation>)
    .filter((item) => item.id && item.title)
    .map((item) => ({
      id: item.id as number | string,
      title: String(item.title),
      updatedAt: String(item.updatedAt || "刚刚"),
      pinned: Boolean(item.pinned),
      references: Array.isArray(item.references) ? item.references.map(String) : [],
      messages: Array.isArray(item.messages) ? (item.messages as ChatMessage[]) : [],
    }));

const makeConversationTitle = (text: string) => {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "新会话";
  return clean.length > 16 ? `${clean.slice(0, 16)}...` : clean;
};

const cleanAgentDisplayText = (text: string) => {
  if (!text) return "";
  return (text || "").replace(/```json\n[\s\S]*?\n```/g, "已完成处理。").replace(/```/g, "")
    .replace(/(?:Fast|Pro|Deep|Standard)\s*模式已收到。?\s*/g, "")
    .replace(/我先围绕/g, "我已围绕")
    .trim();
};

const getAgentReturnTarget = () => `${window.location.pathname}${window.location.search}`;
const defaultAgentModel = "Standard";

// ── VCInputBox: expanding chat input ─────────────────────────────────────────

interface VCInputBoxProps {
  form: VCFormData;
  onFormChange: (f: VCFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  onSkillClick: () => void;
  skillMenuOpen: boolean;
  quickActions: any[];
  runAction: (a: any) => void;
}

function VCInputBox({ form, onFormChange, onSubmit, loading, fileInputRef, expanded, setExpanded, onSkillClick, skillMenuOpen, quickActions, runAction }: VCInputBoxProps) {
  const [showProductList, setShowProductList] = useState(false);
  const [productOptions, setProductOptions] = useState<any[]>([...catalog]);
  const selectedProduct = productOptions.find((p) => p.id === form.productId);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const set = (key: keyof VCFormData, value: string) => onFormChange({ ...form, [key]: value });

  useEffect(() => {
    let mounted = true;
    const refreshProducts = async () => {
      try {
        const products = await api.products();
        if (mounted) setProductOptions(products);
      } catch {
        if (mounted) setProductOptions([...catalog]);
      }
    };
    const handleProductCreated = () => {
      refreshProducts();
      setExpanded(true);
      setShowProductList(true);
    };
    refreshProducts();
    window.addEventListener("tikframe:productCreated", handleProductCreated);
    return () => {
      mounted = false;
      window.removeEventListener("tikframe:productCreated", handleProductCreated);
    };
  }, [setExpanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const pill = document.querySelector('.vc-input-pill-container');
      if (pill && !pill.contains(e.target as Node)) {
        if (expanded && setExpanded) {
          setExpanded(false);
          setShowProductList(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, setExpanded]);

  return (
    <div className={`vc-input-pill-container ${expanded ? "vc-input-expanded" : ""}`} style={{position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto'}}>
      
      {/* 1. THE PILL FORM */}
      <form className="agent-search-pill" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{margin: 0, width: '100%', overflow: 'visible', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}}>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          onFocus={() => setExpanded?.(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
          }}
          placeholder="描述你想制作的视频..."
          rows={expanded ? 3 : 2}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="agent-hidden-file"
          onChange={(e) => {
            if (e.target.files) {
              onFormChange({
                ...form,
                references: [...form.references, ...Array.from(e.target.files).map((f) => f.name)],
              });
            }
          }}
        />
        
        {/* Row 2 Buttons */}
        <button type="button" className="agent-attach-button" aria-label="附加文件" onClick={() => fileInputRef.current?.click()}>
          <Paperclip size={20} />
        </button>
        <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={onSkillClick}>
          <Wrench size={19} />使用技能
        </button>
        <button type="submit" className="agent-send-inline" aria-label="生成视频方案" title="生成视频方案" disabled={loading || !form.description.trim()}>
          {loading ? <Loader2 size={16} className="vc-spin" /> : <Send size={18} />}
        </button>
        
        {/* SKILLS DROPDOWN */}
        {skillMenuOpen && quickActions && runAction && (
          <div className="agent-skill-menu" onMouseDown={(e) => e.stopPropagation()}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} type="button" onClick={() => runAction(action)}>
                  <Icon size={17} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. THE EXPAND PANEL (Positioned beautifully INSIDE the pill) */}
        <div className={`vc-input-expand-panel ${expanded ? "vc-panel-open" : "vc-panel-closed"}`} style={{
          gridColumn: '1 / -1', gridRow: 3,
          paddingTop: expanded ? '12px' : '0', 
          marginTop: expanded ? '12px' : '0',
          borderTop: expanded ? '1px solid #e2e8f0' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Product Selector */}
          <div className="vc-expand-row">
            <span className="vc-expand-label">选择商品</span>
            <div className="vc-product-selector" style={{ flex: 1, minWidth: 0 }}>
              <button
                type="button"
                className="vc-product-btn-inline"
                onClick={() => setShowProductList((v) => !v)}
              >
                {selectedProduct ? (
                  <>
                    {selectedProduct.mainImage && (
                      <img src={selectedProduct.mainImage} alt={selectedProduct.name} style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
                    )}
                    <span style={{fontWeight: 500}}>{selectedProduct.name}</span>
                  </>
                ) : (
                  <span style={{ color: "rgba(23,23,25,0.4)" }}>选择商品...</span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginLeft: "auto" }}><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {showProductList && (
                <div className="vc-product-list vc-product-card-list vc-product-panel-list" style={{boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #eee'}}>
                  {productOptions.map((p) => {
                    const sellingPoint = productScripts[p.id]?.[0]?.content?.[1]?.body ?? `${p.category}商品，已整理可用于视频生成的商品素材。`;
                    return (
                      <div key={p.id} className={`vc-product-card-option ${form.productId === p.id ? "active" : ""}`}>
                        {p.mainImage && <img src={p.mainImage} alt={p.name} />}
                        <div className="vc-product-card-info">
                          <strong>{p.name}</strong>
                          <span>{p.category}</span>
                          <small>{sellingPoint}</small>
                          <em>{p.assetCount} 个素材</em>
                        </div>
                        <div className="vc-product-card-actions">
                          <button
                            type="button"
                            onClick={() => {
                              window.history.pushState({}, "", `/products/${p.id}`);
                              window.dispatchEvent(new PopStateEvent("popstate"));
                              setShowProductList(false);
                              window.dispatchEvent(new HashChangeEvent("hashchange"));
                            }}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="primary"
                            onClick={() => { set("productId", p.id); setShowProductList(false); }}
                          >
                            {form.productId === p.id ? "已选" : "选择"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="vc-product-add-entry"
                    onClick={() => {
                      setShowProductList(false);
                      window.sessionStorage.setItem("vibegen:add-product-return", window.location.pathname + window.location.search + window.location.hash);
                      window.history.pushState({}, "", "/products");
                      window.dispatchEvent(new PopStateEvent("popstate"));
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("tikframe:openAddProduct"));
                      }, 0);
                    }}
                  >
                    + 添加商品
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* References */}
          {form.references.length > 0 && (
            <div className="vc-expand-row" style={{ paddingTop: 0 }}>
              <span className="vc-expand-label" />
              {form.references.map((ref, i) => (
                <div key={i} className="vc-ref-thumb" style={{background: '#f1f5f9', borderRadius: '8px', padding: '4px 8px'}}>
                  <ImagePlus size={14} style={{ opacity: 0.6 }} />
                  <span style={{fontSize: 13}}>{ref}</span>
                  <button type="button" onClick={() => onFormChange({ ...form, references: form.references.filter((_, j) => j !== i) })}><X size={13} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="vc-expand-divider" style={{margin: '12px 0'}} />

          {/* Type & Style */}
          <div className="vc-expand-row">
            <span className="vc-expand-label">类型与风格</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div className="vc-pill-row">
                {VIDEO_TYPES.map((t) => (
                  <button key={t.id} type="button" className={`vc-pill ${form.videoType === t.id ? "active" : ""}`} onClick={() => onFormChange({ ...form, videoType: t.id, style: form.style === "custom" ? "" : form.style })}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="vc-pill-row">
                {STYLE_PRESETS.map((s) => (
                  <button key={s.id} type="button" className={`vc-pill ${form.style === s.id ? "active" : ""}`} onClick={() => { onFormChange({ ...form, style: s.id, customStyle: "" }); }}>
                    {s.label}
                  </button>
                ))}
                <input
                  className={`vc-pill vc-pill-input ${form.style === "custom" ? "active" : ""}`}
                  placeholder="自定义风格..."
                  value={form.customStyle}
                  onFocus={() => onFormChange({ ...form, videoType: "", style: "custom" })}
                  onChange={(e) => onFormChange({ ...form, videoType: "", customStyle: e.target.value, style: "custom" })}
                />
              </div>
            </div>
          </div>

          <div className="vc-expand-divider" style={{margin: '12px 0'}} />

          {/* Parameters */}
          <div className="vc-expand-row">
            <span className="vc-expand-label">参数设置</span>
            <div className="vc-param-grid">
              <label className="vc-param-field">
                <span>视频比例</span>
                <select className="vc-custom-select" value={form.aspectRatio} onChange={(e) => set("aspectRatio", e.target.value)}>
                  {ASPECT_RATIOS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>
              
              <label className="vc-param-field">
                <span>时长</span>
                <select className="vc-custom-select" value={form.duration} onChange={(e) => set("duration", e.target.value)}>
                  {DURATIONS_MAP.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </label>

              <label className="vc-param-field">
                <span>分辨率</span>
                <select className="vc-custom-select" value={form.resolution} onChange={(e) => set("resolution", e.target.value)}>
                  {RESOLUTIONS_MAP.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>

              <label className="vc-param-field">
                <span>帧率</span>
                <select className="vc-custom-select" value={form.frameRate} onChange={(e) => set("frameRate", e.target.value)}>
                  {FRAME_RATES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>

              <label className="vc-param-field">
                <span>生成数量</span>
                <select className="vc-custom-select" value={form.generationCount} onChange={(e) => set("generationCount", e.target.value)}>
                  {GENERATION_COUNTS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>

              <label className="vc-param-field">
                <span>随机种子</span>
                <input className="vc-custom-select" value={form.seed} placeholder="自动" onChange={(e) => set("seed", e.target.value)} />
              </label>

              <label className="vc-param-field vc-param-wide">
                <span>负面提示词</span>
                <input className="vc-custom-select" value={form.negativePrompt} placeholder="如：模糊、低清、畸变" onChange={(e) => set("negativePrompt", e.target.value)} />
              </label>

              <label className="vc-param-field">
                <span>参考素材权重</span>
                <input className="vc-custom-select" type="number" min="0" max="1" step="0.05" value={form.referenceWeight} onChange={(e) => set("referenceWeight", e.target.value)} />
              </label>
            </div>
          </div>
        </div>
            </form>
      
      {showAddProduct && (
        <div style={{position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => setShowAddProduct(false)}>
          <div style={{background: '#fff', padding: 24, borderRadius: 20, width: 480, boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>录入新商品</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <input placeholder="商品名称" style={{padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', outline: 'none'}} />
              <input placeholder="商品卖点/描述" style={{padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', outline: 'none'}} />
              <button style={{padding: '12px', background: '#f1f5f9', border: '1px dashed #ccc', borderRadius: 10, color: '#666'}}>+ 上传商品主图</button>
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end'}}>
              <button onClick={() => setShowAddProduct(false)} style={{padding: '8px 16px', borderRadius: 8, background: '#f1f5f9'}}>取消</button>
              <button onClick={() => setShowAddProduct(false)} style={{padding: '8px 16px', borderRadius: 8, background: '#0f172a', color: '#fff'}}>保存录入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── StoryboardAdjustView ──────────────────────────────────────────────────────

interface StoryboardAdjustViewProps {
  project: VideoProjectData;
  onUpdateBeat: (id: string, description: string) => void;
  onDeleteBeat: (id: string) => void;
  onRegenerateBeat: (id: string) => void;
  onGenerateClip: (id: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  onReorderBeats: (newBeats: VideoProjectData["storyBeats"]) => void;
  onUpdateProject: (data: Partial<VideoProjectData>) => void;
}

function StoryboardAdjustView({ project, onUpdateBeat, onDeleteBeat, onRegenerateBeat, onGenerateClip, onConfirm, onBack, onReorderBeats, onUpdateProject }: StoryboardAdjustViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedBeatId, setDraggedBeatId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedBeatId(id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedBeatId(null);
    if (e.target instanceof HTMLElement) e.target.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBeatId || draggedBeatId === targetId) return;

    const sourceIndex = project.storyBeats.findIndex((b) => b.id === draggedBeatId);
    const targetIndex = project.storyBeats.findIndex((b) => b.id === targetId);
    
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newBeats = Array.from(project.storyBeats);
    const [removed] = newBeats.splice(sourceIndex, 1);
    newBeats.splice(targetIndex, 0, removed);
    
    onReorderBeats(newBeats);
  };

  return (
    <div className="vc-storyboard-adjust">
      {/* Header */}
      <div className="vc-storyboard-header">
        <h2 className="vc-storyboard-title">粗略分镜调整</h2>
        <p className="vc-storyboard-subtitle">点击文案可直接编辑，对不满意的镜头单独重新生成，确认后进入精剪</p>
      </div>

      {/* Storyboard grid */}
      <div className="vc-storyboard-grid">
        {project.storyBeats.map((beat, i) => (
          <div 
            key={beat.id} 
            className={`vc-shot-card ${beat.status} ${draggedBeatId === beat.id ? 'dragging' : ''}`}
            draggable={beat.status !== 'generating'}
            onDragStart={(e) => handleDragStart(e, beat.id)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, beat.id)}
            style={{ cursor: beat.status !== 'generating' ? 'grab' : 'default' }}
          >
            {/* Thumbnail */}
            <div className="vc-shot-thumb">
              {beat.status === "generated" && isPlayableVideoUrl(beat.videoClipUrl) ? (
                <video src={beat.videoClipUrl} controls autoPlay loop style={{width: "100%", height: "100%", objectFit: "cover"}} />
              ) : beat.status === "generating" ? (
                <div className="vc-shot-placeholder">
                  <Loader2 size={22} className="vc-spin" style={{ color: "#4684EE" }} />
                  <span style={{ fontSize: 11, color: "#4684EE", fontWeight: 600, marginTop: 4 }}>视频生成中</span>
                </div>
              ) : beat.status === "prompt_ready" ? (
                <div className="vc-shot-placeholder" style={{ flexDirection: 'column', gap: 6 }}>
                  <FileText size={20} style={{ color: "#94a3b8" }} />
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textAlign: 'center' }}>Prompt 已生成，等待生成视频</span>
                </div>
              ) : beat.status === "failed" ? (
                <div className="vc-shot-placeholder" style={{ flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>生成失败</span>
                  {beat.errorMessage && <span style={{ fontSize: 10, color: "#ef4444", textAlign: 'center', padding: '0 8px' }}>{beat.errorMessage}</span>}
                </div>
              ) : (
                <div className="vc-shot-placeholder">
                  <Film size={22} />
                </div>
              )}
            </div>

            {/* Shot info */}
            <div className="vc-shot-info">
              <div className="vc-shot-meta">
                <span className="vc-shot-num">{i + 1}</span>
                <span className="vc-shot-tag">{displayBeatHeading(beat.heading, i)}</span>
                <span className="vc-shot-dur">{beat.duration}s</span>
              </div>
              {editingId === beat.id ? (
                <textarea
                  autoFocus
                  className="vc-shot-desc-edit"
                  value={beat.description}
                  onChange={(e) => onUpdateBeat(beat.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  rows={3}
                />
              ) : (
                <p
                  className="vc-shot-desc"
                  onClick={() => setEditingId(beat.id)}
                  title="点击编辑"
                >
                  {beat.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="vc-shot-actions">
              <button
                type="button"
                onClick={() => onRegenerateBeat(beat.id)}
                title="重新生成文案"
                aria-label={`重新生成第 ${i + 1} 个镜头文案`}
                disabled={beat.status === "generating"}
              >
                <RefreshCw size={13} />
              </button>
              <button
                type="button"
                onClick={() => onGenerateClip(beat.id)}
                title="生成该镜头视频"
                aria-label={`生成第 ${i + 1} 个镜头视频`}
                disabled={beat.status === "generating"}
              >
                <Film size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteBeat(beat.id)}
                title="删除镜头"
                aria-label={`删除第 ${i + 1} 个镜头`}
                className="vc-shot-delete-btn"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {/* Add shot card */}
        <button type="button" className="vc-shot-add">
          <Plus size={20} />
          <span>添加镜头</span>
        </button>
      </div>

      {/* Footer */}
      <div className="vc-storyboard-footer">
        <button type="button" className="vc-storyboard-back-btn" onClick={onBack}>
          <ChevronLeft size={16} />
          返回修改大纲
        </button>
        <button type="button" className="vc-storyboard-confirm-btn" onClick={onConfirm}>
          <Scissors size={16} />
          确认分镜，进入精剪
        </button>
      </div>
    </div>
  );
}

// ── ProjectCanvasView ─────────────────────────────────────────────────────────

interface ProjectCanvasViewProps {
  project: VideoProjectData;
  stage: VideoCreationStage;
  editingBeatId: string | null;
  onEditBeat: (id: string | null) => void;
  onUpdateBeat: (id: string, description: string) => void;
  onUpdateBeatFields?: (id: string, data: Partial<StoryBeat>) => void;
  onRegenerateBeat: (id: string) => void;
  onAddRef: () => void;
  onUpdateProject?: (data: Partial<VideoProjectData>) => void;
  loading?: boolean;
}

function ProjectCanvasView({ project, stage, editingBeatId, loading, onEditBeat, onUpdateBeat, onUpdateBeatFields, onRegenerateBeat, onAddRef, onUpdateProject }: ProjectCanvasViewProps) {
  const completedCount = project.storyBeats.filter((b) => b.status === "generated").length;
  const isCanvas = stage === "canvas";
  const isGenerating = stage === "generating";

  return (
    <div className="vc-canvas-doc">
      <h2 className="vc-canvas-title">{project.title}</h2>

      {/* Summary */}
      <div className="vc-canvas-section">
        <div className="vc-canvas-section-label">视频概要</div>
        <p className="vc-canvas-summary">{project.summary}</p>
      </div>

      {/* Settings chips */}
      <div className="vc-canvas-chips-row">
        <span className="vc-canvas-chip">{project.aspectRatio}</span>
        <span className="vc-canvas-chip">~{project.duration}s</span>
        <span className="vc-canvas-chip">{project.resolution}</span>
        {project.frameRate && <span className="vc-canvas-chip">{project.frameRate}fps</span>}
        {project.generationCount && <span className="vc-canvas-chip">{project.generationCount} 个结果</span>}
        <span className="vc-canvas-chip">
          {STYLE_PRESETS.find((s) => s.id === project.style)?.label || project.style}
        </span>
        <span className="vc-canvas-chip">
          {VIDEO_TYPES.find((t) => t.id === project.videoType)?.label || project.videoType}
        </span>
      </div>

      {onUpdateProject && isCanvas && (
        <div className="vc-canvas-edit-row">
          <label>
            <span>视频比例</span>
            <select value={project.aspectRatio} onChange={(e) => onUpdateProject({ aspectRatio: e.target.value })}>
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.id} value={ratio.id}>{ratio.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>时长</span>
            <select value={project.duration} onChange={(e) => onUpdateProject({ duration: e.target.value })}>
              {DURATIONS_MAP.map((duration) => (
                <option key={duration.id} value={duration.id}>{duration.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>分辨率</span>
            <select value={project.resolution} onChange={(e) => onUpdateProject({ resolution: e.target.value })}>
              {RESOLUTIONS_MAP.map((resolution) => (
                <option key={resolution.id} value={resolution.id}>{resolution.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>视频类型</span>
            <select value={project.videoType} onChange={(e) => onUpdateProject({ videoType: e.target.value })}>
              {VIDEO_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>风格</span>
            <select value={project.style} onChange={(e) => onUpdateProject({ style: e.target.value })}>
              {STYLE_PRESETS.map((style) => (
                <option key={style.id} value={style.id}>{style.label}</option>
              ))}
            </select>
          </label>
          <label className="vc-canvas-edit-wide">
            <span>完整提示词</span>
            <textarea value={project.fullPrompt || project.summary} onChange={(e) => onUpdateProject({ fullPrompt: e.target.value })} rows={3} />
          </label>
        </div>
      )}

      {/* Visual References */}
      <div className="vc-canvas-section">
        <div className="vc-canvas-section-label">商品素材</div>
        <div className="vc-refs-grid">
          {project.visualRefs.map((ref) => (
            <div key={ref.id} className="vc-ref-card">
              {ref.url ? (
                <img src={ref.url} alt={ref.label} className="vc-ref-img" />
              ) : (
                <div className="vc-ref-placeholder">
                  <ImagePlus size={22} />
                </div>
              )}
              <span className="vc-ref-label">{ref.label}</span>
              <small className="vc-ref-type">
                {ref.type === "brand" ? "商品" : ref.type === "character" ? "人物" : ref.type === "scene" ? "场景" : "参考"}
              </small>
            </div>
          ))}
          <button type="button" className="vc-ref-add" onClick={onAddRef} title="添加商品素材">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Story Beats */}
      <div className="vc-canvas-section">
        <div className="vc-canvas-section-label">
          分镜
          {isGenerating && (
            <span className="vc-canvas-progress-label">
              {completedCount}/{project.storyBeats.length}
            </span>
          )}
        </div>
        <div className="vc-beats-list">
          {loading ? (
            // Skeleton loading animation
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="vc-beat-item vc-beat-skeleton" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="vc-beat-header">
                  <div className="vc-beat-num vc-skeleton-circle" />
                  <div className="vc-beat-info">
                    <div className="vc-skeleton-line" style={{ width: `${60 + i * 8}%`, height: 14, borderRadius: 4, marginBottom: 6 }} />
                    <div className="vc-skeleton-line" style={{ width: `${40 + i * 5}%`, height: 11, borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
          project.storyBeats.map((beat, i) => (
            <div key={beat.id} className={`vc-beat-item ${beat.status}`}>
              <div className="vc-beat-header">
                <div className="vc-beat-num">{i + 1}</div>
                <div className="vc-beat-info">
                  <span className="vc-beat-heading">{displayBeatHeading(beat.heading, i)}</span>
                  {beat.status === "generating" && (
                    <Loader2 size={13} className="vc-spin vc-beat-loading" />
                  )}
                  {beat.status === "generated" && (
                    <Check size={13} className="vc-beat-done-icon" />
                  )}
                  <span className="vc-beat-duration">{beat.duration}s</span>
                </div>
                {beat.status === "generated" && (
                  <div className="vc-beat-actions">
                    <button
                      type="button"
                      className="vc-beat-action-btn"
                      title="重新生成此镜头"
                      onClick={() => onRegenerateBeat(beat.id)}
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Description (editable in canvas mode) */}
              {isCanvas && (
                <div className="vc-beat-description">
                  <label className="vc-beat-edit-field">
                    <span>分镜</span>
                  {editingBeatId === beat.id ? (
                    <textarea
                      autoFocus
                      className="vc-beat-desc-edit"
                      value={beat.description}
                      onChange={(e) => onUpdateBeat(beat.id, e.target.value)}
                      onBlur={() => onEditBeat(null)}
                      rows={3}
                    />
                  ) : (
                    <p
                      className="vc-beat-desc-text"
                      onClick={() => onEditBeat(beat.id)}
                      title="点击编辑"
                    >
                      {beat.description}
                    </p>
                  )}
                  </label>
                  <label className="vc-beat-edit-field">
                    <span>字幕</span>
                    <textarea
                      value={beat.subtitle ?? beat.heading}
                      onChange={(e) => onUpdateBeatFields?.(beat.id, { subtitle: e.target.value })}
                      rows={2}
                    />
                  </label>
                  <label className="vc-beat-edit-field">
                    <span>口播</span>
                    <textarea
                      value={beat.voiceover ?? beat.description}
                      onChange={(e) => onUpdateBeatFields?.(beat.id, { voiceover: e.target.value })}
                      rows={2}
                    />
                  </label>
                </div>
              )}

              {/* Progress bar while generating */}
              {beat.status === "generating" && (
                <div className="vc-beat-progress-bar">
                  <div className="vc-beat-progress-fill" />
                </div>
              )}
            </div>
          )))}

        </div>
      </div>
    </div>
  );
}

// ── Main AgentDock Component ──────────────────────────────────────────────────

export default function AgentDock({ children }: AgentDockProps) {
  const initialConversationsRef = useRef<Conversation[] | null>(null);
  if (!initialConversationsRef.current) {
    initialConversationsRef.current = loadConversations();
  }

  // ── Existing state ──────────────────────────────────────────────────────────
  const [open, setOpen] = useState(() => window.location.hash === "#agent");
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(initialConversationsRef.current);
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversationsRef.current[0]?.id ?? firstConversation.id,
  );
  const [attachments, setAttachments] = useState<string[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [conversationMenuId, setConversationMenuId] = useState<number | string | null>(null);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vcFileInputRef = useRef<HTMLInputElement>(null);
  const vcCanvasRightRef = useRef<HTMLDivElement>(null);

  // ── Sidebar collapse state ──────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Video creation state ────────────────────────────────────────────────────
  const [videoCreationMode, setVideoCreationMode] = useState(() => window.location.hash === "#agent");
  const [vcStage, setVcStage] = useState<VideoCreationStage>("setup");
  const [vcProject, setVcProject] = useState<VideoProjectData | null>(null);
  const [vcLoading, setVcLoading] = useState(false);
  const [editingBeatId, setEditingBeatId] = useState<string | null>(null);
  const [vcInputExpanded, setVcInputExpanded] = useState(false);
  const [vcSessions, setVcSessions] = useState<VCSession[]>([]);
  const [activeVcSessionId, setActiveVcSessionId] = useState<string | null>(null);
  const [vcCanvasInput, setVcCanvasInput] = useState("");
  const [vcForm, setVcForm] = useState<VCFormData>({ ...defaultVCForm });
  const [vcProgressMsg, setVcProgressMsg] = useState<string>("");
  const [outlineError, setOutlineError] = useState<string | null>(null);

  // ── Derived state ───────────────────────────────────────────────────────────
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  );

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        const bTime = new Date(b.updatedAt).getTime() || Number(b.id) || 0;
        const aTime = new Date(a.updatedAt).getTime() || Number(a.id) || 0;
        return bTime - aTime;
      }),
    [conversations],
  );

  const isEmptyConversation = !activeConversation || activeConversation.messages.length === 0;

  // Auto-collapse sidebar in canvas mode
  useEffect(() => {
    if (videoCreationMode && vcStage !== "setup") {
      setSidebarCollapsed(true);
    }
  }, [videoCreationMode, vcStage]);

  useEffect(() => {
    if (!vcProject?.storyBeats.length || vcStage !== "canvas" || vcLoading) return;
    const container = vcCanvasRightRef.current;
    const beats = container?.querySelector(".vc-beats-list") as HTMLElement | null;
    if (!container || !beats) return;
    container.scrollTo({ top: Math.max(0, beats.offsetTop - 24), behavior: "smooth" });
  }, [vcProject?.storyBeats.length, vcStage, vcLoading]);

  useEffect(() => {
    if (!skillMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const menus = Array.from(document.querySelectorAll(".agent-skill-menu"));
      const buttons = Array.from(document.querySelectorAll(".agent-skill-button"));
      const clickedInside = [...menus, ...buttons].some((node) => node.contains(target));

      if (!clickedInside) {
        setSkillMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [skillMenuOpen]);

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    let cancelled = false;
    api.agentConversations()
      .then((result) => {
        if (cancelled) return;
        const remote = normalizeRemoteConversations(result.items || []);
        if (!remote.length) return;
        setConversations(remote);
        setActiveConversationId((current) =>
          remote.some((c) => c.id === current) ? current : remote[0].id,
        );
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (window.location.hash === "#agent" && !window.history.state?.[agentHistoryFlag]) {
      window.history.replaceState(
        { ...(window.history.state ?? {}), [agentHistoryFlag]: true, returnTo: getAgentReturnTarget() },
        "",
        window.location.href,
      );
    }
    const onPopState = () => {
      const isOpen = window.location.hash === "#agent";
      setOpen(isOpen);
      if (isOpen) setVideoCreationMode(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Handle tikframe:openVideoCreation event
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId?: string }>;
      const productId = customEvent.detail?.productId;

      const newForm = { ...defaultVCForm, productId: productId || "" };
      setVcForm(newForm);

      const next = createConversation();
      setConversations((prev) => [next, ...prev]);
      setActiveConversationId(next.id);

      setVideoCreationMode(true);
      setVcStage("setup");
      setVcProject(null);
      setVcLoading(false);
      setVcInputExpanded(false);

      if (window.location.hash !== "#agent") {
        const returnTo = getAgentReturnTarget();
        window.history.pushState(
          { [agentHistoryFlag]: true, returnTo },
          "",
          `${returnTo}#agent`,
        );
      }
      setOpen(true);
    };
    window.addEventListener("tikframe:openVideoCreation", handler);
    return () => window.removeEventListener("tikframe:openVideoCreation", handler);
  }, []);

  // ── Existing handlers ───────────────────────────────────────────────────────

  const openAgent = () => {
    if (!open && window.location.hash !== "#agent") {
      const returnTo = getAgentReturnTarget();
      window.history.pushState(
        { ...(window.history.state ?? {}), [agentHistoryFlag]: true, returnTo },
        "",
        `${returnTo}#agent`,
      );
    }
    setOpen(true);
  };

  const returnToPreviousPage = () => {
    const target = window.history.state?.returnTo ?? getAgentReturnTarget();
    window.history.replaceState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setOpen(false);
  };

  const goToPreviousAgentStep = () => {
    setSkillMenuOpen(false);

    if (vcStage === "storyboard") {
      setVcStage("canvas");
      return;
    }

    if (vcStage === "canvas" || vcStage === "outlining") {
      setVcStage("setup");
    }
  };

  const startNewConversation = () => {
    const next = createConversation();
    setConversations((prev) => [next, ...prev]);
    setActiveConversationId(next.id);
    setInput("");
    setAttachments([]);
    setConversationMenuId(null);
    setSkillMenuOpen(false);
  };

  const selectConversation = (id: number | string) => {
    setActiveConversationId(id);
    setInput("");
    setConversationMenuId(null);
    setSkillMenuOpen(false);
  };

  const togglePinConversation = (id: number | string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned, updatedAt: "刚刚" } : c)),
    );
    setConversationMenuId(null);
  };

  const renameConversation = (id: number | string) => {
    const current = conversations.find((c) => c.id === id);
    const nextTitle = window.prompt("重命名会话", current?.title ?? "新会话");
    if (!nextTitle?.trim()) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: nextTitle.trim(), updatedAt: "刚刚" } : c)),
    );
    setConversationMenuId(null);
  };

  const deleteConversation = (id: number | string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const next = createConversation();
        setActiveConversationId(next.id);
        return [next];
      }
      if (activeConversationId === id) setActiveConversationId(remaining[0].id);
      return remaining;
    });
    setConversationMenuId(null);
  };

  const addLibraryItem = (item: LibraryItem) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, references: Array.from(new Set([...c.references, item.title])) }
          : c
      )
    );
  };
  const submitInput = async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || agentLoading) return;
    const userText = text || `分析这些附件`;
    setInput("");
    setAttachments([]);
    setSkillMenuOpen(false);
    const base = Date.now();

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversationId) return c;
        const shouldRename = c.title === firstConversation.title || c.title === "新会话";
        return {
          ...c,
          title: shouldRename ? makeConversationTitle(userText) : c.title,
          updatedAt: "刚刚",
          messages: [
            ...c.messages,
            { id: base, role: "user" as const, text: userText },
            { id: base + 1, role: "agent" as const, text: "" },
          ],
        };
      }),
    );
    setAgentLoading(true);

    try {
      let streamedText = "";
      await api.agentChatStream(
        {
          message: userText,
          messages: activeConversation?.messages || [],
          conversationId: activeConversationId,
          context: vcProject,
          projectMeta: vcProject,
        },
        (text: string, toolCall: any, toolResult: any) => {
          if (text) {
            streamedText += text;
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeConversationId
                  ? { ...c, messages: c.messages.map((m) => m.id === base + 1 ? { ...m, text: streamedText } : m) }
                  : c,
              ),
            );
          }
          if (toolResult?.type === "edit_storyboard" && toolResult.newText) {
            try {
              const newBeats = JSON.parse(toolResult.newText);
              if (Array.isArray(newBeats)) {
                setVcProject((prev) =>
                  prev ? { ...prev, storyBeats: newBeats.map(normalizeStoryBeatFromAgent) } : null,
                );
              }
            } catch {}
          }
        },
      );
    } catch (error) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: c.messages.map((m) => m.id === base + 1 ? { ...m, text: error instanceof Error ? `出错：${error.message}` : "Agent 暂时不可用。" } : m) }
            : c,
        ),
      );
    } finally {
      setAgentLoading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setAttachments((prev) => [...prev, ...Array.from(files).map((f) => f.name)]);
  };

  const selectImageCandidate = (candidate: AgentImageCandidate) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              references: Array.from(new Set([...c.references, candidate.title])),
              updatedAt: "刚刚",
              messages: [
                ...c.messages,
                { id: Date.now(), role: "agent" as const, text: `已选择「${candidate.title}」。你可以继续让我用这张图做图生视频，或者让我改风格、构图、光线。` },
              ],
            }
          : c,
      ),
    );
    setInput(`用「${candidate.title}」生成 6 秒图生视频，风格：${candidate.style || "高级电商"}，运镜要自然`);
  };

  const requestVideoFromImage = (candidate: AgentImageCandidate) => {
    setInput(`用「${candidate.title}」做一个 6 秒图生视频，风格参考：${candidate.style || "高级电商"}，提示词：${candidate.prompt}`);
  };

  const runAction = (action: any) => {
    setSkillMenuOpen(false);
    setVcCanvasInput(action.prompt);
    setInput(action.prompt);
  };

  // ── Video creation handlers ─────────────────────────────────────────────────

  const handleOpenVideoCreation = () => {
    const newForm = { ...defaultVCForm };
    setVcForm(newForm);
    const next = createConversation();
    setConversations((prev) => [next, ...prev]);
    setActiveConversationId(next.id);
    setVideoCreationMode(true);
    setVcStage("setup");
    setVcProject(null);
    setVcLoading(false);
    setOutlineError(null);
    setVcInputExpanded(false);
    setInput("");
    setAttachments([]);
    openAgent();
  };

  const handleVCFormSubmit = async () => {
    const desc = vcForm.description.trim();
    if (!desc) return;

    // Short prompt: ask for more info, don't block UI
    if (desc.length < 8) {
      alert("描述太简短了，请补充商品信息、风格和目标受众（至少8个字）！");
      return;
    }

    setOutlineError(null);

    let currentConversationId = activeConversationId;
    if (!activeConversation) {
      const next = { id: Date.now(), title: "新会话", messages: [] as { id: number; role: "user" | "agent"; text: string }[], updatedAt: "刚刚" };
      setConversations((prev) => [next as any, ...prev]);
      setActiveConversationId(next.id);
      currentConversationId = next.id;
    }

    const product = [...catalog].find((p) => p.id === vcForm.productId);
    const productName = (product?.name || desc.slice(0, 12).trim() || "我的商品").trim();
    const videoTypeLabel = VIDEO_TYPES.find((t) => t.id === vcForm.videoType)?.label ?? vcForm.videoType;
    const styleLabel = vcForm.customStyle || (STYLE_PRESETS.find((s) => s.id === vcForm.style)?.label ?? vcForm.style);

    const visualRefs: VisualRef[] = [];
    if (product?.mainImage) visualRefs.push({ id: "r1", type: "brand", label: "商品主图", url: product.mainImage });
    if (vcForm.videoType === "influencer" || vcForm.videoType === "skit") {
      visualRefs.push({ id: "r2", type: "character", label: "带货主播", url: "" });
    }

    const projectData: VideoProjectData = {
      title: `${productName} · ${videoTypeLabel}`,
      summary: "正在等待 AI 分析商品和生成脚本...",
      fullPrompt: vcForm.description,
      productName,
      videoType: vcForm.videoType,
      style: vcForm.style,
      aspectRatio: vcForm.aspectRatio,
      duration: vcForm.duration,
      resolution: vcForm.resolution,
      frameRate: vcForm.frameRate,
      generationCount: vcForm.generationCount,
      seed: vcForm.seed,
      negativePrompt: vcForm.negativePrompt,
      referenceWeight: vcForm.referenceWeight,
      storyBeats: [],
      visualRefs,
    };

    setVcProject(projectData);
    setVcStage("canvas");

    const sessionId = `session-${Date.now()}`;
    const newSession: VCSession = {
      id: sessionId,
      conversationId: currentConversationId,
      title: projectData.title,
      videoType: vcForm.videoType,
      stage: "canvas",
      thumbnail: product?.mainImage,
      createdAt: "刚刚",
      project: projectData,
      form: { ...vcForm },
    };
    setVcSessions((prev) => [newSession, ...prev]);
    setActiveVcSessionId(sessionId);

    // 2. Show "generating" message in chat
    const genMsgId = Date.now();
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              title: `${productName} ${videoTypeLabel}`,
              updatedAt: "刚刚",
              messages: [
                ...c.messages,
                { id: genMsgId, role: "agent" as const, text: `正在为「${productName}」生成 AI 分镜方案，请稍候...` },
              ],
            }
          : c,
      ),
    );

    // 3. Background generation — updates beats when ready
    try {
      setVcLoading(true);
      const agentRes = await api.agentGenerateStream({
        productName,
        productDescription: (product as any)?.description || vcForm.description,
        sellingPoints: (product as any)?.sellingPoints || [],
        tone: styleLabel,
        platform: "抖音",
        duration: parseInt(vcForm.duration) || 30,
        videoType: vcForm.videoType,
        style: vcForm.style,
        aspectRatio: vcForm.aspectRatio,
        userPrompt: vcForm.description,
      }, (msg, state) => { 
        if (msg) {
          setVcProgressMsg(msg);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === currentConversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === genMsgId
                        ? { ...m, text: `AI 正在生成：${msg}` }
                        : m,
                    ),
                  }
                : c,
            ),
          );
        }
        
        // 实时更新分析和脚本进度到 Summary
        if (state) {
          setVcProject((prev) => {
            if (!prev) return prev;
            let newSummary = prev.summary;
            if (state.script && state.script.hook) {
              newSummary = `【AI脚本已生成】\n开场钩子：${state.script.hook}\n主要内容：${state.script.body || ""}\n结尾引导：${state.script.cta || ""}`;
            } else if (state.analysis && state.analysis.corePainPoint) {
              newSummary = `【AI商品分析】\n核心痛点：${state.analysis.corePainPoint}\n核心卖点：${(state.analysis.keySellingPoints || []).join("、")}`;
            }
            
            // 如果有了分镜数据，立刻刷新
            let newBeats = prev.storyBeats;
            if (Array.isArray(state.storyboard) && state.storyboard.length > 0) {
              newBeats = state.storyboard.map((s: any, idx: number) => ({
                id: String(s.shotId || `shot-${idx + 1}`),
                order: idx,
                heading: s.scene || s.heading || `分镜 ${idx + 1}`,
                description: s.visual || s.subtitle || s.description || "",
                subtitle: s.subtitle || "",
                voiceover: s.voiceover || "",
                duration: s.duration || 5,
                status: "pending" as const,
              }));
            }
            return { ...prev, summary: newSummary, storyBeats: newBeats };
          });
        }
      }) as any;

      const generatedData = (agentRes as any)?.data || agentRes;
      const rawBeats = generatedData?.storyboard;
      if (Array.isArray(rawBeats) && rawBeats.length > 0) {
        const beats: StoryBeat[] = rawBeats.map((s: any, idx: number) => ({
          id: String(s.shotId || `shot-${idx + 1}`),
          order: idx,
          heading: s.scene || s.heading || `分镜 ${idx + 1}`,
          description: s.visual || s.subtitle || s.description || "",
          subtitle: s.subtitle || "",
          voiceover: s.voiceover || "",
          duration: s.duration || 5,
          status: "pending" as const,
        }));
        setVcProject((prev) => prev ? { ...prev, storyBeats: beats } : null);

        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === genMsgId
                      ? { ...m, text: `✅ 分镜已生成！共 ${beats.length} 个场景，风格：${styleLabel}，比例 ${vcForm.aspectRatio}，时长约 ${vcForm.duration}s。\n\n在下方输入框告诉我怎么调整，或直接点击分镜卡片编辑。` }
                      : m,
                  ),
                }
              : c,
          ),
        );
      } else {
        const message = "后端没有返回有效分镜。请检查 Ark 文本模型返回格式或稍后重试。";
        setOutlineError(message);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConversationId
              ? { ...c, messages: c.messages.map((m) => m.id === genMsgId ? { ...m, text: `生成失败：${message}` } : m) }
              : c,
          ),
        );
      }
    } catch (e: any) {
      console.error("Background generation error:", e);
      const message = e?.message || "AI 生成请求失败";
      setOutlineError(message);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversationId
            ? { ...c, messages: c.messages.map((m) => m.id === genMsgId ? { ...m, text: `生成失败：${message}` } : m) }
            : c,
        ),
      );
    } finally {
      setVcLoading(false);
    }
  };

  const generateClip = async (prompt, imageUrl, ratio, duration) => {
    try {
      const createRes = (await api.agentGenerateClip({ prompt, imageUrl, ratio, duration })) as any;
      const taskId = createRes?.data?.taskId || createRes?.taskId;
      if (!createRes.success || !taskId) {
        console.error("Generate failed:", createRes);
        return null;
      }

      while (true) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await api.agentGenerateClipStatus(taskId);
        const taskStatus = statusRes.data;
        if (!taskStatus) continue;
        
        if (taskStatus.status === 'completed') {
          return taskStatus.result?.clipUrl || taskStatus.result?.video_url;
        } else if (taskStatus.status === 'failed') {
          console.error("Task failed:", taskStatus);
          return null;
        }
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleStartGeneration = async () => {
    if (!vcProject) return;
    setVcStage("generating");

    for (const beat of vcProject.storyBeats) {
      setVcProject((prev) => prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === beat.id ? { ...b, status: "prompt_ready", videoClipUrl: undefined } : b)) } : null);
    }

    setVcStage("storyboard");
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              updatedAt: "刚刚",
              messages: [
                ...c.messages,
                { id: Date.now(), role: "agent" as const, text: `🎬 已进入分镜调整。${vcProject.storyBeats.length} 个分镜已就绪，你可以继续调整文案，或点击每张卡片右上角的“生成该镜头视频”按钮进行渲染。` },
              ],
            }
          : c,
      ),
    );
  };

  const handleRegenerateBeat = async (beatId: string) => {
    if (!vcProject) return;
    setVcProject((prev) =>
      prev
        ? {
            ...prev,
            storyBeats: prev.storyBeats.map((b) =>
              b.id === beatId
                ? { ...b, errorMessage: "请在左侧对话框描述修改要求，Agent 会基于当前分镜更新文案。", status: "failed" }
                : b,
            ),
          }
        : null,
    );
  };

  const handleGenerateClipBeat = async (beatId: string) => {
    if (!vcProject) return;
    
    const beat = vcProject.storyBeats.find(b => b.id === beatId);
    if (!beat) return;

    setVcProject((prev) => prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === beatId ? { ...b, status: "generating", videoClipUrl: undefined, errorMessage: undefined } : b)) } : null);
    
    const imageUrl = vcProject.visualRefs?.[0]?.url || "";
    const videoUrl = await generateClip(beat.description, imageUrl, vcProject.aspectRatio, beat.duration || 5);
    const isRealVideo = isPlayableVideoUrl(videoUrl);

    setVcProject((prev) =>
      prev ? {
          ...prev,
          storyBeats: prev.storyBeats.map((b) =>
            b.id === beatId
              ? {
                  ...b,
                  status: isRealVideo ? "generated" : "failed",
                  videoClipUrl: isRealVideo ? (videoUrl as string) : undefined,
                  errorMessage: isRealVideo ? undefined : "视频模型没有返回可播放的视频 URL，请检查 Ark 视频模型配置或任务状态。",
                }
              : b
          )
        } : null
    );
  };

  const handleDeleteBeat = (beatId: string) => {
    setVcProject((prev) =>
      prev ? { ...prev, storyBeats: prev.storyBeats.filter((b) => b.id !== beatId) } : null,
    );
  };

  const handleConfirmStoryboard = () => {
    // Dispatch event for app to navigate to fine edit (OpenCut Editor)
    window.dispatchEvent(new CustomEvent("tikframe:openProjectWorkspace", { detail: { projectId: "new-project" } }));
    returnToPreviousPage();
  };

  const submitCanvasInput = async () => {
    const text = vcCanvasInput.trim();
    if (!text || agentLoading) return;
    setVcCanvasInput("");
    const base = Date.now();
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, updatedAt: "刚刚", messages: [...c.messages, { id: base, role: "user" as const, text }, { id: base + 1, role: "agent" as const, text: "" }] }
          : c,
      ),
    );
    setAgentLoading(true);
    try {
      let streamedText = "";
      const histMsgs = (activeConversation?.messages || []).map(m => ({ role: m.role, content: m.text }));
      await api.agentChatStream(
        {
          message: text,
          messages: histMsgs,
          conversationId: activeConversationId,
          context: vcProject,
          projectMeta: vcProject,
        },
        (chunk: string, _toolCall: any, toolResult: any) => {
          if (chunk) {
            streamedText += chunk;
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeConversationId
                  ? { ...c, messages: c.messages.map((m) => m.id === base + 1 ? { ...m, text: streamedText } : m) }
                  : c,
              ),
            );
          }
          // Apply storyboard changes from done event
          if (toolResult?.type === "edit_storyboard" && toolResult.newText) {
            try {
              const newBeats = JSON.parse(toolResult.newText);
              if (Array.isArray(newBeats) && newBeats.length > 0) {
                setVcProject((prev) =>
                  prev ? { ...prev, storyBeats: newBeats.map(normalizeStoryBeatFromAgent) } : null
                );
              }
            } catch(e) { console.warn("beats parse fail", e); }
          }
        },
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Agent 暂时不可用";
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: c.messages.map((m) => m.id === base + 1 ? { ...m, text: `出错：${errMsg}` } : m) }
            : c,
        ),
      );
    } finally {
      setAgentLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  // Canvas mode: stages that use the 3-column layout
  const isCanvasMode = videoCreationMode && ["canvas", "generating", "storyboard", "preview"].includes(vcStage) && vcProject !== null;

  return (
    <div className={`agent-shell ${open ? "agent-shell-open" : ""}`}>
      <div className="agent-page-frame">{children}</div>

      <main className={`agent-full-page ${sidebarCollapsed ? "sidebar-collapsed" : ""}`} aria-hidden={!open ? "true" : undefined} style={{ pointerEvents: open ? "auto" : "none" }}>

        {/* ── COLLAPSIBLE LEFT SIDEBAR ──────────────────────────────────────── */}
        <aside className={`agent-history-sidebar ${sidebarCollapsed ? "agent-sidebar-collapsed" : ""}`} aria-label="Agent 会话历史">
          {/* Toggle button at top */}
          <div className="agent-sidebar-toggle-row">
            {!sidebarCollapsed && (
              <div className="agent-history-top" style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="agent-new-chat" onClick={handleOpenVideoCreation} style={{ flex: 1 }}>
                  <Plus size={17} />
                  新会话
                </button>
                <button
                  type="button"
                  className={`agent-new-chat ${debugMode ? 'active' : ''}`}
                  onClick={() => setDebugMode(!debugMode)}
                  title="Toggle Debug Mode"
                  style={{ width: "40px", padding: 0, justifyContent: "center", background: debugMode ? "rgba(220, 38, 38, 0.1)" : undefined, color: debugMode ? "#dc2626" : undefined }}
                >
                  <Bug size={17} />
                </button>
              </div>
            )}
            <button
              type="button"
              className="agent-sidebar-toggle-btn"
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            >
              {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Sidebar content (hidden when collapsed) */}
          {!sidebarCollapsed && (
            <>
              <div className="agent-history-list">
                {sortedConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`agent-history-item ${conv.id === activeConversationId ? "is-active" : ""}`}
                  >
                    <button
                      type="button"
                      className="agent-history-select"
                      onClick={() => selectConversation(conv.id)}
                    >
                      <span>{conv.pinned ? `★ ${conv.title}` : conv.title}</span>
                      <small>{cleanAgentDisplayText(conv.messages[conv.messages.length - 1]?.text ?? "暂无消息")}</small>
                    </button>
                    <button
                      type="button"
                      className="agent-history-menu-button"
                      aria-label="会话菜单"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversationMenuId((c) => (c === conv.id ? null : conv.id));
                      }}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {conversationMenuId === conv.id && (
                      <div className="agent-history-menu">
                        <button type="button" onClick={() => togglePinConversation(conv.id)}>
                          {conv.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                          {conv.pinned ? "取消置顶" : "置顶"}
                        </button>
                        <button type="button" onClick={() => renameConversation(conv.id)}>
                          <Pencil size={15} />重命名
                        </button>
                        <button type="button" onClick={() => deleteConversation(conv.id)}>
                          <Trash2 size={15} />删除
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Top-right back button */}
        <button type="button" className="agent-top-back" onClick={returnToPreviousPage}>
          <ArrowLeft size={18} />
          退出
        </button>

        {videoCreationMode && vcStage !== "setup" && (
          <button type="button" className="agent-step-back" onClick={goToPreviousAgentStep}>
            <ChevronLeft size={18} />
            上一步
          </button>
        )}

        {/* ── SETUP MODE: expanding chat input ─────────────────────────────── */}
        {videoCreationMode && (vcStage === "setup" || vcStage === "outlining") && (
          <section className="agent-home agent-vc-home-mode">
            {/* Centered content */}
            <div className="vc-home-center">
              <h1 className="vc-home-title">AI 创作视频</h1>
              <p className="vc-home-sub">描述你想制作的视频，或选择商品直接开始</p>

              {outlineError && (
                <div className="vc-error-banner" style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  textAlign: "left"
                }}>
                  <strong>生成失败：</strong>{outlineError}
                </div>
              )}

              {vcStage === "outlining" ? (
                /* Loading state */
                <div className="vc-outlining-state">
                  <Loader2 size={32} className="vc-spin" style={{ color: "#4684EE", display: "block", margin: "0 auto 16px" }} />
                  <p>{vcProgressMsg || "正在分析商品信息，生成视频大纲..."}</p>
                </div>
              ) : (
                <VCInputBox
                  form={vcForm}
                  onFormChange={setVcForm}
                  onSubmit={handleVCFormSubmit}
                  loading={false}
                  fileInputRef={vcFileInputRef}
                  expanded={vcInputExpanded}
                  setExpanded={setVcInputExpanded}
                  onSkillClick={() => setSkillMenuOpen(v => !v)}
                  skillMenuOpen={skillMenuOpen}
                  quickActions={quickActions}
                  runAction={runAction}
                />
              )}

              {/* Recent sessions */}
              {vcSessions.length > 0 && vcStage === "setup" && (
                <div className="vc-recent-sessions">
                  <p className="vc-recent-label">最近创作</p>
                  <div className="vc-recent-grid">
                    {vcSessions.slice(0, 4).map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        className="vc-recent-card"
                        onClick={() => {
                          if (session.project) {
                            setVcProject(session.project);
                            setVcStage(session.stage);
                            setActiveVcSessionId(session.id);
                          }
                        }}
                      >
                        <div className="vc-recent-thumb">
                          {session.thumbnail ? (
                            <img src={session.thumbnail} alt={session.title} />
                          ) : (
                            <Film size={18} />
                          )}
                        </div>
                        <div className="vc-recent-info">
                          <span className="vc-recent-title">{session.title}</span>
                          <small className="vc-recent-meta">
                            {stageLabel[session.stage]} · {session.createdAt}
                          </small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── CANVAS / GENERATING / STORYBOARD MODE: 3-column ─────────────── */}
        {isCanvasMode && (
          <section className="agent-home agent-canvas-mode">

            {/* Middle column: sessions list + agent chat */}
            <div className="agent-canvas-sessions-col">
              {/* Chat Session Context (Header) */}
              <div className="agent-canvas-chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontWeight: 500, color: "#1e293b" }}>{activeConversation?.title || "创作助手"}</span>
              </div>

              {/* Agent conversation thread */}
              <div className="agent-canvas-chat-thread">
                {activeConversation?.messages.map((msg) => (
                  <div key={msg.id} className={`agent-message agent-message-${msg.role}`}>
                    <span>{msg.role === "agent" ? "Agent" : "你"}</span>
                    <p>{msg.role === "agent" ? cleanAgentDisplayText(msg.text) : msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Generate button (canvas stage) */}
              {vcStage === "canvas" && (
                <button type="button" className="vc-generate-btn" onClick={handleStartGeneration}>
                  <Zap size={16} />
                  查看并调整分镜
                </button>
              )}

              {/* Generating indicator */}
              {vcStage === "generating" && (
                <div className="vc-generating-indicator">
                  <Loader2 size={14} className="vc-spin" style={{ color: "#4684EE" }} />
                  正在逐个生成视频片段...
                </div>
              )}

              {/* Chat input (canvas and storyboard stages) */}
              {(vcStage === "canvas" || vcStage === "storyboard") && (
                <form className="agent-search-pill" style={{marginTop: 'auto', marginBottom: 20, width: '100%', overflow: 'visible'}} onSubmit={(e) => { e.preventDefault(); submitCanvasInput(); }}>
                  <textarea
                    value={vcCanvasInput}
                    onChange={(e) => setVcCanvasInput(e.target.value)}
                    placeholder="告诉 Agent 调整..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitCanvasInput(); }
                    }}
                    rows={2}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="agent-hidden-file"
                  />
                  <button type="button" className="agent-attach-button" aria-label="附加文件" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip size={20} />
                  </button>
                  <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={() => setSkillMenuOpen(v => !v)}>
                    <Wrench size={19} />使用技能
                  </button>
                  <button type="submit" disabled={agentLoading || !vcCanvasInput.trim()} className="agent-send-inline" aria-label="发送消息" title="发送">
                    {agentLoading ? <Loader2 size={16} className="vc-spin" /> : <Send size={18} />}
                  </button>

                  {skillMenuOpen && (
                    <div className="agent-skill-menu" onMouseDown={(e) => e.stopPropagation()}>
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button key={action.label} type="button" onClick={() => runAction(action)}>
                            <Icon size={17} />
                            <span>{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </form>
              )}
              </div>
              <div className="agent-canvas-right" ref={vcCanvasRightRef}>
                {vcStage === "storyboard" ? (
                <StoryboardAdjustView
                  project={vcProject}
                  onUpdateBeat={(id, desc) =>
                    setVcProject((prev) =>
                      prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === id ? { ...b, description: desc } : b)) } : null,
                    )
                  }
                  onDeleteBeat={handleDeleteBeat}
                  onRegenerateBeat={handleRegenerateBeat}
                  onGenerateClip={handleGenerateClipBeat}
                  onConfirm={handleConfirmStoryboard}
                  onBack={() => setVcStage("canvas")}
                  onReorderBeats={(newBeats) => setVcProject((prev) => prev ? { ...prev, storyBeats: newBeats } : null)}
                  onUpdateProject={(data) => setVcProject((prev) => prev ? { ...prev, ...data } : null)}
                />
              ) : (
                <ProjectCanvasView
                  project={vcProject}
                  stage={vcStage}
                  editingBeatId={editingBeatId}
                  loading={vcLoading}
                  onEditBeat={setEditingBeatId}
                  onUpdateBeat={(id, desc) =>
                    setVcProject((prev) =>
                      prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === id ? { ...b, description: desc } : b)) } : null,
                    )
                  }
                  onUpdateBeatFields={(id, data) =>
                    setVcProject((prev) =>
                      prev ? { ...prev, storyBeats: prev.storyBeats.map((b) => (b.id === id ? { ...b, ...data } : b)) } : null,
                    )
                  }
                  onRegenerateBeat={handleRegenerateBeat}
                  onUpdateProject={(data) => setVcProject(prev => prev ? {...prev, ...data} : null)}
                  onAddRef={() => {
                    const name = window.prompt("输入参考图描述");
                    if (name) {
                      setVcProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              visualRefs: [
                                ...prev.visualRefs,
                                { id: `r${Date.now()}`, type: "custom", label: name, url: `https://picsum.photos/seed/${Date.now()}/300/300` },
                              ],
                            }
                          : null,
                      );
                    }
                  }}
                />
              )}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
