import { agentGraph } from "./graph.js";

/**
 * 原有的入口函数，现在代理给 LangGraph
 * @param {Object} payload 前端传来的请求数据
 * @param {string} payload.message 用户的最新文本输入
 * @param {Array} payload.messages 历史消息记录
 * @param {Array} payload.attachments 附件列表
 * @param {string} payload.model 前端选择的模型（如 Pro, Standard 等）
 */
export async function runAgentChat(payload) {
  const message = String(payload?.message || "").trim();
  const attachments = Array.isArray(payload?.attachments) ? payload.attachments.map(String) : [];
  
  // 转换历史消息格式，确保它不包含空数据
  const historyMessages = Array.isArray(payload?.messages) ? payload.messages.map(m => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.text || m.content || "")
  })).filter(m => m.content.trim()) : [];

  // 初始化 LangGraph 状态
  const initialState = {
    inputMessage: message,
    attachments: attachments,
    messages: historyMessages,
    // 映射默认模型名称
    modelName: process.env.AGENT_MODEL || process.env.DOUBAO_MODEL || "doubao-seed-2-0-lite-260428",
  };

  try {
    // 运行 Graph
    console.log(`[LangGraph] 开始执行，用户输入: ${message}`);
    const resultState = await agentGraph.invoke(initialState);
    console.log(`[LangGraph] 执行完成，意图识别为: ${resultState.intent}`);
    
    // 提取结果并返回符合前端要求的数据格式
    const finalResponse = resultState.finalResponse;
    return {
      reply: finalResponse.reply || "我无法提供有效的回答，请重试。",
      thinking: finalResponse.thinking || [],
      changes: finalResponse.changes || [],
      provider: "langgraph",
      model: initialState.modelName
    };
  } catch (error) {
    console.error("[LangGraph] 执行过程中发生错误:", error);
    return {
      reply: `抱歉，Agent 在处理您的请求时发生了错误：${error.message}`,
      thinking: ["执行出错，已进入降级处理"],
      changes: [],
      provider: "error",
      model: initialState.modelName
    };
  }
}
