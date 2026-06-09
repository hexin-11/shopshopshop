import {
  assets as fallbackAssets,
  catalog as fallbackProducts,
  dashboardMetrics,
  jobs as fallbackJobs,
  members as fallbackMembers,
  platformPerformance,
  productScripts as fallbackProductScripts,
  projects as fallbackProjects,
  user as fallbackUser,
} from "../data/mockData";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

type QueryValue = string | number | boolean | null | undefined;

const LOCAL_PRODUCTS_KEY = "vibegen-local-products";

function readLocalProducts() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_PRODUCTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalProduct(product: Record<string, unknown>) {
  const products = readLocalProducts();
  window.localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify([product, ...products]));
}

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

async function getWithFallback<T>(path: string, fallback: T, query?: Record<string, QueryValue>): Promise<T> {
  try {
    return await requestJson<T>(buildPath(path, query));
  } catch {
    return fallback;
  }
}

function pageItems<T>(value: { items?: T[] } | T[]): T[] {
  return Array.isArray(value) ? value : value.items || [];
}

export const api = {
  async currentUser() {
    return getWithFallback("/api/users/current", fallbackUser);
  },

  async members() {
    return getWithFallback("/api/members", fallbackMembers);
  },

  async dashboard() {
    return getWithFallback("/api/dashboard", {
      metrics: dashboardMetrics,
      activeJobs: fallbackJobs.filter((job) => job.type === "generating"),
      recentProducts: fallbackProducts.slice(0, 5),
      platformPerformance,
    });
  },

  async products(query?: { keyword?: string; category?: string; sortBy?: string }) {
    const fallback = { items: [...fallbackProducts] as any[] };
    const remoteItems = pageItems(await getWithFallback("/api/products", fallback, { ...query, pageSize: 100 }));
    const localItems = readLocalProducts();
    return [...localItems, ...remoteItems.filter((item: any) => !localItems.some((local: any) => local.id === item.id))];
  },

  async product(id: string) {
    const localProduct = readLocalProducts().find((item: any) => item.id === id);
    return localProduct || getWithFallback(`/api/products/${id}`, fallbackProducts.find((item) => item.id === id) || fallbackProducts[0]);
  },

  async createProduct(payload: Record<string, unknown>) {
    try {
      return await requestJson("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      const product = {
        id: `prod-${Date.now()}`,
        name: payload.name || "新商品",
        brand: payload.brand || "",
        category: payload.category || "未分类",
        description: payload.description || "",
        mainImage: payload.mainImage || "",
        assetCount: payload.assetCount || 0,
        scriptCount: payload.scriptCount || 0,
        projectCount: payload.projectCount || 0,
        status: "制作中",
        updatedAt: "刚刚",
      };
      saveLocalProduct(product);
      return product;
    }
  },

  async productAssets(productId: string) {
    return getWithFallback(`/api/products/${productId}/assets`, fallbackAssets);
  },

  async productScripts(productId: string) {
    return getWithFallback(`/api/products/${productId}/scripts`, fallbackProductScripts[productId] || []);
  },

  async createProductScript(productId: string, payload: Record<string, unknown>) {
    return requestJson(`/api/products/${productId}/scripts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async projects() {
    return pageItems(await getWithFallback("/api/projects", { items: fallbackProjects as any[] }, { pageSize: 100 }));
  },

  async createProject(payload: Record<string, unknown>) {
    return requestJson("/api/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async jobs(type?: string) {
    return pageItems(await getWithFallback("/api/jobs", { items: fallbackJobs as any[] }, { type, pageSize: 100 }));
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

  async agentChatStream(payload: { messages: any[], context: any }, onProgress: (msg: string, toolCall: any, toolResult: any) => void) {
    const response = await fetch(buildPath("/api/agent/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split(/\r?\n\r?\n/);
      buffer = chunks.pop() || "";
      
      for (const chunk of chunks) {
        if (!chunk.trim()) continue;
        const typeMatch = chunk.match(/event:\s*(.*?)(?:\r?\n|$)/);
        const dataMatch = chunk.match(/data:\s*(.*)(?:\r?\n|$)/);
        if (typeMatch && dataMatch) {
          const type = typeMatch[1].trim();
          try {
            const data = JSON.parse(dataMatch[1].trim());
            if (type === "message") {
              onProgress(data.text, null, null);
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
      }
    }
    return { success: true };
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
