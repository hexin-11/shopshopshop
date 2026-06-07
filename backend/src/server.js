import { createServer } from "node:http";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, basename } from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createDatabaseAssetStore } from "./storage/databaseAssetStore.js";
import { createDatabaseAppStore } from "./storage/databaseAppStore.js";
import { createJsonAssetStore } from "./storage/jsonAssetStore.js";
import { createJsonAppStore } from "./storage/jsonAppStore.js";
import { createJsonAgentStore } from "./storage/jsonAgentStore.js";
import { runAgentChat } from "./agent/chatAgent.js";
import { loadEnvFile } from "./config/env.js";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
await loadEnvFile(rootDir);
const uploadDir = join(rootDir, "uploads");
const port = Number(process.env.PORT || 8787);
const storeType = process.env.ASSET_STORE || "json";
const appStoreType = process.env.APP_STORE || "json";
const assetStore = storeType === "database" ? createDatabaseAssetStore() : createJsonAssetStore({ rootDir });
const appStore = appStoreType === "database" ? createDatabaseAppStore() : createJsonAppStore({ rootDir });
const agentStore = createJsonAgentStore({ rootDir });

const assetTypes = new Set(["商品图片", "商品视频", "生活方式图", "参考视频", "音频 / BGM"]);
const editableFields = new Set(["fileName", "type", "category", "tags", "uploader", "mimeType", "size"]);

const mimeMap = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav"
};

async function ensureStorage() {
  await mkdir(uploadDir, { recursive: true });
}

async function readAssets() {
  await ensureStorage();
  return assetStore.list();
}

async function writeAssets(assets) {
  await assetStore.saveAll(assets);
}

async function readAppData() {
  await ensureStorage();
  return appStore.read();
}

async function writeAppData(data) {
  await appStore.write(data);
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(body));
}

function sendNoContent(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end();
}

function notFound(res) {
  sendJson(res, 404, { message: "资源不存在" });
}

function badRequest(res, message, details) {
  sendJson(res, 400, { message, details });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("请求体不是合法 JSON");
  }
}

function parseQuery(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return {
    pathname: decodeURIComponent(url.pathname),
    searchParams: url.searchParams
  };
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => String(tag).trim()).filter(Boolean);
}

function createId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

function pickBody(payload, allowedFields) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => allowedFields.has(key) && value !== undefined)
  );
}

