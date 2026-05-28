export type RouteKey =
  | "dashboard" | "products" | "projects" | "settings";

export const user = {
  name: "何鑫",
  email: "hexin@shopclip.ai",
  role: "Owner",
  avatar: "何"
};

export const members = [
  { name: "何鑫", role: "Owner", avatar: "何", online: true, editing: "剪辑台 / 镜头 1" },
  { name: "李明", role: "Editor", avatar: "李", online: true, editing: "脚本 v3" },
  { name: "王艺", role: "Editor", avatar: "王", online: false, editing: "素材库" },
  { name: "陈琳", role: "Viewer", avatar: "陈", online: true, editing: "评论区" }
];

export const projects = [
  { id: "p-earphone", name: "降噪耳机夏季促销", product: "Havit H630BT", owner: "何鑫", status: "已完成", updated: "2小时前", visibility: "Public/Shared", progress: 86, ratio: "9:16" },
  { id: "p-serum", name: "维生素 C 精华液", product: "Glow Labs", owner: "李明", status: "渲染中 60%", updated: "4小时前", visibility: "Private", progress: 60, ratio: "9:16" },
  { id: "p-bottle", name: "保温水杯短视频", product: "AquaFlow", owner: "王艺", status: "待审核", updated: "1天前", visibility: "Public/Shared", progress: 74, ratio: "1:1" },
  { id: "p-shoes", name: "跑鞋新品推广", product: "Stride Pro", owner: "陈琳", status: "排队中", updated: "1天前", visibility: "Private", progress: 28, ratio: "16:9" }
];

export const assets = [
  { name: "耳机主图-白底.png", type: "商品图片", tags: ["耳机", "白底", "主图"], owner: "王艺", used: 12, color: "from-blue-100 to-indigo-100" },
  { name: "佩戴场景-通勤.mp4", type: "商品视频", tags: ["生活方式", "通勤"], owner: "何鑫", used: 8, color: "from-slate-100 to-blue-100" },
  { name: "精华液质地图.jpg", type: "生活方式图", tags: ["美妆", "质感"], owner: "李明", used: 6, color: "from-violet-100 to-rose-100" },
  { name: "跑鞋开箱参考.mp4", type: "参考视频", tags: ["开箱", "运动"], owner: "陈琳", used: 4, color: "from-emerald-100 to-sky-100" },
  { name: "轻快促销 BGM.wav", type: "音频 / BGM", tags: ["BGM", "促销"], owner: "何鑫", used: 18, color: "from-amber-100 to-indigo-100" },
  { name: "水杯户外场景.jpg", type: "生活方式图", tags: ["户外", "水杯"], owner: "王艺", used: 7, color: "from-cyan-100 to-slate-100" }
];

export const scenes = [
  { id: 1, title: "钩子开场", tag: "痛点", duration: "0:05", owner: "李明", comments: 3 },
  { id: 2, title: "商品展示", tag: "卖点", duration: "0:06", owner: "何鑫", comments: 1 },
  { id: 3, title: "使用场景", tag: "场景", duration: "0:07", owner: "王艺", comments: 2 },
  { id: 4, title: "卖点强化", tag: "转化", duration: "0:05", owner: "陈琳", comments: 0 },
  { id: 5, title: "购买引导", tag: "CTA", duration: "0:04", owner: "何鑫", comments: 4 }
];

export const comments = [
  { author: "李明", target: "镜头 2", text: "字幕建议更短，适合移动端快速阅读。", time: "12分钟前", solved: false },
  { author: "王艺", target: "镜头 1", text: "@何鑫 开场图可以换成通勤场景素材。", time: "28分钟前", solved: false },
  { author: "陈琳", target: "脚本 v3", text: "英文版 CTA 已检查，语气自然。", time: "1小时前", solved: true }
];

export const jobs = [
  { id: "j-1", name: "耳机 9:16 TikTok 版", project: "降噪耳机夏季促销", creator: "何鑫", stage: "合成视频中", progress: 78, status: "合成视频中", created: "10:22", type: "generating", trace: ["10:22 素材分析完成，共识别 8 个商品特写", "10:23 匹配镜头 1-5 分镜模板", "10:24 TTS 旁白生成完成", "10:25 正在合成 9:16 主视频"] },
  { id: "j-2", name: "精华液 Reels 版", project: "维生素 C 精华液", creator: "李明", stage: "生成配音中", progress: 52, status: "生成配音中", created: "09:40", type: "generating", trace: ["09:40 商品卖点读取完成", "09:41 生成英文字幕草稿", "09:42 正在生成自然女声旁白"] },
  { id: "j-3", name: "水杯 Shorts 版", project: "保温水杯短视频", creator: "王艺", stage: "等待中", progress: 8, status: "等待中", created: "昨天", type: "generating", trace: ["任务已进入队列", "等待 GPU 合成资源"] },
  { id: "j-4", name: "跑鞋促销英文版", project: "跑鞋新品推广", creator: "陈琳", stage: "导出完成", progress: 100, status: "已完成", created: "昨天", type: "history", trace: ["分镜匹配完成", "字幕烧录完成", "视频导出完成：1080x1920"] },
  { id: "j-5", name: "耳机备用模板", project: "降噪耳机夏季促销", creator: "何鑫", stage: "字幕生成", progress: 38, status: "失败", created: "周一", type: "history", trace: ["字幕生成开始", "检测到镜头 3 时长不足", "任务失败：字幕时间轴与素材时长不一致"] }
];

