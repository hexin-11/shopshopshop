export function ok(data, meta = {}) {
  return {
    success: true,
    data,
    ...meta,
  };
}

export function fail(message, details) {
  return {
    success: false,
    message,
    ...(details ? { details } : {}),
  };
}

export function createMockId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function normalizeProductInput(payload = {}) {
  const sellingPoints = Array.isArray(payload.sellingPoints) && payload.sellingPoints.length
    ? payload.sellingPoints.map(String)
    : ["核心卖点清晰", "适合短视频展示", "具备电商转化价值"];

  return {
    productName: String(payload.productName || payload.name || "").trim(),
    category: String(payload.category || "未分类"),
    price: String(payload.price || "待定"),
    sellingPoints,
    targetAudience: String(payload.targetAudience || "目标消费人群"),
    platform: String(payload.platform || "小红书"),
    duration: Number(payload.duration || 30),
    tone: String(payload.tone || "自然生活化"),
    videoType: String(payload.videoType || "口播带货"),
    style: String(payload.style || payload.recommendedStyle || "清新自然"),
  };
}