function filterProducts(products, searchParams) {
  const keyword = (searchParams.get("keyword") || searchParams.get("q") || "").trim().toLowerCase();
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "latest";

  const filtered = products.filter((product) => {
    const matchesKeyword =
      !keyword ||
      [product.name, product.brand, product.category].join(" ").toLowerCase().includes(keyword);
    const matchesCategory = !category || category === "全部" || product.category === category;
    return matchesKeyword && matchesCategory;
  });

  if (sortBy === "name") {
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return filtered;
}

function buildDashboard(data) {
  const activeJobs = data.renderJobs.filter((job) => job.type === "generating");
  return {
    metrics: data.analyticsSnapshots,
    activeJobs,
    recentProducts: data.products.slice(0, 5),
    platformPerformance: data.platformPerformance
  };
}

function buildDatabaseManifest() {
  return {
    store: appStore.name,
    collections: [
      { name: "users", purpose: "登录用户、角色、头像、邮箱" },
      { name: "members", purpose: "团队成员、在线状态、协作位置" },
      { name: "products", purpose: "商品库、品牌、分类、主图、状态、统计计数" },
      { name: "productAssets", purpose: "商品详情页里的素材卡片和素材归属关系" },
      { name: "productScripts", purpose: "每个商品的 AI 脚本版本、分镜文本、作者和时间" },
      { name: "videoProjects", purpose: "视频项目列表、权限、比例、进度、负责人" },
      { name: "renderJobs", purpose: "生成/渲染任务、进度、Trace Terminal 日志" },
      { name: "comments", purpose: "项目协作评论、目标镜头、解决状态" },
      { name: "agentConversations", purpose: "客户和 Agent 的历史会话、置顶状态和参考资料" },
      { name: "agentMessages", purpose: "每条用户/Agent 消息、思考摘要和结构化修改结果" },
      { name: "agentChangeEvents", purpose: "脚本、字幕、视频节奏、素材替换等 Agent 修改建议事件" },
      { name: "analyticsSnapshots", purpose: "仪表盘指标卡片和阶段性统计快照" },
      { name: "platformPerformance", purpose: "TikTok、YouTube、Instagram 等平台趋势数据" },
      { name: "auditLogs", purpose: "后续记录创建、更新、发布、渲染等操作审计" },
      { name: "editorProjects", purpose: "OpenCut 工程数据预留；当前仍由浏览器 IndexedDB 管理" },
      { name: "editorMedia", purpose: "OpenCut 媒体、波形、字幕、转写缓存预留；当前仍由本地缓存管理" }
    ],
    fileStores: [
      { name: "assetFiles", path: "backend/uploads", purpose: "素材原文件、渲染输入和导出视频" }
    ]
  };
}

function makeTitle(text) {
  const clean = String(text || "").trim().replace(/\s+/g, " ");
  if (!clean) return "新会话";
  return clean.length > 18 ? `${clean.slice(0, 18)}...` : clean;
}

function normalizeConversation(conversation) {
  return {
    id: conversation.id,
    title: conversation.title || "新会话",
    updatedAt: conversation.updatedAt || conversation.createdAt || new Date().toISOString(),
    pinned: Boolean(conversation.pinned),
    references: Array.isArray(conversation.references) ? conversation.references : [],
    messages: Array.isArray(conversation.messages) ? conversation.messages : [],
  };
}

async function listAgentConversations() {
  const data = await agentStore.read();
  return (data.conversations || []).map(normalizeConversation);
}

async function saveAgentExchange(payload, result) {
  const data = await agentStore.read();
  const now = new Date().toISOString();
  const conversations = Array.isArray(data.conversations) ? data.conversations : [];
  const messageText = String(payload.message || "分析附件");
  const conversationId = String(payload.conversationId || createId("agent-conv"));
  let conversation = conversations.find((item) => String(item.id) === conversationId);

  if (!conversation) {
    conversation = {
      id: conversationId,
      title: makeTitle(messageText),
      pinned: false,
      references: Array.isArray(payload.references) ? payload.references.map(String) : [],
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    conversations.unshift(conversation);
  }

  if (!conversation.title || conversation.title === "新会话") {
    conversation.title = makeTitle(messageText);
  }
  conversation.references = Array.from(new Set([...(conversation.references || []), ...((payload.references || []).map(String))]));
  conversation.updatedAt = now;
  conversation.messages = [
    ...(conversation.messages || []),
    {
      id: createId("agent-msg"),
      role: "user",
      text: messageText,
      attachments: Array.isArray(payload.attachments) ? payload.attachments.map(String) : [],
      createdAt: now,
    },
    {
      id: createId("agent-msg"),
      role: "agent",
      text: result.reply,
      thinking: Array.isArray(result.thinking) ? result.thinking : [],
      changes: Array.isArray(result.changes) ? result.changes : [],
      provider: result.provider,
      model: result.model,
      createdAt: now,
    },
  ];

  data.conversations = conversations;
  await agentStore.write(data);
  return normalizeConversation(conversation);
}

function validateCreatePayload(payload) {
  const errors = [];
  if (!payload.fileName || typeof payload.fileName !== "string") errors.push("fileName 必填");
  if (!payload.type || !assetTypes.has(payload.type)) errors.push("type 必须是合法素材类型");
  if (!payload.category || typeof payload.category !== "string") errors.push("category 必填");
  if (!payload.uploader || typeof payload.uploader !== "string") errors.push("uploader 必填");
  if (payload.tags !== undefined && !Array.isArray(payload.tags)) errors.push("tags 必须是数组");
  if (payload.contentBase64 && typeof payload.contentBase64 !== "string") errors.push("contentBase64 必须是字符串");
  return errors;
}

function filterAssets(assets, searchParams) {
  const keyword = (searchParams.get("keyword") || "").trim().toLowerCase();
  const type = searchParams.get("type") || "";
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";
  const uploader = searchParams.get("uploader") || "";
  const updatedWithin = Number(searchParams.get("updatedWithin") || 0);
  const now = Date.now();

  return assets.filter((asset) => {
    const fields = [asset.fileName, asset.type, asset.category, asset.uploader, ...(asset.tags || [])].join(" ").toLowerCase();
    const matchesKeyword = !keyword || fields.includes(keyword);
    const matchesType = !type || type === "全部" || asset.type === type;
    const matchesCategory = !category || category === "全部" || asset.category === category;
    const matchesTag = !tag || tag === "全部" || asset.tags?.includes(tag);
    const matchesUploader = !uploader || uploader === "全部" || asset.uploader === uploader;
    const matchesUpdatedWithin = !updatedWithin || now - new Date(asset.updatedAt).getTime() <= updatedWithin * 24 * 60 * 60 * 1000;
    return matchesKeyword && matchesType && matchesCategory && matchesTag && matchesUploader && matchesUpdatedWithin;
  });
}

function paginate(items, searchParams) {
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 12)));
  const start = (page - 1) * pageSize;
  return {
    page,
    pageSize,
    total: items.length,
    items: items.slice(start, start + pageSize)
  };
}

