import { createServer } from "node:http";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, basename } from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createDatabaseAssetStore } from "./storage/databaseAssetStore.js";
import { createJsonAssetStore } from "./storage/jsonAssetStore.js";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const uploadDir = join(rootDir, "uploads");
const port = Number(process.env.PORT || 8787);
const storeType = process.env.ASSET_STORE || "json";
const assetStore = storeType === "database" ? createDatabaseAssetStore() : createJsonAssetStore({ rootDir });

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
    return sendJson(res, 200, { status: "ok", service: "shopclip-assets", store: assetStore.name, time: new Date().toISOString() });
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
  console.log(`ShopClip assets backend is running at http://localhost:${port}`);
});
