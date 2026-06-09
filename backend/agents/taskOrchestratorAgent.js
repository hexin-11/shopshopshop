import { createVideoTask, generateText, getVideoTask } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput } from "./helpers.js";
import { ProductAnalysisAgent } from "./productAnalysisAgent.js";
import { ScriptAgent } from "./scriptAgent.js";
import { StoryboardAgent } from "./storyboardAgent.js";
import { VideoPromptAgent } from "./videoPromptAgent.js";

function buildTimeline(input, storyboard, videoPrompts) {
  const normalized = normalizeAgentInput(input);
  let cursor = 0;
  const tracks = {
    video: [],
    subtitle: [],
    voiceover: [],
    bgm: [],
  };

  storyboard.forEach((shot) => {
    const start = cursor;
    const end = cursor + shot.duration;
    tracks.video.push({
      id: `video-${shot.shotId}`,
      shotId: shot.shotId,
      start,
      end,
      prompt: videoPrompts.find((prompt) => prompt.shotId === shot.shotId)?.prompt || "",
    });
    tracks.subtitle.push({ id: `subtitle-${shot.shotId}`, shotId: shot.shotId, start, end, text: shot.subtitle });
    tracks.voiceover.push({ id: `voiceover-${shot.shotId}`, shotId: shot.shotId, start, end, text: shot.voiceover });
    cursor = end;
  });

  tracks.bgm.push({
    id: "bgm-1",
    start: 0,
    end: cursor,
    mood: normalized.tone,
    volume: 0.35,
  });

  return {
    duration: cursor,
    tracks,
  };
}

export const TaskOrchestratorAgent = {
  async run(input) {
    const normalized = normalizeAgentInput(input);
    const orchestrationLlm = await generateText({
      messages: buildAgentMessages(
        "TaskOrchestratorAgent",
        "编排商品分析、脚本生成、分镜生成、视频提示词生成和视频任务创建流程。",
        normalized,
      ),
      temperature: 0.2,
    });

    const analysis = await ProductAnalysisAgent.run(normalized);
    const script = await ScriptAgent.run({ input: normalized, analysis });
    const storyboard = await StoryboardAgent.run({ input: normalized, analysis, script });
    const videoPrompts = await VideoPromptAgent.run({ input: normalized, storyboard });
    const timeline = buildTimeline(normalized, storyboard, videoPrompts);
    const firstPrompt = videoPrompts[0]?.prompt || normalized.productName;
    const task = await createVideoTask({
      prompt: firstPrompt,
      duration: Math.min(10, Math.max(3, Math.round(timeline.duration / Math.max(1, storyboard.length)))),
      ratio: "9:16",
      generateAudio: true,
    });
    const taskStatus = await getVideoTask(task.taskId);
    const previewResult = {
      taskId: taskStatus.taskId,
      status: taskStatus.status,
      progress: taskStatus.progress ?? 0,
      previewUrl: taskStatus.previewUrl,
      exportUrl: taskStatus.exportUrl,
      mock: taskStatus.mock,
      checks: {
        subtitle: timeline.tracks.subtitle.length > 0,
        voiceover: timeline.tracks.voiceover.length > 0,
        productMaterial: Boolean(videoPrompts.length),
        aspectRatio: "9:16",
        resolution: normalized.resolution || "1080x1920",
        duration: timeline.duration,
      },
    };

    return {
      productAnalysis: analysis,
      analysis,
      script,
      storyboard,
      videoPrompts,
      timeline,
      taskId: task.taskId,
      taskStatus: taskStatus.status,
      previewUrl: previewResult.previewUrl,
      mockVideoUrl: previewResult.previewUrl,
      task,
      previewResult,
      trace: [
        compactTrace("orchestration", orchestrationLlm),
        analysis.trace,
        script.trace,
        ...storyboard.map((shot) => shot.llmTrace),
        ...videoPrompts.map((prompt) => prompt.llmTrace),
        {
          step: "video_task",
          provider: task.provider,
          model: task.model,
          mock: task.mock,
          status: taskStatus.status,
          generatedAt: new Date().toISOString(),
        },
      ],
    };
  },
};