function buildFilters(assets) {
  const uniq = (values) => Array.from(new Set(values.filter(Boolean))).sort();
  return {
    types: uniq(assets.map((asset) => asset.type)),
    categories: uniq(assets.map((asset) => asset.category)),
    tags: uniq(assets.flatMap((asset) => asset.tags || [])),
    uploaders: uniq(assets.map((asset) => asset.uploader))
  };
}

function buildSummary(assets) {
  const byType = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {});
  const totalSize = assets.reduce((sum, asset) => sum + Number(asset.size || 0), 0);
  const totalUsed = assets.reduce((sum, asset) => sum + Number(asset.used || 0), 0);
  return {
    total: assets.length,
    totalSize,
    totalUsed,
    byType
  };
}

async function saveUploadIfPresent(payload, id) {
  if (!payload.contentBase64) return null;
  const extension = extname(payload.fileName || "") || ".bin";
  const safeFileName = `${id}${extension}`;
  const filePath = join(uploadDir, safeFileName);
  const buffer = Buffer.from(payload.contentBase64, "base64");
  await writeFile(filePath, buffer);
  return `/uploads/${safeFileName}`;
}

async function serveUpload(pathname, res) {
  const fileName = pathname.replace("/uploads/", "");
  if (!fileName || fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) return notFound(res);
  const filePath = join(uploadDir, fileName);
  try {
    await stat(filePath);
  } catch {
    return notFound(res);
  }
  const contentType = mimeMap[extname(fileName).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=86400"
  });
  createReadStream(filePath).pipe(res);
}

