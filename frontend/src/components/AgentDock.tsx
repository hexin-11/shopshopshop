import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Clapperboard,
  FileText,
  Grid2X2,
  Image,
  Mic,
  MicOff,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Trash2,
  Wand2,
  Wrench,
} from "lucide-react";

interface AgentDockProps {
  children: ReactNode;
}

type AgentView = "chat" | "library" | "actions";
type ChatMessage = {
  id: number;
  role: "user" | "agent";
  text: string;
};
type Conversation = {
  id: number;
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

const agentHistoryFlag = "shopclip-agent";
const STORAGE_KEY = "shopclip-agent-conversations";

const libraryItems: LibraryItem[] = [
  {
    id: "earphone",
    type: "商品",
    title: "Havit H630BT 主动降噪耳机",
    detail: "含主图、卖点、短视频脚本和 2 个项目。",
  },
  {
    id: "script-hook",
    type: "脚本",
    title: "开场三秒强钩子模板",
    detail: "适合数码、美妆、家居类商品，可直接生成分镜。",
  },
  {
    id: "project-618",
    type: "项目",
    title: "618 爆品短视频队列",
    detail: "包含待审核项目、生成中任务和历史导出记录。",
  },
  {
    id: "cover",
    type: "素材",
    title: "竖版封面标题模板",
    detail: "适合 9:16 带货视频封面，留有商品与标题空间。",
  },
];

const quickActions = [
  {
    label: "商品卖点",
    prompt: "帮我把当前商品整理成 5 个带货卖点",
    reply: "已整理卖点框架：痛点开场、核心参数、使用场景、对比优势、下单理由。你可以继续让我生成短视频脚本。",
    icon: FileText,
  },
  {
    label: "素材检查",
    prompt: "检查当前素材是否适合生成短视频",
    reply: "素材检查完成：主图清晰度可用，建议补 2 张使用场景图，并把字幕卖点控制在 12 字以内。",
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

const firstConversation: Conversation = {
  id: 1,
  title: "ShopClip 创作助手",
  updatedAt: "今天",
  references: [],
  messages: [
    {
      id: 1,
      role: "agent",
      text: "我可以帮你找商品、改脚本、检查素材，或者把项目推进到生成队列。",
    },
  ],
};

const createConversation = (): Conversation => {
  const id = Date.now();
  return {
    id,
    title: "新会话",
    updatedAt: "刚刚",
    references: [],
    messages: [
      {
        id: id + 1,
        role: "agent",
        text: "新会话已创建。你可以输入想法、脚本需求，或者从资料库添加参考内容。",
      },
    ],
  };
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

const makeConversationTitle = (text: string) => {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "新会话";
  return clean.length > 16 ? `${clean.slice(0, 16)}...` : clean;
};

const getAgentReturnTarget = () => `${window.location.pathname}${window.location.search}`;

export default function AgentDock({ children }: AgentDockProps) {
  const initialConversationsRef = useRef<Conversation[] | null>(null);
  if (!initialConversationsRef.current) {
    initialConversationsRef.current = loadConversations();
  }

  const [open, setOpen] = useState(() => window.location.hash === "#agent");
  const [view, setView] = useState<AgentView>("chat");
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(initialConversationsRef.current);
  const [activeConversationId, setActiveConversationId] = useState(initialConversationsRef.current[0]?.id ?? firstConversation.id);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [model, setModel] = useState("Pro");
  const [conversationMenuId, setConversationMenuId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  );

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return b.id - a.id;
      }),
    [conversations],
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (window.location.hash === "#agent" && !window.history.state?.[agentHistoryFlag]) {
      window.history.replaceState(
        { ...(window.history.state ?? {}), [agentHistoryFlag]: true, returnTo: getAgentReturnTarget() },
        "",
        window.location.href,
      );
    }

    const onPopState = () => {
      setOpen(window.location.hash === "#agent");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openAgent = (nextView: AgentView = "chat") => {
    setView(nextView);
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

  const startNewConversation = () => {
    const next = createConversation();
    setConversations((prev) => [next, ...prev]);
    setActiveConversationId(next.id);
    setInput("");
    setAttachments([]);
    setListening(false);
    setConversationMenuId(null);
    setView("chat");
  };

  const selectConversation = (id: number) => {
    setActiveConversationId(id);
    setInput("");
    setConversationMenuId(null);
    setView("chat");
  };

  const togglePinConversation = (id: number) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id
          ? { ...conversation, pinned: !conversation.pinned, updatedAt: "刚刚" }
          : conversation,
      ),
    );
    setConversationMenuId(null);
  };

  const renameConversation = (id: number) => {
    const current = conversations.find((conversation) => conversation.id === id);
    const nextTitle = window.prompt("重命名会话", current?.title ?? "新会话");
    if (!nextTitle?.trim()) return;

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id
          ? { ...conversation, title: nextTitle.trim(), updatedAt: "刚刚" }
          : conversation,
      ),
    );
    setConversationMenuId(null);
  };

  const deleteConversation = (id: number) => {
    setConversations((prev) => {
      const remaining = prev.filter((conversation) => conversation.id !== id);
      if (remaining.length === 0) {
        const next = createConversation();
        setActiveConversationId(next.id);
        return [next];
      }

      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
      return remaining;
    });
    setConversationMenuId(null);
  };

  const addExchange = (text: string, reply: string) => {
    const base = Date.now();
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== activeConversationId) return conversation;
        const shouldRename = conversation.title === firstConversation.title || conversation.title === "新会话";
        return {
          ...conversation,
          title: shouldRename ? makeConversationTitle(text) : conversation.title,
          updatedAt: "刚刚",
          messages: [
            ...conversation.messages,
            { id: base, role: "user", text },
            { id: base + 1, role: "agent", text: reply },
          ],
        };
      }),
    );
  };

  const addLibraryItem = (item: LibraryItem) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              updatedAt: "刚刚",
              references: Array.from(new Set([...conversation.references, item.title])),
              messages: [
                ...conversation.messages,
                {
                  id: Date.now(),
                  role: "agent",
                  text: `已把「${item.title}」加入当前会话参考。${item.detail}`,
                },
              ],
            }
          : conversation,
      ),
    );
    setInput((current) => (current.trim() ? `${current.trim()}，参考${item.title}` : `参考${item.title}，`));
    setView("chat");
  };

  const submitInput = () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;

    const attachmentText = attachments.length > 0 ? `，并附带 ${attachments.length} 个文件` : "";
    addExchange(
      text || `分析这些附件${attachmentText}`,
      `${model} 模式已收到${attachmentText}。我会按商品、素材、脚本、项目进度四类拆解，并把下一步动作整理在当前会话里。`,
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
    addExchange(action.prompt, action.reply);
    setView("chat");
  };

  const rotateModel = () => {
    setModel((current) => modelOptions[(modelOptions.indexOf(current) + 1) % modelOptions.length]);
  };

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
        <aside className="agent-history-sidebar" aria-label="Agent 会话历史">
          <div className="agent-history-top">
            <button type="button" className="agent-new-chat" onClick={startNewConversation}>
              <Plus size={17} />
              新会话
            </button>
          </div>
          <div className="agent-history-list">
            {sortedConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`agent-history-item ${conversation.id === activeConversationId ? "is-active" : ""}`}
              >
                <button
                  type="button"
                  className="agent-history-select"
                  onClick={() => selectConversation(conversation.id)}
                >
                  <span>{conversation.pinned ? `★ ${conversation.title}` : conversation.title}</span>
                  <small>{conversation.messages[conversation.messages.length - 1]?.text ?? "暂无消息"}</small>
                </button>
                <button
                  type="button"
                  className="agent-history-menu-button"
                  aria-label="会话菜单"
                  onClick={(event) => {
                    event.stopPropagation();
                    setConversationMenuId((current) =>
                      current === conversation.id ? null : conversation.id,
                    );
                  }}
                >
                  <MoreHorizontal size={17} />
                </button>
                {conversationMenuId === conversation.id && (
                  <div className="agent-history-menu">
                    <button type="button" onClick={() => togglePinConversation(conversation.id)}>
                      {conversation.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                      {conversation.pinned ? "取消置顶" : "置顶"}
                    </button>
                    <button type="button" onClick={() => renameConversation(conversation.id)}>
                      <Pencil size={15} />
                      重命名
                    </button>
                    <button type="button" onClick={() => deleteConversation(conversation.id)}>
                      <Trash2 size={15} />
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <button type="button" className="agent-top-back" onClick={returnToPreviousPage}>
          <ArrowLeft size={18} />
          返回
        </button>

        <section className="agent-home">
          <h1>{view === "library" ? "选择资料加入当前会话" : view === "actions" ? "选择一个快捷动作" : "你好，想创作什么？"}</h1>

          <div className="agent-mode-tabs" aria-label="Agent 模式">
            <button type="button" className={view === "chat" ? "is-active" : ""} onClick={() => setView("chat")}>
              <Bot size={18} />
              聊天
            </button>
            <button type="button" className={view === "library" ? "is-active" : ""} onClick={() => setView("library")}>
              <Search size={18} />
              资料库
            </button>
            <button type="button" className={view === "actions" ? "is-active" : ""} onClick={() => setView("actions")}>
              <Grid2X2 size={18} />
              动作
            </button>
            <button type="button" onClick={rotateModel}>
              <Settings size={18} />
              {model}
            </button>
          </div>

          <div className="agent-live-panel">
            {view === "chat" && activeConversation && (
              <div className="agent-thread" aria-live="polite">
                {activeConversation.references.length > 0 && (
                  <div className="agent-panel-note">
                    当前参考：{activeConversation.references.join("、")}
                  </div>
                )}
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={`agent-message agent-message-${message.role}`}>
                    <span>{message.role === "agent" ? "Agent" : "你"}</span>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
            )}

            {view === "library" && (
              <div className="agent-result-list" aria-live="polite">
                <div className="agent-panel-note">点击资料会加入当前会话，不会离开当前页面。</div>
                {libraryItems.map((item) => (
                  <button type="button" key={item.id} onClick={() => addLibraryItem(item)}>
                    <strong>{item.type}</strong>
                    <span>{item.title}</span>
                    <small>{item.detail}</small>
                  </button>
                ))}
              </div>
            )}

            {view === "actions" && (
              <div className="agent-action-grid">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button key={action.label} type="button" onClick={() => runAction(action)}>
                      <Icon size={19} />
                      <span>{action.label}</span>
                      <small>点击后会写入当前会话历史</small>
                    </button>
                  );
                })}
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
            <button type="button" className="agent-add-tile" aria-label="打开快捷动作" onClick={() => setView("actions")}>
              <Plus size={28} />
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="问问 ShopClip Agent"
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
            <button type="button" className="agent-auto-button" aria-label="打开资料库" onClick={() => setView("library")}>
              <SlidersHorizontal size={19} />
              资料库
            </button>
            <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={() => setView("actions")}>
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
