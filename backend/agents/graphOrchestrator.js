import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { getArkConfig, isArkMockEnabled, createVideoTask, getVideoTask } from "../services/arkClient.js";
import { normalizeAgentInput, compactTrace } from "./helpers.js";
import { ProductAnalysisAgent } from "./productAnalysisAgent.js";
import { ScriptAgent } from "./scriptAgent.js";
import { StoryboardAgent } from "./storyboardAgent.js";
import { VideoPromptAgent } from "./videoPromptAgent.js";

// === Define State Schema ===
const GraphState = {
  input: {
    value: (x, y) => (y ? y : x),
    default: () => ({}),
  },
  normalized: {
    value: (x, y) => (y ? y : x),
    default: () => ({}),
  },
  analysis: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
  script: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
  storyboard: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
  videoPrompts: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
  timeline: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
  taskId: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
  taskStatus: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
  task: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
  previewResult: {
    value: (x, y) => (y ? y : x),
    default: () => null,
  },
};

// === Helper to get LangChain Model ===
function getLLM(streaming = false) {
  const config = getArkConfig();
  if (config.mock) {
    // Return a dummy model for mock mode
    return {
      invoke: async () => ({ content: "{}" }),
      stream: async function* () { yield { content: "{}" }; },
      withStructuredOutput: (schema) => ({
        invoke: async () => {
          // Provide generic mock data based on schema shape (not strictly correct but avoids error in mock)
          return {};
        }
      })
    };
  }

  const llm = new ChatOpenAI({
    modelName: config.textModel,
    apiKey: config.apiKey,
    configuration: {
      baseURL: config.textEndpoint.replace(/\/chat\/completions$/, ""),
    },
    temperature: 0.4,
    streaming,
    modelKwargs: {
      thinking: { type: "disabled" }
    }
  });
  return llm;
}

// Ensure JSON parsing from LLM text
function parseLLMJson(text) {
  try {
    let cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", text);
    throw new Error("Failed to parse LLM response as JSON");
  }
}

// === Nodes ===

async function analyzeNode(state) {
  const normalized = normalizeAgentInput(state.input);
  const analysisData = await ProductAnalysisAgent.run(normalized);
  return { normalized, analysis: analysisData };
}

async function scriptNode(state) {
  const { normalized, analysis } = state;
  const scriptData = await ScriptAgent.run({ input: normalized, analysis });
  return { script: scriptData };
}

async function storyboardNode(state) {
  const { normalized, analysis, script } = state;
  const storyboardArray = await StoryboardAgent.run({ input: normalized, analysis, script });
  return { storyboard: storyboardArray };
}

async function videoPromptNode(state) {
  const { normalized, storyboard } = state;
  const videoPromptsArray = await VideoPromptAgent.run({ input: normalized, storyboard });
  return { videoPrompts: videoPromptsArray };
}

function buildTimeline(normalized, storyboard, videoPrompts) {
  let cursor = 0;
  const tracks = { video: [], subtitle: [], voiceover: [], bgm: [] };

  storyboard.forEach((shot) => {
    const start = cursor;
    const end = cursor + shot.duration;
    tracks.video.push({
      id: `video-${shot.shotId}`,
      shotId: shot.shotId,
      start,
      end,
      prompt: videoPrompts.find((p) => p.shotId === shot.shotId)?.prompt || "",
    });
    tracks.subtitle.push({ id: `subtitle-${shot.shotId}`, shotId: shot.shotId, start, end, text: shot.subtitle });
    tracks.voiceover.push({ id: `voiceover-${shot.shotId}`, shotId: shot.shotId, start, end, text: shot.voiceover });
    cursor = end;
  });

  tracks.bgm.push({ id: "bgm-1", start: 0, end: cursor, mood: normalized.tone, volume: 0.35 });

  return { duration: cursor, tracks };
}

async function createVideoTaskNode(state) {
  const { normalized, storyboard, videoPrompts } = state;
  const timeline = buildTimeline(normalized, storyboard, videoPrompts);
  
  const firstPrompt = videoPrompts[0]?.prompt || normalized.productName;
  const duration = Math.min(10, Math.max(3, Math.round(timeline.duration / Math.max(1, storyboard.length))));
  
  // Submit asynchronous task
  const task = await createVideoTask({
    prompt: firstPrompt,
    duration,
    ratio: "9:16",
    generateAudio: true,
  });

  const previewResult = {
    taskId: task.taskId,
    status: task.status, // queued
    progress: 0,
    previewUrl: null,
    exportUrl: null,
    mock: task.mock,
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
    timeline,
    taskId: task.taskId,
    taskStatus: task.status,
    task,
    previewResult,
  };
}

// === Build the Graph ===
const workflow = new StateGraph({ channels: GraphState })
  .addNode("generateAnalysis", analyzeNode)
  .addNode("generateScript", scriptNode)
  .addNode("generateStoryboard", storyboardNode)
  .addNode("generateVideoPrompt", videoPromptNode)
  .addNode("submitVideoTask", createVideoTaskNode)
  .addEdge(START, "generateAnalysis")
  .addEdge("generateAnalysis", "generateScript")
  .addEdge("generateScript", "generateStoryboard")
  .addEdge("generateStoryboard", "generateVideoPrompt")
  .addEdge("generateVideoPrompt", "submitVideoTask")
  .addEdge("submitVideoTask", END);

export const agentGraph = workflow.compile();

export async function runAgentGraphStream(input, onProgress) {
  const stream = await agentGraph.stream({ input });
  let finalState = {};

  for await (const chunk of stream) {
    const nodeName = Object.keys(chunk)[0];
    const nodeState = chunk[nodeName];
    Object.assign(finalState, nodeState);

    // Map node name to a friendly message for the UI
    let progressMsg = "";
    switch (nodeName) {
      case "generateAnalysis": progressMsg = "完成商品卖点和痛点分析"; break;
      case "generateScript": progressMsg = "成功撰写短视频带货脚本"; break;
      case "generateStoryboard": progressMsg = "已将脚本拆解为具体的视频分镜"; break;
      case "generateVideoPrompt": progressMsg = "完成各分镜的视觉生成提示词构建"; break;
      case "submitVideoTask": progressMsg = "视频合成任务已成功下发到云端"; break;
    }

    if (onProgress && progressMsg) {
      onProgress(progressMsg, finalState);
    }
  }

  return finalState;
}
