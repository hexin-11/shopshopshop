import { generateText } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput, splitDuration, parseLLMJson } from "./helpers.js";

export const StoryboardAgent = {
  async run({ input, analysis, script }) {
    const normalized = normalizeAgentInput(input);
    const shotCount = normalized.duration <= 20 ? 3 : normalized.duration <= 45 ? 4 : 6;
    
    const llm = await generateText({
      messages: buildAgentMessages(
        "StoryboardAgent",
        `把脚本拆成 ${shotCount} 个分镜，每个分镜包含画面、字幕、口播、镜头和转场。
以合法的JSON数组格式返回，不要包含markdown语法：
[
  {
    "scene": "场景标题（如：开场吸引）",
    "visual": "画面描述",
    "subtitle": "字幕内容",
    "voiceover": "口播内容",
    "camera": "镜头运镜说明",
    "transition": "转场方式"
  }
]`,
        { input: normalized, analysis, script },
      ),
      temperature: 0.45,
    });

    const durations = splitDuration(normalized.duration, shotCount);
    let scenes = [];

    if (llm.mock) {
      scenes = [
        {
          scene: "开场吸引",
          visual: `${normalized.productName}主视觉快速出现，画面突出${normalized.sellingPoints[0] || ''}`,
          subtitle: script.hook,
          voiceover: script.hook,
          camera: "稳定推进，商品居中",
          transition: "自然切换",
        },
        {
          scene: "痛点建立",
          visual: `${normalized.targetAudience}在真实使用场景中遇到选择难题`,
          subtitle: analysis.targetPainPoints[0] || "",
          voiceover: script.problem,
          camera: "轻微横移，突出细节",
          transition: "自然切换",
        },
        {
          scene: "卖点演示",
          visual: `用近景展示${normalized.productName}的${normalized.sellingPoints.join("、")}`,
          subtitle: normalized.sellingPoints.join(" / "),
          voiceover: script.solution,
          camera: "稳定推进，商品居中",
          transition: "自然切换",
        },
        {
          scene: "场景种草",
          visual: `${normalized.platform}风格生活化场景，展示商品上手效果`,
          subtitle: `${normalized.tone}，更容易种草`,
          voiceover: `${normalized.productName}适合${normalized.targetAudience}在日常场景里使用。`,
          camera: "轻微横移，突出细节",
          transition: "自然切换",
        },
        {
          scene: "信任强化",
          visual: `对比普通选择和${normalized.productName}的体验差异`,
          subtitle: `重点看${normalized.sellingPoints[0] || ''}`,
          voiceover: `真正影响购买决策的，是卖点能不能被快速看见。`,
          camera: "稳定推进，商品居中",
          transition: "自然切换",
        },
        {
          scene: "行动引导",
          visual: `商品定格，出现购买引导和品牌收尾`,
          subtitle: script.cta,
          voiceover: script.cta,
          camera: "轻微横移，突出细节",
          transition: "自然切换",
        },
      ];
    } else {
      const parsed = parseLLMJson(llm.content);
      scenes = Array.isArray(parsed) ? parsed : [];
    }

    // Ensure we only take up to `shotCount` scenes and pad missing durations/fields
    return scenes.slice(0, shotCount).map((shot, index) => ({
      shotId: index + 1,
      duration: durations[index] || 5,
      scene: shot.scene || `分镜 ${index + 1}`,
      visual: shot.visual || "",
      subtitle: shot.subtitle || "",
      voiceover: shot.voiceover || "",
      camera: shot.camera || (index % 2 === 0 ? "稳定推进" : "轻微横移"),
      transition: shot.transition || (index === shotCount - 1 ? "淡出" : "自然切换"),
      llmTrace: compactTrace(`storyboard_shot_${index + 1}`, llm),
    }));
  },
};
