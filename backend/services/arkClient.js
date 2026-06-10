const DEFAULT_TEXT_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const DEFAULT_VIDEO_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";
const DEFAULT_TEXT_MODEL = "Doubao-Seed-2.0-lite";
const DEFAULT_VIDEO_MODEL = "Doubao-Seedance-1.5-pro";

export class ArkClientError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ArkClientError";
    this.status = options.status;
    this.code = options.code;
  }
}

function readBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() !== "false";
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function requireConfig(config, fields) {
  const missing = fields.filter((field) => !config[field]);
  if (missing.length) {
    throw new ArkClientError(`Missing Ark environment variables: ${missing.join(", ")}`, {
      code: "ARK_CONFIG_MISSING",
    });
  }
}

function safeErrorMessage(prefix, status, responseText) {
  let providerMessage = responseText;
  try {
    const json = JSON.parse(responseText);
    providerMessage = json?.error?.message || json?.message || responseText;
  } catch {
    providerMessage = responseText;
  }
  return `${prefix} failed with status ${status}: ${String(providerMessage).slice(0, 300)}`;
}

export function getArkConfig(env = process.env) {
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

export function isArkMockEnabled(env = process.env) {
  return getArkConfig(env).mock;
}

function uniqueValues(values) {
  return values.filter(Boolean).filter((value, index, array) => array.indexOf(value) === index);
}

export async function generateText(options, env = process.env) {
  const config = getArkConfig(env);

  if (config.mock) {
    const latestUserMessage = [...(options.messages || [])].reverse().find((message) => message.role === "user");
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

  const requestBody = JSON.stringify({
    model: config.textModel,
    messages: options.messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens,
  });
  const keyCandidates = uniqueValues([config.textApiKey, config.apiKey, config.videoApiKey]);
  let lastError = null;

  for (const apiKey of keyCandidates) {
    const response = await fetch(config.textEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: requestBody,
    });

    const responseText = await response.text();
    if (!response.ok) {
      lastError = new ArkClientError(safeErrorMessage("Ark text generation", response.status, responseText), {
        status: response.status,
        code: "ARK_TEXT_REQUEST_FAILED",
      });
      if (response.status === 401 && keyCandidates.length > 1) continue;
      throw lastError;
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

  throw lastError || new ArkClientError("Ark text generation failed", { code: "ARK_TEXT_REQUEST_FAILED" });
}

// Async generator – streams raw token strings from Ark (SSE)
export async function* generateTextStream(options, env = process.env) {
  const config = getArkConfig(env);

  if (config.mock) {
    const text = `这是 Mock 流式回复，收到输入：${
      [...(options.messages || [])].reverse().find(m => m.role === "user")?.content?.slice(0, 30) || ""
    }`;
    for (const char of text) {
      yield char;
      await new Promise(r => setTimeout(r, 18));
    }
    return;
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
      temperature: options.temperature ?? 0.6,
      stream: true,
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new ArkClientError(safeErrorMessage("Ark stream", response.status, errText), {
      status: response.status,
      code: "ARK_TEXT_REQUEST_FAILED",
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") return;
      try {
        const parsed = JSON.parse(raw);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch { /* skip malformed chunk */ }
    }
  }
}

export async function createVideoTask(options, env = process.env) {
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

export async function getVideoTask(taskId, env = process.env) {
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

export function createArkClient(env = process.env) {
  return {
    config: getArkConfig(env),
    generateText: (options) => generateText(options, env),
    createVideoTask: (options) => createVideoTask(options, env),
    getVideoTask: (taskId) => getVideoTask(taskId, env),
  };
}
