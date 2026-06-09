import { mockMaterials, mockTasks } from "../data/mockAigcData.js";
import { createMockId, normalizeProductInput } from "../utils/aigcResponse.js";

function splitDuration(duration, count) {
  const base = Math.max(3, Math.floor(duration / count));
  return Array.from({ length: count }, (_, index) =>
    index === count - 1 ? Math.max(3, duration - base * (count - 1)) : base
  );
}

export function listMaterials(query = {}) {
  return mockMaterials.filter((material) => {
    const matchesProduct = !query.productId || material.productId === query.productId;
    const matchesType = !query.type || material.type === query.type;
    return matchesProduct && matchesType;
  });
}

export function uploadMaterial(payload = {}) {
  const material = {
    id: createMockId("mat"),
    productId: String(payload.productId || "unbound"),
    fileName: String(payload.fileName || payload.name || "uploaded-material"),
    type: String(payload.type || "image"),
    tags: Array.isArray(payload.tags) ? payload.tags.map(String) : [],
    url: String(payload.url || "/uploads/mock/material-placeholder"),
    bindTo: payload.bindTo || "project",
    createdAt: new Date().toISOString(),
  };
  mockMaterials.unshift(material);
  return material;
}

export function generateProductAnalysis(input) {
  const normalized = normalizeProductInput(input);
  return {
    coreValue: `${normalized.productName}面向${normalized.targetAudience}，主打${normalized.sellingPoints[0]}，适合在${normalized.platform}做${normalized.tone}表达。`,
    targetPainPoints: [
      `${normalized.targetAudience}需要快速理解${normalized.category}的真实价值`,
      `用户担心${normalized.price}是否值得购买`,
      `短视频里需要把${normalized.sellingPoints.join("、")}讲清楚`,
    ],
    mainSellingPoints: normalized.sellingPoints,
    videoAngle: `${normalized.videoType}：用${normalized.platform}用户熟悉的语气，把${normalized.productName}的使用场景和购买理由串起来。`,
    recommendedStyle: normalized.style,
  };
}

export function generateScript(input, analysis = generateProductAnalysis(input)) {
  const normalized = normalizeProductInput(input);
  const points = normalized.sellingPoints;
  return {
    hook: `如果你正在找一款${normalized.category}，先看看${normalized.productName}。`,
    problem: analysis.targetPainPoints[0],
    solution: `${normalized.productName}用${points.join("、")}解决日常使用里的关键顾虑。`,
    sellingPoints: points.map((point, index) => `卖点${index + 1}：${point}`),
    cta: `想在${normalized.platform}做出更自然的带货视频，可以把${normalized.productName}加入本次生成。`,
    fullVoiceover: `如果你正在找一款${normalized.category}，先看看${normalized.productName}。它的重点是${points.join("、")}，适合${normalized.targetAudience}。用${normalized.tone}的方式讲清楚，用户会更容易理解为什么值得买。`,
  };
}

export function generateStoryboard(input, script = generateScript(input)) {
  const normalized = normalizeProductInput(input);
  const shotCount = normalized.duration <= 20 ? 3 : normalized.duration <= 45 ? 4 : 6;
  const durations = splitDuration(normalized.duration, shotCount);
  const scenes = [
    ["开场吸引", `展示${normalized.productName}主视觉，突出${normalized.sellingPoints[0]}`],
    ["痛点呈现", script.problem],
    ["卖点演示", `用近景和手部操作展示${normalized.sellingPoints.join("、")}`],
    ["使用场景", `放入${normalized.targetAudience}在真实场景中使用${normalized.productName}`],
    ["对比强化", `强化${normalized.productName}和普通产品的差异`],
    ["行动引导", script.cta],
  ];

  return scenes.slice(0, shotCount).map(([scene, visual], index) => ({
    shotId: index + 1,
    duration: durations[index],
    scene,
    visual,
    subtitle: index === 0 ? script.hook : index === shotCount - 1 ? script.cta : normalized.sellingPoints[index % normalized.sellingPoints.length],
    voiceover: index === 0 ? script.hook : index === shotCount - 1 ? script.cta : visual,
    camera: index % 2 === 0 ? "稳定推进，商品居中" : "轻微横移，突出使用细节",
    transition: index === shotCount - 1 ? "淡出到购买引导" : "自然切换",
  }));
}

export function generateVideoPrompts(input, storyboard = generateStoryboard(input)) {
  const normalized = normalizeProductInput(input);
  return storyboard.map((shot) => ({
    shotId: shot.shotId,
    mode: "text-to-video",
    prompt: `${normalized.style}风格，${normalized.platform}电商短视频，${shot.visual}，字幕：${shot.subtitle}`,
    negativePrompt: "低清晰度，画面变形，文字错乱，商品遮挡，过度闪烁",
    style: normalized.style,
    aspectRatio: "9:16",
  }));
}

export function generateTimeline(input, storyboard, videoPrompts) {
  const duration = storyboard.reduce((sum, shot) => sum + shot.duration, 0);
  let cursor = 0;
  const video = [];
  const subtitle = [];
  const voiceover = [];

  storyboard.forEach((shot) => {
    video.push({ id: `video-${shot.shotId}`, shotId: shot.shotId, start: cursor, end: cursor + shot.duration, promptId: `prompt-${shot.shotId}` });
    subtitle.push({ id: `subtitle-${shot.shotId}`, shotId: shot.shotId, start: cursor, end: cursor + shot.duration, text: shot.subtitle });
    voiceover.push({ id: `voiceover-${shot.shotId}`, shotId: shot.shotId, start: cursor, end: cursor + shot.duration, text: shot.voiceover });
    cursor += shot.duration;
  });

  return {
    duration,
    tracks: {
      video,
      subtitle,
      voiceover,
      bgm: [{ id: "bgm-1", start: 0, end: duration, mood: normalizeProductInput(input).tone, volume: 0.35 }],
    },
    videoPrompts,
  };
}

export function generateVideoTask(input) {
  const normalized = normalizeProductInput(input);
  const taskId = createMockId("task");
  const task = {
    taskId,
    status: "queued",
    progress: 0,
    productName: normalized.productName || "未命名商品",
    previewUrl: null,
    exportUrl: null,
    createdAt: new Date().toISOString(),
  };
  mockTasks.set(taskId, task);
  return task;
}

export function getTask(taskId) {
  const task = mockTasks.get(taskId) || {
    taskId,
    status: "succeeded",
    progress: 100,
    previewUrl: `/uploads/mock/${taskId}-preview.mp4`,
    exportUrl: `/uploads/mock/${taskId}-export.mp4`,
    createdAt: new Date().toISOString(),
  };
  if (task.status === "queued") {
    task.status = "running";
    task.progress = 45;
  } else if (task.status === "running") {
    task.status = "succeeded";
    task.progress = 100;
    task.previewUrl = `/uploads/mock/${taskId}-preview.mp4`;
    task.exportUrl = `/uploads/mock/${taskId}-export.mp4`;
  }
  mockTasks.set(taskId, task);
  return task;
}

export function generateVideoPlan(input) {
  const normalized = normalizeProductInput(input);
  const analysis = generateProductAnalysis(normalized);
  const script = generateScript(normalized, analysis);
  const storyboard = generateStoryboard(normalized, script);
  const videoPrompts = generateVideoPrompts(normalized, storyboard);
  const timeline = generateTimeline(normalized, storyboard, videoPrompts);
  const task = generateVideoTask(normalized);

  return {
    analysis,
    script,
    storyboard,
    videoPrompts,
    timeline,
    task,
  };
}
