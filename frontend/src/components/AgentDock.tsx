import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Clapperboard,
  FileText,
  Grid2X2,
  Image,
  Library,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Wrench,
  Wand2,
} from "lucide-react";

interface AgentDockProps {
  children: ReactNode;
}

type AgentView = "chat" | "search" | "apps";
type ChatMessage = {
  id: number;
  role: "user" | "agent";
  text: string;
};
type Conversation = {
  id: number;
  title: string;
  messages: ChatMessage[];
};

const searchSeed = [
  { type: "商品", title: "无线耳机带货项目", detail: "已匹配 12 条素材、3 个脚本、2 个可生成视频方案", path: "/products/prod-earphone" },
  { type: "脚本", title: "开场三秒强钩子模板", detail: "适合数码、美妆、家居类商品，可直接进入视频生成", path: "/projects/p-earphone" },
  { type: "项目", title: "618 爆品短视频队列", detail: "4 个项目待审核，1 个项目正在渲染", path: "/projects" },
];

const quickActions = [
  {
    label: "商品卖点",
    prompt: "帮我把当前商品整理成 5 个带货卖点",
    reply: "已整理卖点框架：痛点开场、核心参数、使用场景、对比优势、下单理由。下一步可以直接生成短视频脚本。",
    icon: FileText,
  },
  {
    label: "素材检查",
    prompt: "检查当前素材是否适合生成短视频",
    reply: "素材检查完成：主图清晰度可用，建议补 2 张使用场景图，并把卖点字幕控制在 12 字以内。",
    icon: Image,
  },
  {
    label: "项目推进",
    prompt: "把当前脚本推进到视频生成队列",
    reply: "已把当前工作流整理为生成任务：脚本、素材、口播和封面都进入待处理清单。你可以从项目页继续查看。",
    icon: Clapperboard,
  },
];

const modelOptions = ["Fast", "Pro", "Deep"];
const agentHistoryFlag = "shopclip-agent";
const firstConversation: Conversation = {
  id: 1,
  title: "ShopClip 创作助手",
  messages: [
    { id: 1, role: "agent", text: "我可以帮你找商品、改脚本、检查素材，或者把项目推进到生成队列。" },
  ],
};