export const analytics = {
  stats: [
    { label: "播放量", value: "284.6K", delta: "+18.4%" },
    { label: "点击率", value: "6.8%", delta: "+1.2%" },
    { label: "完播率", value: "42.5%", delta: "+5.7%" },
    { label: "转化率", value: "3.4%", delta: "+0.8%" },
    { label: "预计营收提升", value: "¥38,200", delta: "+12.1%" }
  ],
  trend: [42, 54, 48, 68, 72, 88, 96],
  hooks: [
    { name: "痛点开场", value: 86 },
    { name: "问题开场", value: 72 },
    { name: "场景开场", value: 64 },
    { name: "对比开场", value: 78 }
  ]
};

export const dashboardMetrics = [
  { label: "总播放量", value: "284.6K", delta: "+18.4%", route: "analytics" },
  { label: "平均转化率", value: "3.4%", delta: "+0.8%", route: "analytics" },
  { label: "商品点击率", value: "6.8%", delta: "+1.2%", route: "analytics" },
  { label: "预计营收提升", value: "¥38,200", delta: "+12.1%", route: "analytics" }
] as const;

export const activeWorkflows = [
  { title: "耳机 TikTok 主视频", desc: "正在合成 9:16 版本", done: true },
  { title: "精华液英文脚本", desc: "等待负责人审核字幕", done: true },
  { title: "水杯 Shorts 版本", desc: "排队等待生成", done: false },
  { title: "跑鞋素材替换", desc: "需要补充运动场景图", done: false }
];

export const platformPerformance = [
  { platform: "TikTok", logo: "T", color: "#111827", series: [30, 44, 38, 61, 76, 88, 96], views: "126K", conversion: "3.9%" },
  { platform: "YouTube", logo: "Y", color: "#EF4444", series: [24, 38, 45, 52, 63, 69, 82], views: "88K", conversion: "2.8%" },
  { platform: "Instagram", logo: "I", color: "#A855F7", series: [18, 26, 34, 49, 58, 74, 79], views: "70K", conversion: "3.1%" }
];

export const versions = [
  { name: "v1 初始脚本生成", author: "ShopClip", time: "昨天 14:20", note: "根据商品卖点生成初稿" },
  { name: "v2 修改 Hook", author: "李明", time: "昨天 16:05", note: "增强前 3 秒吸引力" },
  { name: "v3 替换素材", author: "王艺", time: "今天 09:12", note: "替换为生活方式素材" },
  { name: "v4 完成剪辑", author: "何鑫", time: "今天 11:31", note: "确认字幕和节奏" }
];


// ── 商品目录 ─────────────────────────────────────────────────────────────────
export const catalog = [
  {
    id: "prod-earphone",
    name: "Havit H630BT 主动降噪耳机",
    brand: "Havit",
    category: "数码配件",
    gradient: "from-blue-400 via-indigo-500 to-violet-500",
    assetCount: 14,
    scriptCount: 4,
    projectCount: 2,
    status: "已发布",
    updatedAt: "2小时前",
  },
  {
    id: "prod-serum",
    name: "Glow Labs 维生素C精华液 30ml",
    brand: "Glow Labs",
    category: "美妆护肤",
    gradient: "from-rose-300 via-pink-400 to-orange-300",
    assetCount: 9,
    scriptCount: 2,
    projectCount: 1,
    status: "制作中",
    updatedAt: "4小时前",
  },
  {
    id: "prod-bottle",
    name: "AquaFlow 保温水杯 500ml",
    brand: "AquaFlow",
    category: "运动户外",
    gradient: "from-cyan-400 via-teal-400 to-emerald-400",
    assetCount: 7,
    scriptCount: 1,
    projectCount: 1,
    status: "待审核",
    updatedAt: "1天前",
  },
  {
    id: "prod-shoes",
    name: "Stride Pro 碳纤维跑鞋",
    brand: "Stride Pro",
    category: "运动户外",
    gradient: "from-amber-400 via-orange-400 to-red-400",
    assetCount: 5,
    scriptCount: 1,
    projectCount: 1,
    status: "排队中",
    updatedAt: "1天前",
  },
] as const;

