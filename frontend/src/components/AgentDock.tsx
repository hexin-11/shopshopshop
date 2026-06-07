import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Clapperboard,
  FileText,
  Film,
  Image,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  Wrench,
} from "lucide-react";
import { api } from "../lib/api";

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
    label: "文生图",
    prompt: "帮我生成 3 张适合短视频开场的商品图片候选，先问清楚风格也可以",
    reply: "我会先确认商品和视觉风格，再给你 3 张候选图，选中后可以继续图生视频。",
    icon: Sparkles,
  },
  {
    label: "图生视频",
    prompt: "用我选中的图片生成一个 6 秒图生视频方案，包含运镜、字幕和节奏",
    reply: "我会把选中的图片转成视频任务方案，并拆出运镜、字幕和镜头节奏。",
    icon: Film,
  },
  {
    label: "项目推进",
    prompt: "把当前脚本推进到视频生成队列",
    reply: "已把当前工作流整理为生成任务：脚本、素材、口播和封面都进入待处理清单。你可以从项目页继续查看。",
    icon: Clapperboard,
  },
];

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
    messages: [],
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
      messages: Array.isArray(item.messages) ? item.messages as ChatMessage[] : [],
    }));

const makeConversationTitle = (text: string) => {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "新会话";
  return clean.length > 16 ? `${clean.slice(0, 16)}...` : clean;
};

const cleanAgentDisplayText = (text: string) =>
  text
    .replace(/(?:Fast|Pro|Deep|Standard)\s*模式已收到。?\s*/g, "")
    .replace(/我先围绕/g, "我已围绕")
    .trim();

const getAgentReturnTarget = () => `${window.location.pathname}${window.location.search}`;
const defaultAgentModel = "Standard";

