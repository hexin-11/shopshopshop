import { normalizeProductInput } from "../utils/aigcResponse.js";

export function normalizeAgentInput(input = {}) {
  return normalizeProductInput(input);
}

export function buildAgentMessages(agentName, instruction, payload) {
  return [
    {
      role: "system",
      content: `你是 VibeGen AI 的 ${agentName}。请输出适合电商 AIGC 带货视频系统的结构化结果。`,
    },
    {
      role: "user",
      content: `${instruction}\n\n输入数据：${JSON.stringify(payload, null, 2)}`,
    },
  ];
}

export function splitDuration(duration, count) {
  const safeDuration = Math.max(9, Number(duration || 30));
  const base = Math.max(3, Math.floor(safeDuration / count));
  return Array.from({ length: count }, (_, index) =>
    index === count - 1 ? Math.max(3, safeDuration - base * (count - 1)) : base
  );
}

export function compactTrace(step, llmResult) {
  return {
    step,
    provider: llmResult.provider,
    model: llmResult.model,
    mock: llmResult.mock,
    generatedAt: new Date().toISOString(),
  };
}

export function parseLLMJson(text) {
  try {
    // 先清理 markdown 代码块
    let cleanText = String(text || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    // 尝试从文本中提取第一个 {...} 块
    try {
      const match = String(text || "").match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch (e2) {}
    // 返回原始文本，不抛错，避免流水线卡死
    console.warn("[parseLLMJson] 无法解析 JSON，返回空对象。原始内容:", String(text || "").slice(0, 200));
    return {};
  }
}
