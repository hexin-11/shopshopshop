import { generateText } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput, splitDuration } from "./helpers.js";

export const StoryboardAgent = {
  async run({ input, analysis, script }) {
    const normalized = normalizeAgentInput(input);
    const llm = await generateText({
      messages: buildAgentMessages(
        "StoryboardAgent",
        "把脚本拆成 3 到 6 个分镜，每个分镜包含时长、画面、字幕、口播、镜头和转场。",
        { input: normalized, analysis, script },
      ),
      temperature: 0.45,
    });

    const shotCount = normalized.duration <= 20 ? 3 : normalized.duration <= 45 ? 4 : 6;
    const durations = splitDuration(normalized.duration, shotCount);
    const scenes = [
      {
        scene: "开场吸引",
        visual: `${normalized.productName}主视觉快速出现，画面突出${normalized.sellingPoints[0]}`,
        subtitle: script.hook,
        voiceover: script.hook,
      },
      {
        scene: "痛点建立",
        visual: `${normalized.targetAudience}在真实使用场景中遇到选择难题`,
        subtitle: analysis.targetPainPoints[0],
        voiceover: script.problem,
      },
      {
        scene: "卖点演示",
        visual: `用近景展示${normalized.productName}的${normalized.sellingPoints.join("、")}`,
        subtitle: normalized.sellingPoints.join(" / "),
        voiceover: script.solution,
      },
      {
        scene: "场景种草",
        visual: `${normalized.platform}风格生活化场景，展示商品上手效果`,
        subtitle: `${normalized.tone}，更容易种草`,
        voiceover: `${normalized.productName}适合${normalized.targetAudience}在日常场景里使用。`,
      },
      {
        scene: "信任强化",
        visual: `对比普通选择和${normalized.productName}的体验差异`,
        subtitle: `重点看${normalized.sellingPoints[0]}`,
        voiceover: `真正影响购买决策的，是卖点能不能被快速看见。`,
      },
      {
        scene: "行动引导",
        visual: `商品定格，出现购买引导和品牌收尾`,
        subtitle: script.cta,
        voiceover: script.cta,
      },
    ];

    return scenes.slice(0, shotCount).map((shot, index) => ({
      shotId: index + 1,
      duration: durations[index],
      scene: shot.scene,
      visual: shot.visual,
      subtitle: shot.subtitle,
      voiceover: shot.voiceover,
      camera: index % 2 === 0 ? "稳定推进，商品居中" : "轻微横移，突出细节",
      transition: index === shotCount - 1 ? "淡出到行动引导" : "自然切换",
      llmTrace: compactTrace(`storyboard_shot_${index + 1}`, llm),
    }));
  },
};
