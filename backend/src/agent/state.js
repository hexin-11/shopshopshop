// 轻量级 Agent State 替换，去除 @langchain/langgraph Annotation 依赖
// state.js 现在仅作为文档记录状态字段，不再使用 LangGraph Annotation

/**
 * Agent 运行状态的字段说明（由 graph.js 直接管理，不再需要 LangGraph）
 *
 * inputMessage: string  - 用户的原始输入消息
 * attachments: any[]   - 附带的媒体文件或其他上下文
 * messages: any[]      - 会话历史记录
 * intent: string       - 识别出的用户意图：'chat', 'script', 'image', 'video', 'edit', 'analyze'
 * modelName: string    - 前端传入的模型名称
 * finalResponse: object - 最终回复给前端的 JSON 对象，包含 reply, thinking, changes
 * trace: any[]         - 调试追踪信息
 */

export const AgentState = null; // 保留导出以防止旧代码 import 时报错，但不再使用
