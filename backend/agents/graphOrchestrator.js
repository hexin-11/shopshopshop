import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { getArkConfig, isArkMockEnabled, createVideoTask, getVideoTask } from "../services/arkClient.js";
import { normalizeAgentInput, compactTrace } from "./helpers.js";

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
  const llm = getLLM();
  
  const prompt = `你是一个专业的电商短视频分析师。
请根据以下商品信息，分析核心价值、目标痛点、卖点、视频切入角度和推荐风格。
以JSON格式返回：
{
  "coreValue": "一段话描述核心价值",
  "targetPainPoints": ["痛点1", "痛点2", "痛点3"],
  "mainSellingPoints": ["卖点1", "卖点2"],
  "videoAngle": "视频切入角度描述",
  "recommendedStyle": "风格描述"
}
商品信息：
${JSON.stringify(normalized, null, 2)}`;

  let analysisData;
  if (isArkMockEnabled()) {
    const firstPoint = normalized.sellingPoints[0] || "核心卖点";
    analysisData = {
      coreValue: `${normalized.productName}的核心价值是解决痛点`,
      targetPainPoints: ["痛点1", "痛点2"],
      mainSellingPoints: normalized.sellingPoints,
      videoAngle: "痛点切入",
      recommendedStyle: normalized.style
    };
  } else {
    const res = await llm.invoke([new SystemMessage("输出合法的JSON格式对象。"), new HumanMessage(prompt)]);
    analysisData = parseLLMJson(res.content);
  }

  // Preserve the same fields as the old agent
  analysisData.llm = { model: getArkConfig().textModel, provider: "ark" };
  analysisData.trace = compactTrace("product_analysis", analysisData.llm);

  return { normalized, analysis: analysisData };
}

async function scriptNode(state) {
  const { normalized, analysis } = state;
  const llm = getLLM();

  const prompt = `根据以下分析，编写一个电商短视频剧本（15-30秒）。
分析结果：${JSON.stringify(analysis)}
请返回JSON格式：
{
  "hook": "开场前3秒的吸引点台词",
  "problem": "痛点描述台词",
  "solution": "解决痛点的台词",
  "sellingPoints": ["卖点台词1", "卖点台词2"],
  "cta": "结尾引导购买的台词",
  "fullVoiceover": "完整的旁白内容"
}`;

  let scriptData;
  if (isArkMockEnabled()) {
    scriptData = {
      hook: "这是一个Hook", problem: "这是一个痛点", solution: "这是解决方案",
      sellingPoints: ["卖点1"], cta: "赶快购买吧", fullVoiceover: "完整旁白"
    };
  } else {
    const res = await llm.invoke([new SystemMessage("输出合法的JSON格式对象。"), new HumanMessage(prompt)]);
    scriptData = parseLLMJson(res.content);
  }

  scriptData.llm = { model: getArkConfig().textModel, provider: "ark" };
  scriptData.trace = compactTrace("script_generation", scriptData.llm);

  return { script: scriptData };
}

async function storyboardNode(state) {
  const { normalized, analysis, script } = state;
  const llm = getLLM();

  const prompt = `根据以下剧本，拆分成3-6个分镜。
剧本：${JSON.stringify(script)}
视频时长：${normalized.duration}秒
以JSON数组格式返回，格式如下：
[
  {
    "scene": "场景名称",
    "visual": "画面描述",
    "subtitle": "字幕",
    "voiceover": "口播",
    "camera": "镜头语言",
    "transition": "转场方式"
  }
]`;

  let storyboardRaw;
  if (isArkMockEnabled()) {
    storyboardRaw = [
      { scene: "开场", visual: "展示商品", subtitle: script.hook, voiceover: script.hook, camera: "推镜头", transition: "硬切" },
      { scene: "结尾", visual: "引导购买", subtitle: script.cta, voiceover: script.cta, camera: "定镜头", transition: "淡出" }
    ];
  } else {
    const res = await llm.invoke([new SystemMessage("输出合法的JSON数组格式。"), new HumanMessage(prompt)]);
    storyboardRaw = parseLLMJson(res.content);
  }

  // Calculate durations
  const shotCount = storyboardRaw.length;
  const avgDuration = Math.max(2, Math.floor(normalized.duration / shotCount));
  
  const storyboard = storyboardRaw.map((shot, index) => ({
    shotId: index + 1,
    duration: avgDuration,
    scene: shot.scene,
    visual: shot.visual,
    subtitle: shot.subtitle,
    voiceover: shot.voiceover,
    camera: shot.camera,
    transition: shot.transition,
    llmTrace: compactTrace(`storyboard_shot_${index+1}`, { model: getArkConfig().textModel })
  }));

  return { storyboard };
}

async function videoPromptNode(state) {
  const { normalized, storyboard } = state;
  const llm = getLLM();

  const prompt = `为以下分镜生成文生视频的Prompt。
分镜：${JSON.stringify(storyboard)}
风格：${normalized.style}
返回JSON数组：
[
  {
    "shotId": 1,
    "prompt": "画面英文或中文提示词",
    "negativePrompt": "负面提示词"
  }
]`;

  let promptsRaw;
  if (isArkMockEnabled()) {
    promptsRaw = storyboard.map(s => ({ shotId: s.shotId, prompt: s.visual + " prompt", negativePrompt: "bad quality" }));
  } else {
    const res = await llm.invoke([new SystemMessage("输出合法的JSON数组格式。"), new HumanMessage(prompt)]);
    promptsRaw = parseLLMJson(res.content);
  }

  const videoPrompts = promptsRaw.map(p => ({
    shotId: p.shotId,
    mode: "text-to-video",
    prompt: p.prompt,
    negativePrompt: p.negativePrompt || "low quality, text, watermark",
    style: normalized.style,
    aspectRatio: "9:16",
    llmTrace: compactTrace(`video_prompt_${p.shotId}`, { model: getArkConfig().textModel })
  }));

  return { videoPrompts };
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
