import { generateText } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput, splitDuration, parseLLMJson } from "./helpers.js";

export const StoryboardAgent = {
  async run({ input, analysis, script }) {
    const normalized = normalizeAgentInput(input);
    const shotCount = 5;
    
    const llm = await generateText({
      messages: buildAgentMessages(
        "StoryboardAgent",
        `把脚本严格拆成 5 个固定的分镜环节（不要多也不要少）。这5个环节必须分别是：
1. hook（痛点吸引）
2. product_reveal（产品亮相）
3. key_selling_point（核心卖点）
4. usage_scene（使用场景）
5. result_cta（效果与购买引导）

请以合法的JSON数组格式返回，不要包含markdown语法：
[
  {
    "scene": "环节名称（如：hook）",
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
          scene: "hook",
          visual: `${normalized.targetAudience}在真实使用场景中遇到选择难题，画面冲击力强`,
          subtitle: script.hook || "还在为选择发愁吗？",
          voiceover: script.hook || "你是不是也遇到过这种情况？",
          camera: "稳定推进，突出痛点",
          transition: "快速切换",
        },
        {
          scene: "product_reveal",
          visual: `${normalized.productName}主视觉快速出现，灯光打亮质感`,
          subtitle: "全新产品惊艳亮相",
          voiceover: `直到我发现了这款${normalized.productName}`,
          camera: "全景展示",
          transition: "自然切换",
        },
        {
          scene: "key_selling_point",
          visual: `用近景展示${normalized.productName}的${normalized.sellingPoints.join("、")}`,
          subtitle: normalized.sellingPoints.join(" / "),
          voiceover: script.solution || "它能完美解决你的痛点",
          camera: "局部特写",
          transition: "自然切换",
        },
        {
          scene: "usage_scene",
          visual: `${normalized.platform}风格生活化场景，展示商品实际佩戴或使用效果`,
          subtitle: `${normalized.tone}，更容易种草`,
          voiceover: `适合${normalized.targetAudience}在日常使用，体验极佳。`,
          camera: "轻微横移，跟随动作",
          transition: "自然切换",
        },
        {
          scene: "result_cta",
          visual: `商品定格，出现购买引导和品牌收尾，对比使用前后的明显变化`,
          subtitle: script.cta || "点击左下角链接，马上带回家",
          voiceover: script.cta || "现在下单还有专属优惠！",
          camera: "拉远定格",
          transition: "淡出",
        },
      ];
    } else {
      const parsed = parseLLMJson(llm.content);
      scenes = Array.isArray(parsed) ? parsed : [];
    }

    // Ensure we only take exactly 5 scenes and pad missing durations/fields
    return scenes.slice(0, 5).map((shot, index) => {
      const defaultScenes = ["hook", "product_reveal", "key_selling_point", "usage_scene", "result_cta"];
      return {
        shotId: index + 1,
        duration: durations[index] || 5,
        scene: shot.scene || defaultScenes[index],
        visual: shot.visual || "",
        subtitle: shot.subtitle || "",
        voiceover: shot.voiceover || "",
        camera: shot.camera || (index % 2 === 0 ? "稳定推进" : "轻微横移"),
        transition: shot.transition || (index === 4 ? "淡出" : "自然切换"),
        llmTrace: compactTrace(`storyboard_shot_${index + 1}`, llm),
      };
    });
  },
};
