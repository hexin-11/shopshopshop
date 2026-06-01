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
    return pageItems(await getWithFallback("/api/products", fallback, { ...query, pageSize: 100 }));
  },

  async product(id: string) {
    return getWithFallback(`/api/products/${id}`, fallbackProducts.find((item) => item.id === id) || fallbackProducts[0]);
  },

  async createProduct(payload: Record<string, unknown>) {
    return requestJson("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
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
};
