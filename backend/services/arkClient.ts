export type ArkRole = "system" | "user" | "assistant";

export type ArkMessage = {
  role: ArkRole;
  content: string;
};

export type ArkTextOptions = {
  messages: ArkMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type ArkVideoOptions = {
  prompt?: string;
  imageUrl?: string;
  duration?: number;
  ratio?: string;
  generateAudio?: boolean;
};

export type ArkConfig = {
  apiKey?: string;
  textApiKey?: string;
  videoApiKey?: string;
  textEndpoint: string;
  videoEndpoint: string;
  textModel: string;
  videoModel: string;
  mock: boolean;
};

type Env = Record<string, string | undefined>;

declare const process: { env: Env };

export class ArkClientError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, options: { status?: number; code?: string } = {}) {
    super(message);
    this.name = "ArkClientError";
    this.status = options.status;
    this.code = options.code;
  }
}

const DEFAULT_TEXT_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const DEFAULT_VIDEO_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";
const DEFAULT_TEXT_MODEL = "Doubao-Seed-2.0-lite";
const DEFAULT_VIDEO_MODEL = "Doubao-Seedance-1.5-pro";

function readBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() !== "false";
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function requireConfig(config: ArkConfig, fields: Array<keyof ArkConfig>) {
  const missing = fields.filter((field) => !config[field]);
  if (missing.length) {
    throw new ArkClientError(`Missing Ark environment variables: ${missing.join(", ")}`, {
      code: "ARK_CONFIG_MISSING",
    });
  }
}

function safeErrorMessage(prefix: string, status: number, responseText: string) {
  let providerMessage = responseText;
  try {
    const json = JSON.parse(responseText);
    providerMessage = json?.error?.message || json?.message || responseText;
  } catch {
    providerMessage = responseText;
  }
  return `${prefix} failed with status ${status}: ${String(providerMessage).slice(0, 300)}`;
}

export function getArkConfig(env: Env = process.env): ArkConfig {
  return {
    apiKey: env.ARK_API_KEY,
    textApiKey: env.ARK_TEXT_API_KEY || env.ARK_API_KEY,
    videoApiKey: env.ARK_VIDEO_API_KEY || env.ARK_API_KEY,
    textEndpoint: stripTrailingSlash(env.ARK_TEXT_MODEL_ENDPOINT || DEFAULT_TEXT_ENDPOINT),
    videoEndpoint: stripTrailingSlash(env.ARK_VIDEO_MODEL_ENDPOINT || DEFAULT_VIDEO_ENDPOINT),
    textModel: env.ARK_TEXT_MODEL_NAME || DEFAULT_TEXT_MODEL,
    videoModel: env.ARK_VIDEO_MODEL_NAME || DEFAULT_VIDEO_MODEL,
    mock: readBoolean(env.ARK_MOCK, true),
  };
}

export function isArkMockEnabled(env: Env = process.env) {
  return getArkConfig(env).mock;
}

export async function generateText(options: ArkTextOptions, env: Env = process.env) {
  const config = getArkConfig(env);

  if (config.mock) {
    const latestUserMessage = [...options.messages].reverse().find((message) => message.role === "user");
    return {
      id: `mock-text-${Date.now()}`,
      provider: "ark",
      model: config.textModel,
      mock: true,
      content: `Mock 文本生成结果：${latestUserMessage?.content || "已收到创作请求"}`,
      raw: null,
    };
  }

  requireConfig(config, ["textApiKey", "textEndpoint", "textModel"]);

  const response = await fetch(config.textEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.textApiKey}`,
    },
    body: JSON.stringify({
      model: config.textModel,
      messages: options.messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens,
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new ArkClientError(safeErrorMessage("Ark text generation", response.status, responseText), {
      status: response.status,
      code: "ARK_TEXT_REQUEST_FAILED",
    });
  }

  const raw = JSON.parse(responseText);
  return {
    id: raw.id,
    provider: "ark",
    model: config.textModel,
    mock: false,
    content: raw.choices?.[0]?.message?.content || "",
    raw,
  };
}

export async function createVideoTask(options: ArkVideoOptions, env: Env = process.env) {
  const config = getArkConfig(env);

  if (config.mock) {
    return {
      taskId: `mock-video-${Date.now()}`,
      provider: "ark",
      model: config.videoModel,
      mock: true,
      status: "queued",
      progress: 0,
      previewUrl: null,
      exportUrl: null,
    };
  }

  requireConfig(config, ["videoApiKey", "videoEndpoint", "videoModel"]);

  const content = [];
  if (options.prompt) content.push({ type: "text", text: options.prompt });
  if (options.imageUrl) content.push({ type: "image_url", image_url: { url: options.imageUrl } });
  if (!content.length) {
    throw new ArkClientError("prompt or imageUrl is required for Ark video generation", {
      code: "ARK_VIDEO_INPUT_REQUIRED",
    });
  }

  const response = await fetch(config.videoEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.videoApiKey}`,
    },
    body: JSON.stringify({
      model: config.videoModel,
      content,
      generate_audio: options.generateAudio ?? true,
      ratio: options.ratio || "9:16",
      duration: options.duration || 5,
      watermark: false,
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new ArkClientError(safeErrorMessage("Ark video task creation", response.status, responseText), {
      status: response.status,
      code: "ARK_VIDEO_REQUEST_FAILED",
    });
  }

  const raw = JSON.parse(responseText);
  return {
    taskId: raw.id || raw.task_id,
    provider: "ark",
    model: config.videoModel,
    mock: false,
    status: raw.status || "queued",
    raw,
  };
}

export async function getVideoTask(taskId: string, env: Env = process.env) {
  const config = getArkConfig(env);
  if (!taskId) {
    throw new ArkClientError("taskId is required", { code: "ARK_TASK_ID_REQUIRED" });
  }

  if (config.mock) {
    return {
      taskId,
      provider: "ark",
      model: config.videoModel,
      mock: true,
      status: "succeeded",
      progress: 100,
      previewUrl: `/uploads/mock/${taskId}-preview.mp4`,
      exportUrl: `/uploads/mock/${taskId}-export.mp4`,
    };
  }

  requireConfig(config, ["videoApiKey", "videoEndpoint"]);

  const response = await fetch(`${config.videoEndpoint}/${encodeURIComponent(taskId)}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.videoApiKey}`,
    },
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new ArkClientError(safeErrorMessage("Ark video task query", response.status, responseText), {
      status: response.status,
      code: "ARK_TASK_QUERY_FAILED",
    });
  }

  const raw = JSON.parse(responseText);
  return {
    taskId: raw.id || raw.task_id || taskId,
    provider: "ark",
    model: config.videoModel,
    mock: false,
    status: raw.status,
    progress: raw.progress,
    previewUrl: raw.content?.video_url || raw.video_url || null,
    exportUrl: raw.content?.video_url || raw.video_url || null,
    raw,
  };
}

export function createArkClient(env: Env = process.env) {
  return {
    config: getArkConfig(env),
    generateText: (options: ArkTextOptions) => generateText(options, env),
    createVideoTask: (options: ArkVideoOptions) => createVideoTask(options, env),
    getVideoTask: (taskId: string) => getVideoTask(taskId, env),
  };
}
