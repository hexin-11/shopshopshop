import { generateText } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput } from "./helpers.js";

export const VideoPromptAgent = {
  async run({ input, storyboard }) {
    const normalized = normalizeAgentInput(input);
    const llm = await generateText({
      messages: buildAgentMessages(
        "VideoPromptAgent",
        "根据每个分镜生成文生视频或图生视频 prompt，输出适合 9:16 电商短视频模型的提示词。",
        { input: normalized, storyboard },
      ),
      temperature: 0.45,
    });

    return storyboard.map((shot) => ({
      shotId: shot.shotId,
      mode: "text-to-video",
      prompt: `${normalized.style}风格，${normalized.platform}电商带货短视频，${shot.visual}，镜头语言：${shot.camera}，字幕内容：${shot.subtitle}，商品名称：${normalized.productName}`,
      negativePrompt: "低清晰度，画面畸变，文字乱码，商品被遮挡，过度闪烁，人物手部错误，品牌信息错误",
      style: normalized.style,
      aspectRatio: "9:16",
      llmTrace: compactTrace(`video_prompt_${shot.shotId}`, llm),
    }));
  },
};
