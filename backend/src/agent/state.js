import { Annotation } from "@langchain/langgraph";

/**
 * 定义 Agent 运行的状态树
 */
export const AgentState = Annotation.Root({
  // 用户的原始输入消息
  inputMessage: Annotation({
    reducer: (state, update) => update,
    default: () => "",
  }),
  
  // 附带的媒体文件或其他上下文
  attachments: Annotation({
    reducer: (state, update) => update,
    default: () => [],
  }),

  // 会话历史记录
  messages: Annotation({
    reducer: (state, update) => update,
    default: () => [],
  }),
  
  // 识别出的用户意图：'chat', 'script', 'image', 'video', 'edit', 'analyze'
  intent: Annotation({
    reducer: (state, update) => update,
    default: () => "chat",
  }),

  // 前端传入的模型名称
  modelName: Annotation({
    reducer: (state, update) => update,
    default: () => "doubao-seed-2-0-lite-260428",
  }),

  // 最终回复给前端的 JSON 对象，包含 reply, thinking, changes
  finalResponse: Annotation({
    reducer: (state, update) => update,
    default: () => ({ reply: "", thinking: [], changes: [] }),
  }),
});
