const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

type QueryValue = string | number | boolean | null | undefined;

function buildPath(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(path, API_BASE);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(buildPath(path), {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "请求失败");
  }
  return json as T;
}

function pageItems<T>(value: { items?: T[] } | T[]): T[] {
  return Array.isArray(value) ? value : value.items || [];
}

export const api = {
  async currentUser() {
    return requestJson("/api/users/current");
  },

  async members() {
    return requestJson("/api/members");
  },

  async dashboard() {
    return requestJson("/api/dashboard");
  },

  async products(query?: { keyword?: string; category?: string; sortBy?: string }) {
    const res = await requestJson<any>("/api/products", { method: "GET" });
    return pageItems(res);
  },

  async product(id: string) {
    return requestJson(`/api/products/${id}`);
  },

  async createProduct(payload: Record<string, unknown>) {
    return requestJson("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async productAssets(productId: string) {
    return requestJson(`/api/products/${productId}/assets`);
  },

  async productScripts(productId: string) {
    return requestJson(`/api/products/${productId}/scripts`);
  },

  async createProductScript(productId: string, payload: Record<string, unknown>) {
    return requestJson(`/api/products/${productId}/scripts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async projects() {
    const res = await requestJson<any>("/api/projects");
    return pageItems(res);
  },

  async createProject(payload: Record<string, unknown>) {
    return requestJson("/api/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async jobs(type?: string) {
    const res = await requestJson<any>(`/api/jobs${type ? `?type=${type}` : ''}`);
    return pageItems(res);
  },

  async createJob(payload: Record<string, unknown>) {
    return requestJson("/api/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async agentChat(payload: Record<string, unknown>) {
    return requestJson<{
      reply: string;
      thinking?: string[];
      changes?: Array<{
        type: string;
        target: string;
        summary: string;
        newText?: string;
        status?: string;
        imageCandidates?: Array<{
          id: string;
          title: string;
          style?: string;
          prompt: string;
          imageUrl: string;
        }>;
        videoPlan?: {
          duration?: number;
          aspectRatio?: string;
          motion?: string;
          prompt?: string;
          shots?: string[];
        };
        editActions?: Array<{
          action: string;
          target: string;
          value: string;
        }>;
      }>;
      provider?: string;
      model?: string;
      trace?: any[];
      conversation?: unknown;
    }>("/api/agent/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async agentGenerate(payload: Record<string, unknown>) {
    return requestJson<{
      success: boolean;
      data: {
        productAnalysis?: any;
        analysis?: any;
        script?: any;
        storyboard?: any[];
        videoPrompts?: any[];
        timeline?: any;
        taskId?: string;
        taskStatus?: string;
        previewUrl?: string;
        mockVideoUrl?: string;
        previewResult?: any;
        trace?: any[];
      };
      message?: string;
    }>("/api/agent/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async agentGenerateStream(payload: any, onProgress: (msg: string, state: any) => void) {
    const submitResponse = await requestJson<{ success: boolean; data?: { taskId: string } }>("/api/task/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!submitResponse.data?.taskId) {
      throw new Error("任务提交失败，未返回 taskId");
    }

    const taskId = submitResponse.data.taskId;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const taskStatusRes = await requestJson<{ success: boolean; data?: any }>(`/api/task/status?taskId=${taskId}`);
          const taskStatus = taskStatusRes.data;
          
          if (!taskStatus) return;

          if (taskStatus.message) {
            onProgress(taskStatus.message, taskStatus.result?.state || {});
          }

          if (taskStatus.status === "completed") {
            clearInterval(interval);
            resolve({ success: true, data: taskStatus.result?.finalState || taskStatus.result?.state });
          } else if (taskStatus.status === "failed") {
            clearInterval(interval);
            reject(new Error(taskStatus.error || "生成失败"));
          }
        } catch (e) {
          clearInterval(interval);
          reject(e);
        }
      }, 1000); // 轮询间隔 1 秒
    });
  },

  async agentChatStream(payload: any, onProgress: (msg: string, toolCall: any, toolResult: any) => void) {
    const response = await fetch(buildPath("/api/agent/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Agent 对话失败");
      }
      if (data.reply) {
        onProgress(data.reply, null, null);
      }
      if (data.changes && data.changes.length > 0) {
        for (const change of data.changes) {
          onProgress("", null, change);
        }
      }
      return;
    }

    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
  
    const processChunk = (chunk: string) => {
      if (!chunk.trim()) return;
      
      // Fallback for raw JSON if server misbehaved on content-type
      if (chunk.trim().startsWith("{")) {
        try {
          const data = JSON.parse(chunk);
          if (data.reply) onProgress(data.reply, null, null);
          if (data.changes) {
            for (const change of data.changes) onProgress("", null, change);
          }
          return;
        } catch(e) {}
      }

      const typeMatch = chunk.match(/event:\s*(.*?)(?:\r?\n|$)/);
      const dataMatch = chunk.match(/data:\s*(.*)(?:\r?\n|$)/);
      if (typeMatch && dataMatch) {
        const type = typeMatch[1].trim();
        try {
          const data = JSON.parse(dataMatch[1].trim());
          if (type === "message") {
            onProgress(data.text || "", null, null);
          } else if (type === "done") {
            // Final event: dispatch any storyboard changes as toolResult
            if (data.changes && Array.isArray(data.changes)) {
              for (const change of data.changes) {
                onProgress("", null, change);
              }
            }
          } else if (type === "tool_call") {
            onProgress("", data.call, null);
          } else if (type === "tool_result") {
            onProgress("", null, data);
          } else if (type === "error") {
            throw new Error(data.message);
          }
        } catch(e) {
          console.error("Parse error:", e, dataMatch[1]);
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) processChunk(buffer);
        break;
      }
  
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split(/\r?\n\r?\n/);
      buffer = chunks.pop() || "";
      
      for (const chunk of chunks) {
        processChunk(chunk);
      }
    }
  },

  async agentConversations() {
    return requestJson<{ items: unknown[]; store?: string }>("/api/agent/conversations");
  },

  async agentGenerateClip(payload: Record<string, unknown>) {
    return requestJson<{
      taskId?: string;
      message?: string;
    }>("/api/generate-clip", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async agentGenerateClipStatus(taskId: string) {
    return requestJson<any>(`/api/generate-clip/status?taskId=${taskId}`);
  },
};