export type CatalogProduct = typeof catalog[number];

// ── 各商品专属脚本（按商品 ID 索引）────────────────────────────────────────
export const productScripts: Record<string, {
  id: string;
  versionLabel: string;
  note: string;
  author: string;
  time: string;
  content: { heading: string; body: string }[];
}[]> = {
  "prod-earphone": [
    {
      id: "s1", versionLabel: "v1 初稿", note: "偏基础结构，适合快速分镜。", author: "ShopClip AI", time: "昨天 14:20",
      content: [
        { heading: "开场 Hook", body: "通勤路上总被噪音打断？戴上 Havit H630BT，把注意力还给自己。" },
        { heading: "卖点顺序", body: "主动降噪、柔软耳罩、长续航、低延迟连接。" },
        { heading: "字幕文案", body: "沉浸音效，全天在线。主动降噪头戴式耳机，通勤、办公、学习都适合。" },
        { heading: "结尾 CTA", body: "现在进入 TikTok Shop，查看今日优惠。" },
      ],
    },
    {
      id: "s2", versionLabel: "v2 修改 Hook", note: "增强前 3 秒吸引力。", author: "李明", time: "昨天 16:05",
      content: [
        { heading: "开场 Hook", body: "这款耳机让我在地铁里像是一个人坐着专机。" },
        { heading: "卖点顺序", body: "主动降噪体验 → 佩戴舒适 → 续航优势 → 价格锚点。" },
        { heading: "字幕文案", body: "40dB 主动降噪，30 小时续航，你值得拥有真正的安静。" },
        { heading: "结尾 CTA", body: "点击购物车，今天下单立减 80 元。" },
      ],
    },
    {
      id: "s3", versionLabel: "v3 增强转化话术", note: "强化购买引导和平台优惠。", author: "何鑫", time: "今天 09:12",
      content: [
        { heading: "开场 Hook", body: "要不是这副耳机，我已经在 open office 疯掉了。" },
        { heading: "卖点顺序", body: "降噪 → 佩戴 → 续航 → 限时券。" },
        { heading: "字幕文案", body: "主动降噪 · 30H 长续航 · 60ms 低延迟。职场人必备，效率翻倍。" },
        { heading: "结尾 CTA", body: "领券立减，今天是最后一天，不要错过。" },
      ],
    },
  ],
  "prod-serum": [
    {
      id: "s4", versionLabel: "v1 美白功效版", note: "主打成分透明度与功效。", author: "ShopClip AI", time: "2天前 11:00",
      content: [
        { heading: "开场 Hook", body: "用了两周，素颜也敢出门了。" },
        { heading: "卖点顺序", body: "15% 维生素C浓度 → 烟酰胺协同 → 敏感肌可用 → 30天见效。" },
        { heading: "字幕文案", body: "每天清晨一滴，告别暗黄，找回透明感。" },
        { heading: "结尾 CTA", body: "点击主页链接，领专属优惠券。" },
      ],
    },
  ],
  "prod-bottle": [
    {
      id: "s5", versionLabel: "v1 户外场景版", note: "侧重生活方式与情感共鸣。", author: "ShopClip AI", time: "1天前 09:00",
      content: [
        { heading: "开场 Hook", body: "早上出门，到下班还是热的——这就是 AquaFlow 的承诺。" },
        { heading: "卖点顺序", body: "真空保温 24H → 316 食品钢 → 一键弹盖 → 颜色多选。" },
        { heading: "字幕文案", body: "陪你从晨跑到深夜，冷热随心，永远在线。" },
        { heading: "结尾 CTA", body: "限时买一送一，今日截止。" },
      ],
    },
  ],
  "prod-shoes": [
    {
      id: "s6", versionLabel: "v1 新品推广版", note: "突出技术参数和运动感。", author: "ShopClip AI", time: "1天前 10:30",
      content: [
        { heading: "开场 Hook", body: "碳纤维中底不是专业运动员的专利，普通人也值得拥有。" },
        { heading: "卖点顺序", body: "碳纤维推进板 → 氮气中底 → 透气网布 → 反光设计。" },
        { heading: "字幕文案", body: "每一步都有回弹感，Stride Pro，跑得更远。" },
        { heading: "结尾 CTA", body: "新品上线，前 500 名享 9 折。" },
      ],
    },
  ],
};

