import { generateText } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput, parseLLMJson } from "./helpers.js";

export const ScriptAgent = {
  async run({ input, analysis }) {
    const normalized = normalizeAgentInput(input);
    const llm = await generateText({
      messages: buildAgentMessages(
        "ScriptAgent",
        `基于商品分析生成带货短视频脚本。
以合法的JSON格式返回，不要包含markdown语法：
{
  "hook": "开场前3秒的吸引点台词",
  "problem": "痛点描述台词",
  "solution": "解决痛点的台词",
  "sellingPoints": ["卖点台词1", "卖点台词2"],
  "cta": "结尾引导购买的台词",
  "fullVoiceover": "完整的旁白内容"
}`,
        { input: normalized, analysis },
      ),
      temperature: 0.5,
    });

    let data;
    if (llm.mock) {
      const sellingPoints = normalized.sellingPoints.map((point, index) => `卖点${index + 1}：${point}`);
      data = {
        hook: `如果你正在找一款${normalized.category}，先看完${normalized.productName}这几个细节。`,
        problem: analysis.targetPainPoints[0] || "痛点",
        solution: `${normalized.productName}把${normalized.sellingPoints.join("、")}组合在一起，适合${normalized.targetAudience}日常使用。`,
        sellingPoints,
        cta: `想要${normalized.tone}又有转化力的${normalized.platform}视频，可以直接用这套脚本生成成片。`,
        fullVoiceover: `如果你正在找一款${normalized.category}，先看完${normalized.productName}这几个细节。很多${normalized.targetAudience}在选择时最担心的是体验不够稳定、卖点不够真实。${normalized.productName}的重点是${normalized.sellingPoints.join("、")}，用起来更贴近日常场景。最后记得把它放进你的种草清单，适合做一条${normalized.platform}带货短视频。`,
      };
    } else {
      data = parseLLMJson(llm.content);
    }

    return {
      ...data,
      llm,
      trace: compactTrace("script_generation", llm),
    };
  },
};
