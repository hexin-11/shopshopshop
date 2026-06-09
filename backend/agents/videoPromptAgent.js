import { generateText } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput, parseLLMJson } from "./helpers.js";

export const VideoPromptAgent = {
  async run({ input, storyboard }) {
    const normalized = normalizeAgentInput(input);
    const llm = await generateText({
      messages: buildAgentMessages(
        "VideoPromptAgent",
        `根据每个分镜生成视频生成提示词。
以合法的JSON数组格式返回，长度必须和输入的分镜数量一致，不要包含markdown语法：
[
  {
    "shotId": 1,
    "mode": "text-to-video",
    "prompt": "具体的视频生成提示词描述",
    "negativePrompt": "反向提示词"
  }
]`,
        { input: normalized, storyboard },
      ),
      temperature: 0.45,
    });

    let prompts = [];

    if (llm.mock) {
      prompts = storyboard.map((shot) => ({
        shotId: shot.shotId,
        mode: "text-to-video",
        prompt: `${normalized.style}风格，${normalized.platform}电商带货短视频，${shot.visual}，镜头语言：${shot.camera}，字幕内容：${shot.subtitle}，商品名称：${normalized.productName}`,
        negativePrompt: "低清晰度，画面畸变，文字乱码，商品被遮挡，过度闪烁，人物手部错误，品牌信息错误",
      }));
    } else {
      const parsed = parseLLMJson(llm.content);
      prompts = Array.isArray(parsed) ? parsed : [];
    }

    return storyboard.map((shot, index) => {
      const p = prompts.find(pr => pr.shotId === shot.shotId) || prompts[index] || {};
      return {
        shotId: shot.shotId,
        mode: p.mode || "text-to-video",
        prompt: p.prompt || `${normalized.style}风格，${shot.visual}，${shot.camera}`,
        negativePrompt: p.negativePrompt || "低清晰度，画面畸变，文字乱码",
        style: normalized.style,
        aspectRatio: "9:16",
        llmTrace: compactTrace(`video_prompt_${shot.shotId}`, llm),
      };
    });
  },
};