export default function AgentDock({ children }: AgentDockProps) {
  const initialConversationsRef = useRef<Conversation[] | null>(null);
  if (!initialConversationsRef.current) {
    initialConversationsRef.current = loadConversations();
  }

  const [open, setOpen] = useState(() => window.location.hash === "#agent");
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(initialConversationsRef.current);
  const [activeConversationId, setActiveConversationId] = useState(initialConversationsRef.current[0]?.id ?? firstConversation.id);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [conversationMenuId, setConversationMenuId] = useState<number | string | null>(null);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? conversations[0],
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
          remote.some((conversation) => conversation.id === current) ? current : remote[0].id,
        );
      })
      .catch(() => {
        // Local history remains available when the backend is not running.
      });
    return () => {
      cancelled = true;
    };
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
      setOpen(window.location.hash === "#agent");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
      prev.map((conversation) =>
        conversation.id === id
          ? { ...conversation, pinned: !conversation.pinned, updatedAt: "刚刚" }
          : conversation,
      ),
    );
    setConversationMenuId(null);
  };

  const renameConversation = (id: number | string) => {
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

  const deleteConversation = (id: number | string) => {
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
  };

  const submitInput = async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || agentLoading) return;

    const attachmentText = attachments.length > 0 ? `，并附带 ${attachments.length} 个文件` : "";
    const userText = text || `分析这些附件${attachmentText}`;
    const currentAttachments = [...attachments];
    const currentMessages = activeConversation?.messages || [];
    const currentReferences = activeConversation?.references || [];
    setInput("");
    setAttachments([]);
    setSkillMenuOpen(false);

    const base = Date.now();
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== activeConversationId) return conversation;
        const shouldRename = conversation.title === firstConversation.title || conversation.title === "新会话";
        return {
          ...conversation,
          title: shouldRename ? makeConversationTitle(userText) : conversation.title,
          updatedAt: "刚刚",
          messages: [
            ...conversation.messages,
            { id: base, role: "user", text: userText },
            {
              id: base + 1,
              role: "agent",
              text: "正在思考怎么回复你...",
              thinking: ["读取上下文", "判断是普通聊天还是创作指令", "组织回复"],
            },
          ],
        };
      }),
    );

    setAgentLoading(true);
    try {
      const result = await api.agentChat({
        message: userText,
        conversationId: activeConversationId,
        model: defaultAgentModel,
        attachments: currentAttachments,
        references: currentReferences,
        messages: currentMessages,
      });
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                updatedAt: "刚刚",
                messages: conversation.messages.map((message) =>
                  message.id === base + 1
                    ? {
                        ...message,
                        text: result.reply,
                        thinking: result.thinking || [],
                        changes: result.changes || [],
                      }
                    : message,
                ),
              }
            : conversation,
        ),
      );
    } catch (error) {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.id === base + 1
                    ? {
                        ...message,
                        text: error instanceof Error ? `后端 Agent 暂时不可用：${error.message}` : "后端 Agent 暂时不可用。",
                      }
                    : message,
                ),
              }
            : conversation,
        ),
      );
    } finally {
      setAgentLoading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setAttachments((prev) => [...prev, ...Array.from(files).map((file) => file.name)]);
  };

  const selectImageCandidate = (candidate: AgentImageCandidate) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              references: Array.from(new Set([...conversation.references, candidate.title])),
              updatedAt: "刚刚",
              messages: [
                ...conversation.messages,
                {
                  id: Date.now(),
                  role: "agent",
                  text: `已选择「${candidate.title}」。你可以继续让我用这张图做图生视频，或者让我改风格、构图、光线。`,
                },
              ],
            }
          : conversation,
      ),
    );
    setInput(`用「${candidate.title}」生成 6 秒图生视频，风格：${candidate.style || "高级电商"}，运镜要自然`);
  };

  const requestVideoFromImage = (candidate: AgentImageCandidate) => {
    setInput(`用「${candidate.title}」做一个 6 秒图生视频，风格参考：${candidate.style || "高级电商"}，提示词：${candidate.prompt}`);
  };

  const runAction = (action: (typeof quickActions)[number]) => {
    setInput(action.prompt);
    setSkillMenuOpen(false);
  };

  const isEmptyConversation = !activeConversation || activeConversation.messages.length === 0;

  return (
    <div className={`agent-shell ${open ? "agent-shell-open" : ""}`}>
      <div className="agent-page-frame">{children}</div>

      {!open && (
        <button
          type="button"
          aria-label="打开 Agent"
          className="agent-orb"
          onClick={openAgent}
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
          <div className="agent-sidebar-library" aria-label="资料库">
            <strong>资料库</strong>
            {libraryItems.map((item) => (
              <button type="button" key={item.id} onClick={() => addLibraryItem(item)}>
                <span>{item.title}</span>
                <small>{item.type} · {item.detail}</small>
              </button>
            ))}
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
                  <small>{cleanAgentDisplayText(conversation.messages[conversation.messages.length - 1]?.text ?? "暂无消息")}</small>
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

        <section className={`agent-home ${isEmptyConversation ? "agent-home-empty" : ""}`}>
          {isEmptyConversation && <h1>你好，想创作什么？</h1>}

          <div className="agent-live-panel">
            {activeConversation && (
              <div className="agent-thread" aria-live="polite">
                {activeConversation.references.length > 0 && (
                  <div className="agent-panel-note">
                    当前参考：{activeConversation.references.join("、")}
                  </div>
                )}
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={`agent-message agent-message-${message.role}`}>
                    <span>{message.role === "agent" ? "Agent" : "你"}</span>
                    <p>{message.role === "agent" ? cleanAgentDisplayText(message.text) : message.text}</p>
                    {message.thinking && message.thinking.length > 0 && (
                      <div className="agent-thinking-list">
                        {message.thinking.map((step, index) => (
                          <small key={`${message.id}-thinking-${index}`}>{step}</small>
                        ))}
                      </div>
                    )}
                    {message.changes && message.changes.length > 0 && (
                      <div className="agent-change-list">
                        {message.changes.map((change, index) => (
                          <article key={`${message.id}-${index}`} className="agent-change-card">
                            <strong>{change.target}</strong>
                            <small>{change.type}</small>
                            <p>{change.summary}</p>
                            {change.newText && <blockquote>{change.newText}</blockquote>}
                            {change.imageCandidates && change.imageCandidates.length > 0 && (
                              <div className="agent-image-grid">
                                {change.imageCandidates.map((candidate) => (
                                  <div key={candidate.id} className="agent-image-option">
                                    <img src={candidate.imageUrl} alt={candidate.title} />
                                    <div>
                                      <strong>{candidate.title}</strong>
                                      <small>{candidate.style || "默认风格"}</small>
                                    </div>
                                    <p>{candidate.prompt}</p>
                                    <div className="agent-card-actions">
                                      <button type="button" onClick={() => selectImageCandidate(candidate)}>
                                        选这张
                                      </button>
                                      <button type="button" onClick={() => requestVideoFromImage(candidate)}>
                                        图生视频
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {change.videoPlan && (
                              <div className="agent-video-plan">
                                <div>
                                  <strong>{change.videoPlan.duration || 6}s</strong>
                                  <span>{change.videoPlan.aspectRatio || "9:16"}</span>
                                  <span>{change.videoPlan.motion || "平滑运镜"}</span>
                                </div>
                                {change.videoPlan.prompt && <p>{change.videoPlan.prompt}</p>}
                                {change.videoPlan.shots && (
                                  <ol>
                                    {change.videoPlan.shots.map((shot) => (
                                      <li key={shot}>{shot}</li>
                                    ))}
                                  </ol>
                                )}
                              </div>
                            )}
                            {change.editActions && change.editActions.length > 0 && (
                              <div className="agent-edit-actions">
                                {change.editActions.map((item) => (
                                  <span key={`${item.action}-${item.target}`}>
                                    {item.action} · {item.target}：{item.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
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
            <button type="button" className="agent-add-tile" aria-label="附加文件" onClick={() => fileInputRef.current?.click()}>
              <Plus size={28} />
            </button>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitInput();
                }
              }}
              placeholder="问问 ShopClip Agent"
              rows={2}
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
            <button type="button" className="agent-skill-button" aria-label="使用技能" onClick={() => setSkillMenuOpen((value) => !value)}>
              <Wrench size={19} />
              使用技能
            </button>
            <button type="submit" aria-label="发送给 Agent" className="agent-send-inline" disabled={agentLoading}>
              <Send size={18} />
            </button>
            {skillMenuOpen && (
              <div className="agent-skill-menu">
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

          {attachments.length > 0 && (
            <div className="agent-status-strip">
              {attachments.length > 0 && <span>已附加：{attachments.join("、")}</span>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