async function handleApi(req, res) {
  const { pathname, searchParams } = parseQuery(req);

  if (req.method === "OPTIONS") return sendNoContent(res);
  if (pathname === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, {
      status: "ok",
      service: "shopclip-backend",
      assetStore: assetStore.name,
      appStore: appStore.name,
      time: new Date().toISOString()
    });
  }

  if (pathname === "/api/database/manifest" && req.method === "GET") {
    return sendJson(res, 200, buildDatabaseManifest());
  }

  if (pathname === "/api/bootstrap" && req.method === "GET") {
    const data = await readAppData();
    return sendJson(res, 200, {
      user: data.users[0] || null,
      members: data.members,
      products: data.products,
      projects: data.videoProjects,
      jobs: data.renderJobs,
      analytics: data.analyticsSnapshots,
      platformPerformance: data.platformPerformance
    });
  }

  if (pathname === "/api/agent/conversations" && req.method === "GET") {
    return sendJson(res, 200, { items: await listAgentConversations(), store: agentStore.name });
  }

  if (pathname === "/api/agent/chat" && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }

    if (!payload.message && !payload.attachments?.length) {
      return badRequest(res, "message 或 attachments 必填");
    }

    try {
      const result = await runAgentChat(payload);
      const conversation = await saveAgentExchange(payload, result);
      return sendJson(res, 200, { ...result, conversation });
    } catch (error) {
      return sendJson(res, error.statusCode || 500, {
        message: error.message || "Agent 暂时无法回复",
        details: error.details,
      });
    }
  }

  if (pathname === "/api/dashboard" && req.method === "GET") {
    return sendJson(res, 200, buildDashboard(await readAppData()));
  }

  if (pathname === "/api/users/current" && req.method === "GET") {
    const data = await readAppData();
    return sendJson(res, 200, data.users[0] || null);
  }

  if (pathname === "/api/members" && req.method === "GET") {
    const data = await readAppData();
    return sendJson(res, 200, data.members);
  }

  if (pathname === "/api/analytics/summary" && req.method === "GET") {
    const data = await readAppData();
    return sendJson(res, 200, {
      stats: data.analyticsSnapshots,
      platformPerformance: data.platformPerformance
    });
  }

  if (pathname === "/api/products/meta/filters" && req.method === "GET") {
    const data = await readAppData();
    const categories = Array.from(new Set(data.products.map((product) => product.category))).sort();
    const statuses = Array.from(new Set(data.products.map((product) => product.status))).sort();
    return sendJson(res, 200, { categories, statuses });
  }

  if (pathname === "/api/products" && req.method === "GET") {
    const data = await readAppData();
    return sendJson(res, 200, paginate(filterProducts(data.products, searchParams), searchParams));
  }

  if (pathname === "/api/products" && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }

    if (!payload.name || !payload.brand || !payload.category) {
      return badRequest(res, "name、brand、category 必填");
    }

    const data = await readAppData();
    const now = new Date().toISOString();
    const product = {
      id: payload.id || createId("prod"),
      name: String(payload.name).trim(),
      brand: String(payload.brand).trim(),
      category: String(payload.category).trim(),
      assetCount: Number(payload.assetCount || 0),
      scriptCount: Number(payload.scriptCount || 0),
      projectCount: Number(payload.projectCount || 0),
      status: payload.status || "制作中",
      updatedAt: payload.updatedAt || "刚刚",
      mainImage: payload.mainImage || "",
      description: payload.description || "",
      createdAt: now
    };
    data.products.unshift(product);
    data.auditLogs.push({ id: createId("audit"), action: "product.create", targetId: product.id, createdAt: now });
    await writeAppData(data);
    return sendJson(res, 201, product);
  }

  const productAssetsMatch = pathname.match(/^\/api\/products\/([^/]+)\/assets$/);
  if (productAssetsMatch && req.method === "GET") {
    const data = await readAppData();
    const productId = productAssetsMatch[1];
    return sendJson(res, 200, data.productAssets.filter((asset) => !asset.productId || asset.productId === productId));
  }

  const productScriptsMatch = pathname.match(/^\/api\/products\/([^/]+)\/scripts$/);
  if (productScriptsMatch && req.method === "GET") {
    const data = await readAppData();
    return sendJson(res, 200, data.productScripts[productScriptsMatch[1]] || []);
  }

  if (productScriptsMatch && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const productId = productScriptsMatch[1];
    const data = await readAppData();
    if (!data.products.some((product) => product.id === productId)) return notFound(res);

    const now = new Date().toISOString();
    const scripts = data.productScripts[productId] || [];
    const script = {
      id: payload.id || createId("script"),
      versionLabel: payload.versionLabel || `v${scripts.length + 1} 新脚本`,
      note: payload.note || "新生成的脚本版本。",
      author: payload.author || "ShopClip AI",
      time: payload.time || "刚刚",
      content: Array.isArray(payload.content) ? payload.content : []
    };
    data.productScripts[productId] = [script, ...scripts];
    const product = data.products.find((item) => item.id === productId);
    product.scriptCount = data.productScripts[productId].length;
    product.updatedAt = "刚刚";
    data.auditLogs.push({ id: createId("audit"), action: "script.create", targetId: script.id, productId, createdAt: now });
    await writeAppData(data);
    return sendJson(res, 201, script);
  }

  const productProjectsMatch = pathname.match(/^\/api\/products\/([^/]+)\/projects$/);
  if (productProjectsMatch && req.method === "GET") {
    const data = await readAppData();
    return sendJson(res, 200, data.videoProjects.filter((project) => project.productId === productProjectsMatch[1]));
  }

  const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch && req.method === "GET") {
    const data = await readAppData();
    const product = data.products.find((item) => item.id === productMatch[1]);
    if (!product) return notFound(res);
    return sendJson(res, 200, product);
  }

  if (productMatch && req.method === "PATCH") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const data = await readAppData();
    const product = data.products.find((item) => item.id === productMatch[1]);
    if (!product) return notFound(res);
    Object.assign(product, pickBody(payload, new Set(["name", "brand", "category", "status", "mainImage", "description", "assetCount", "scriptCount", "projectCount"])));
    product.updatedAt = payload.updatedAt || "刚刚";
    data.auditLogs.push({ id: createId("audit"), action: "product.update", targetId: product.id, createdAt: new Date().toISOString() });
    await writeAppData(data);
    return sendJson(res, 200, product);
  }

  if (productMatch && req.method === "DELETE") {
    const data = await readAppData();
    const index = data.products.findIndex((item) => item.id === productMatch[1]);
    if (index === -1) return notFound(res);
    const [product] = data.products.splice(index, 1);
    delete data.productScripts[product.id];
    data.productAssets = data.productAssets.filter((asset) => asset.productId !== product.id);
    data.videoProjects = data.videoProjects.filter((project) => project.productId !== product.id);
    data.auditLogs.push({ id: createId("audit"), action: "product.delete", targetId: product.id, createdAt: new Date().toISOString() });
    await writeAppData(data);
    return sendJson(res, 200, { deleted: true, id: product.id });
  }

  if (pathname === "/api/projects" && req.method === "GET") {
    const data = await readAppData();
    return sendJson(res, 200, paginate(data.videoProjects, searchParams));
  }

  if (pathname === "/api/projects" && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    if (!payload.name) return badRequest(res, "name 必填");

    const data = await readAppData();
    const now = new Date().toISOString();
    const project = {
      id: payload.id || createId("project"),
      productId: payload.productId || null,
      name: String(payload.name).trim(),
      product: payload.product || "",
      owner: payload.owner || "何鑫",
      status: payload.status || "排队中",
      updated: payload.updated || "刚刚",
      visibility: payload.visibility || "Private",
      progress: Number(payload.progress || 0),
      ratio: payload.ratio || "9:16"
    };
    data.videoProjects.unshift(project);
    const product = data.products.find((item) => item.id === project.productId);
    if (product) {
      product.projectCount = data.videoProjects.filter((item) => item.productId === product.id).length;
      product.updatedAt = "刚刚";
    }
    data.auditLogs.push({ id: createId("audit"), action: "project.create", targetId: project.id, createdAt: now });
    await writeAppData(data);
    return sendJson(res, 201, project);
  }

  const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projectMatch && req.method === "GET") {
    const data = await readAppData();
    const project = data.videoProjects.find((item) => item.id === projectMatch[1]);
    if (!project) return notFound(res);
    return sendJson(res, 200, project);
  }

  if (projectMatch && req.method === "PATCH") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const data = await readAppData();
    const project = data.videoProjects.find((item) => item.id === projectMatch[1]);
    if (!project) return notFound(res);
    Object.assign(project, pickBody(payload, new Set(["name", "product", "owner", "status", "visibility", "progress", "ratio"])));
    project.updated = payload.updated || "刚刚";
    data.auditLogs.push({ id: createId("audit"), action: "project.update", targetId: project.id, createdAt: new Date().toISOString() });
    await writeAppData(data);
    return sendJson(res, 200, project);
  }

  if (pathname === "/api/jobs" && req.method === "GET") {
    const data = await readAppData();
    const type = searchParams.get("type");
    const jobs = type ? data.renderJobs.filter((job) => job.type === type) : data.renderJobs;
    return sendJson(res, 200, paginate(jobs, searchParams));
  }

  if (pathname === "/api/jobs" && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    if (!payload.name) return badRequest(res, "name 必填");

    const data = await readAppData();
    const job = {
      id: payload.id || createId("job"),
      projectId: payload.projectId || null,
      name: String(payload.name).trim(),
      project: payload.project || "",
      creator: payload.creator || "何鑫",
      stage: payload.stage || "等待中",
      progress: Number(payload.progress || 0),
      status: payload.status || "等待中",
      created: payload.created || "刚刚",
      type: payload.type || "generating",
      trace: Array.isArray(payload.trace) ? payload.trace : ["任务已进入队列"]
    };
    data.renderJobs.unshift(job);
    data.auditLogs.push({ id: createId("audit"), action: "job.create", targetId: job.id, createdAt: new Date().toISOString() });
    await writeAppData(data);
    return sendJson(res, 201, job);
  }

  const jobTraceMatch = pathname.match(/^\/api\/jobs\/([^/]+)\/trace$/);
  if (jobTraceMatch && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const data = await readAppData();
    const job = data.renderJobs.find((item) => item.id === jobTraceMatch[1]);
    if (!job) return notFound(res);
    job.trace = [...(job.trace || []), String(payload.line || "")].filter(Boolean);
    await writeAppData(data);
    return sendJson(res, 200, job);
  }

  const jobMatch = pathname.match(/^\/api\/jobs\/([^/]+)$/);
  if (jobMatch && req.method === "PATCH") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const data = await readAppData();
    const job = data.renderJobs.find((item) => item.id === jobMatch[1]);
    if (!job) return notFound(res);
    Object.assign(job, pickBody(payload, new Set(["stage", "progress", "status", "type"])));
    await writeAppData(data);
    return sendJson(res, 200, job);
  }

  if (pathname === "/api/comments" && req.method === "GET") {
    const data = await readAppData();
    const projectId = searchParams.get("projectId");
    const comments = projectId ? data.comments.filter((comment) => comment.projectId === projectId) : data.comments;
    return sendJson(res, 200, comments);
  }

  if (pathname === "/api/comments" && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    if (!payload.text) return badRequest(res, "text 必填");
    const data = await readAppData();
    const comment = {
      id: payload.id || createId("comment"),
      projectId: payload.projectId || null,
      author: payload.author || "何鑫",
      target: payload.target || "项目",
      text: String(payload.text).trim(),
      time: payload.time || "刚刚",
      solved: Boolean(payload.solved)
    };
    data.comments.unshift(comment);
    await writeAppData(data);
    return sendJson(res, 201, comment);
  }

  const commentMatch = pathname.match(/^\/api\/comments\/([^/]+)$/);
  if (commentMatch && req.method === "PATCH") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const data = await readAppData();
    const comment = data.comments.find((item) => item.id === commentMatch[1]);
    if (!comment) return notFound(res);
    Object.assign(comment, pickBody(payload, new Set(["target", "text", "solved"])));
    await writeAppData(data);
    return sendJson(res, 200, comment);
  }

  if (pathname === "/api/render-video" && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const { variables, settings } = payload;
    if (!variables) {
      return badRequest(res, "variables 必填");
    }

    const inputJsonPath = join(uploadDir, `render-input-${randomUUID()}.json`);
    await writeFile(inputJsonPath, JSON.stringify({ variables, settings }));

    const renderServerDir = join(rootDir, "twick-src", "packages", "render-server");
    const child = spawn("npx", ["tsx", "src/run-cli.ts", inputJsonPath, uploadDir], {
      cwd: renderServerDir,
      shell: true,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });

    child.on("close", async (code) => {
      await unlink(inputJsonPath).catch(() => {});

      if (code !== 0) {
        console.error("Render CLI error:", stderr);
        return sendJson(res, 500, { success: false, error: stderr || "渲染视频失败" });
      }

      const match = stdout.match(/RENDER_OUTPUT_PATH:(.+)/);
      if (!match) {
        return sendJson(res, 500, { success: false, error: "未找到渲染输出路径，日志: " + stdout });
      }

      const finalPath = match[1].trim();
      const filename = basename(finalPath);
      return sendJson(res, 200, {
        success: true,
        downloadUrl: `http://localhost:8787/uploads/${filename}`,
      });
    });
    return;
  }

  if (pathname === "/api/assets/meta/filters" && req.method === "GET") {
    return sendJson(res, 200, buildFilters(await readAssets()));
  }

  if (pathname === "/api/assets/meta/summary" && req.method === "GET") {
    return sendJson(res, 200, buildSummary(await readAssets()));
  }

  if (pathname === "/api/assets" && req.method === "GET") {
    const assets = await readAssets();
    const filtered = filterAssets(assets, searchParams);
    return sendJson(res, 200, paginate(filtered, searchParams));
  }

  if (pathname === "/api/assets" && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const errors = validateCreatePayload(payload);
    if (errors.length) return badRequest(res, "素材参数不完整", errors);

    const assets = await readAssets();
    const id = `asset-${randomUUID()}`;
    const now = new Date().toISOString();
    const url = await saveUploadIfPresent(payload, id);
    const asset = {
      id,
      fileName: payload.fileName.trim(),
      type: payload.type,
      category: payload.category.trim(),
      tags: normalizeTags(payload.tags),
      uploader: payload.uploader.trim(),
      used: 0,
      mimeType: payload.mimeType || "application/octet-stream",
      size: Number(payload.size || 0),
      url,
      createdAt: now,
      updatedAt: now
    };
    assets.unshift(asset);
    await writeAssets(assets);
    return sendJson(res, 201, asset);
  }

  const assetUseMatch = pathname.match(/^\/api\/assets\/([^/]+)\/use$/);
  if (assetUseMatch && req.method === "POST") {
    const assets = await readAssets();
    const asset = assets.find((item) => item.id === assetUseMatch[1]);
    if (!asset) return notFound(res);
    asset.used = Number(asset.used || 0) + 1;
    asset.updatedAt = new Date().toISOString();
    await writeAssets(assets);
    return sendJson(res, 200, asset);
  }

  const assetMatch = pathname.match(/^\/api\/assets\/([^/]+)$/);
  if (assetMatch && req.method === "GET") {
    const asset = (await readAssets()).find((item) => item.id === assetMatch[1]);
    if (!asset) return notFound(res);
    return sendJson(res, 200, asset);
  }

  if (assetMatch && req.method === "PATCH") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    const assets = await readAssets();
    const asset = assets.find((item) => item.id === assetMatch[1]);
    if (!asset) return notFound(res);

    for (const [key, value] of Object.entries(payload)) {
      if (!editableFields.has(key)) continue;
      asset[key] = key === "tags" ? normalizeTags(value) : value;
    }
    if (asset.type && !assetTypes.has(asset.type)) return badRequest(res, "type 必须是合法素材类型");
    asset.updatedAt = new Date().toISOString();
    await writeAssets(assets);
    return sendJson(res, 200, asset);
  }

  if (assetMatch && req.method === "DELETE") {
    const assets = await readAssets();
    const index = assets.findIndex((item) => item.id === assetMatch[1]);
    if (index === -1) return notFound(res);
    const [asset] = assets.splice(index, 1);
    if (asset.url?.startsWith("/uploads/")) {
      const fileName = asset.url.replace("/uploads/", "");
      await unlink(join(uploadDir, fileName)).catch(() => {});
    }
    await writeAssets(assets);
    return sendJson(res, 200, { deleted: true, id: asset.id });
  }

  if (pathname.startsWith("/uploads/") && req.method === "GET") {
    return serveUpload(pathname, res);
  }

  return notFound(res);
}

const server = createServer((req, res) => {
  handleApi(req, res).catch((error) => {
    console.error(error);
    sendJson(res, 500, { message: "服务器内部错误" });
  });
});

server.listen(port, () => {
  console.log(`ShopClip backend is running at http://localhost:${port}`);
});