export default function AgentDock({ children }: AgentDockProps) {
  const [open, setOpen] = useState(() => window.location.hash === "#agent");
  const [input, setInput] = useState("");
  const [view, setView] = useState<AgentView>("chat");
  const [conversations, setConversations] = useState<Conversation[]>([firstConversation]);
  const [activeConversationId, setActiveConversationId] = useState(firstConversation.id);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [model, setModel] = useState("Pro");
  const [searchTerm, setSearchTerm] = useState("");
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openedFromAgentHistoryRef = useRef(false);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  );

  useEffect(() => {
    const onPopState = () => {
      if (window.location.hash === "#agent") {
        setOpen(true);
        return;
      }

      if (openedFromAgentHistoryRef.current && !window.history.state?.[agentHistoryFlag]) {
        openedFromAgentHistoryRef.current = false;
        setOpen(false);
        return;
      }

      setOpen(false);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openAgent = (nextView: AgentView = "chat") => {
    setView(nextView);
    if (!open && !window.history.state?.[agentHistoryFlag]) {
      const currentUrl = `${window.location.pathname}${window.location.search}#agent`;
      window.history.pushState({ ...(window.history.state ?? {}), [agentHistoryFlag]: true }, "", currentUrl);
      openedFromAgentHistoryRef.current = true;
    }
    setOpen(true);
  };

  const returnToPreviousPage = () => {
    if (openedFromAgentHistoryRef.current && window.history.state?.[agentHistoryFlag]) {
      window.history.back();
      return;
    }

    setOpen(false);
  };

  const navigateTo = (path: string) => {
    openedFromAgentHistoryRef.current = false;
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setOpen(false);
  };

  const addExchange = (text: string, reply: string) => {
    const base = Date.now();
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== activeConversationId) return conversation;
        const shouldRename = conversation.title === firstConversation.title || conversation.title === "新对话";
        return {
          ...conversation,
          title: shouldRename ? text.slice(0, 18) || "新对话" : conversation.title,
          messages: [
            ...conversation.messages,
            { id: base, role: "user", text },
            { id: base + 1, role: "agent", text: reply },
          ],
        };
      }),
    );
  };

  const createConversation = () => {
    const id = Date.now();
    setConversations((prev) => [
      {
        id,
        title: "新对话",
        messages: [{ id: id + 1, role: "agent", text: "新对话已创建。输入想法、脚本或上传参考素材，我会接着处理。" }],
      },
      ...prev,
    ]);
    setActiveConversationId(id);
    setView("chat");
    setInput("");
    setAttachments([]);
  };

  const submitInput = () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;

    if (view === "search") {
      setSearchTerm(text || attachments.join("、"));
      setInput("");
      setAttachments([]);
      return;
    }

    const attachmentText = attachments.length > 0 ? `，附带 ${attachments.length} 个文件` : "";
    addExchange(
      text || `分析这些附件${attachmentText}`,
      `${model} 模式已收到${attachmentText}。我会按商品、素材、脚本、项目进度四类拆解，并把下一步动作整理在这里。`,
    );
    setInput("");
    setAttachments([]);
    setListening(false);
    setView("chat");
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setAttachments((prev) => [...prev, ...Array.from(files).map((file) => file.name)]);
  };

  const runAction = (action: (typeof quickActions)[number]) => {
    setCompletedActions((prev) => (prev.includes(action.label) ? prev : [...prev, action.label]));
    addExchange(action.prompt, action.reply);
    setView("chat");
  };

  const rotateModel = () => {
    setModel((current) => {
      const next = modelOptions[(modelOptions.indexOf(current) + 1) % modelOptions.length];
      addExchange("切换 Agent 模式", `已切换到 ${next} 模式。`);
      return next;
    });
    setView("chat");
  };

  const activeTitle = {
    chat: "你好，想创作什么？",
    search: "搜索工作台内容",
    apps: "选择一个可执行动作",
  }[view];

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return searchSeed;
    const term = searchTerm.trim().toLowerCase();
    return searchSeed.filter((item) => `${item.type}${item.title}${item.detail}`.toLowerCase().includes(term));
  }, [searchTerm]);

  return (
    <div className={`agent-shell ${open ? "agent-shell-open" : ""}`}>
      <div className="agent-page-frame">{children}</div>

      {!open && (
        <button
          type="button"
          aria-label="打开 Agent"
          className="agent-orb"
          onClick={() => openAgent("chat")}
        >
          <span className="agent-orb-ring" />
          <span className="agent-orb-core">
            <Wand2 size={22} />
            <span>Agent</span>
          </span>
          <span className="agent-orb-hint">打开工作助手</span>
        </button>
      )}

      <main className="agent-full-page" aria-hidden={!open}>
        <aside className="agent-history-sidebar" aria-label="Agent chat history">
          <div className="agent-history-top">
            <button type="button" className="agent-new-chat" onClick={createConversation}>
              <Plus size={17} />
              新对话
            </button>
          </div>
          <div className="agent-history-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={conversation.id === activeConversationId ? "is-active" : ""}
                onClick={() => {
                  setActiveConversationId(conversation.id);
                  setView("chat");
                }}
              >
                <span>{conversation.title}</span>
                <small>{conversation.messages[conversation.messages.length - 1]?.text ?? "暂无消息"}</small>
              </button>
            ))}
          </div>
        </aside>

        <button type="button" className="agent-asset-button" onClick={() => navigateTo("/products")}>
          <Library size={17} />
          资产库
        </button>

        <button type="button" className="agent-top-back" onClick={returnToPreviousPage}>
          <ArrowLeft size={18} />
          返回
        </button>

        <section className="agent-home">
          <h1>{activeTitle}</h1>

          <div className="agent-mode-tabs" aria-label="Agent modes">
            <button
              type="button"
              className={view === "chat" ? "is-active" : ""}
              onClick={() => setView("chat")}
            >
              <Bot size={18} />
              聊天
            </button>
            <button
              type="button"
              className={view === "search" ? "is-active" : ""}
              onClick={() => setView("search")}
            >
              <Search size={18} />
              搜索
            </button>
            <button
              type="button"
              className={view === "apps" ? "is-active" : ""}
              onClick={() => setView("apps")}
            >
              <Grid2X2 size={18} />
              动作
            </button>
            <button type="button" onClick={rotateModel}>
              <Settings size={18} />
              {model}
            </button>
          </div>

          <div className="agent-live-panel">
            {view === "chat" && (
              <div className="agent-thread" aria-live="polite">
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={`agent-message agent-message-${message.role}`}>
                    <span>{message.role === "agent" ? "Agent" : "你"}</span>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
            )}

            {view === "search" && (
              <div className="agent-result-list" aria-live="polite">
                <div className="agent-panel-note">
                  {searchTerm ? `正在展示 “${searchTerm}” 的匹配结果` : "输入关键词后按发送，结果会在这里更新。"}
                </div>
                {filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <button
                      type="button"
                      key={`${result.type}-${result.title}`}
                      onClick={() => {
                        addExchange(`打开${result.type}：${result.title}`, `已打开 ${result.title}。`);
                        navigateTo(result.path);
                      }}
                    >
                      <strong>{result.type}</strong>
                      <span>{result.title}</span>
                      <small>{result.detail}</small>
                    </button>
                  ))
                ) : (
                  <div className="agent-empty-state">没有匹配结果，换个商品名、脚本名或项目名试试。</div>
                )}
              </div>
            )}

            {view === "apps" && (
              <div className="agent-action-grid">
                {quickActions.map(({ label, icon: Icon, reply, prompt, ...action }) => (
                  <button key={label} type="button" onClick={() => runAction({ label, icon: Icon, reply, prompt, ...action })}>
                    <Icon size={19} />
                    <span>{label}</span>
                    <small>{completedActions.includes(label) ? "已执行，可再次运行" : "点击后直接生成 Agent 回复"}</small>
                  </button>
                ))}
              </div>
            )}

          </div>

          <form
            className="agent-search-pill"
            onSubmit={(event) => {
              event.preventDefault();
              submitInput();
            }}
          >
            <button type="button" className="agent-add-tile" aria-label="添加快捷内容" onClick={() => setView("apps")}>
              <Plus size={28} />
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={view === "search" ? "搜索商品、脚本、项目..." : "问问 ShopClip Agent"}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="agent-hidden-file"
              onChange={(event) => handleFiles(event.currentTarget.files)}
            />
            <button type="button" className="agent-attach-button" aria-label="附加文件" onClick={() => fileInputRef.current?.click()}>
              <Paperclip size={20} />
            </button>
            <button type="button" className="agent-model-button" onClick={rotateModel}>
              <Wand2 size={16} />
              {model}
            </button>
            <button type="button" className="agent-auto-button" aria-label="自动模式" onClick={() => setView("search")}>
              <SlidersHorizontal size={19} />
              自动
            </button>
            <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={() => setView("apps")}>
              <Wrench size={19} />
              使用技能
            </button>
            <button
              type="button"
              aria-label={listening ? "停止语音输入" : "语音输入"}
              className={listening ? "is-listening" : ""}
              onClick={() => setListening((value) => !value)}
            >
              {listening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <button type="submit" aria-label="发送给 Agent" className="agent-send-inline">
              <Send size={18} />
            </button>
          </form>

          {(attachments.length > 0 || listening) && (
            <div className="agent-status-strip">
              {attachments.length > 0 && <span>已附加：{attachments.join("、")}</span>}
              {listening && <span>正在监听语音输入...</span>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
