import { generateText } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput } from "./helpers.js";

export const ScriptAgent = {
  async run({ input, analysis }) {
    const normalized = normalizeAgentInput(input);
    const llm = await generateText({
      messages: buildAgentMessages(
        "ScriptAgent",
        "基于商品分析生成带货短视频脚本，包含 hook、problem、solution、sellingPoints、cta、fullVoiceover。",
        { input: normalized, analysis },
      ),
      temperature: 0.5,
    });

    const sellingPoints = normalized.sellingPoints.map((point, index) => `卖点${index + 1}：${point}`);

    return {
      hook: `如果你正在找一款${normalized.category}，先看完${normalized.productName}这几个细节。`,
      problem: analysis.targetPainPoints[0],
      solution: `${normalized.productName}把${normalized.sellingPoints.join("、")}组合在一起，适合${normalized.targetAudience}日常使用。`,
      sellingPoints,
      cta: `想要${normalized.tone}又有转化力的${normalized.platform}视频，可以直接用这套脚本生成成片。`,
      fullVoiceover: `如果你正在找一款${normalized.category}，先看完${normalized.productName}这几个细节。很多${normalized.targetAudience}在选择时最担心的是体验不够稳定、卖点不够真实。${normalized.productName}的重点是${normalized.sellingPoints.join("、")}，用起来更贴近日常场景。最后记得把它放进你的种草清单，适合做一条${normalized.platform}带货短视频。`,
      llm,
      trace: compactTrace("script_generation", llm),
    };
  },
};
