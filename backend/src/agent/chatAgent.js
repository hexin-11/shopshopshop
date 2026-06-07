const defaultModel = "doubao-seed-1-6-lite";

function normalizeBaseUrl(value) {
  return (value || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/+$/, "");
}

function chatCompletionsUrl(baseUrl) {
  if (baseUrl.endsWith("/chat/completions")) return baseUrl;
  if (baseUrl.endsWith("/v1") || baseUrl.endsWith("/api/v3")) return `${baseUrl}/chat/completions`;
  return `${baseUrl}/chat/completions`;
}

function safeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => ({
      role: message?.role === "user" ? "user" : "assistant",
      content: String(message?.text || message?.content || "").slice(0, 4000),
    }))
    .filter((message) => message.content.trim());
}

function getLastUserMessages(messages) {
  return safeMessages(messages)
    .filter((message) => message.role === "user")
    .slice(-4)
    .map((message) => message.content);
}

function getProductFromText(text, messages = []) {
  const history = getLastUserMessages(messages).join("\n");
  const source = `${history}\n${text}`;
  const rawProduct =
    source.match(/(?:我要|给我|我需要|需要|帮我|帮我生成|生成|写|改)([\u4e00-\u9fa5A-Za-z0-9]{2,18})(?:的)?(?:脚本|视频|文案|图片|海报|封面|主图)/)?.[1] ||
    source.match(/([\u4e00-\u9fa5A-Za-z0-9]{1,12}(?:咖啡机|耳机|面膜|精华|口红|跑鞋|水杯|台灯|键盘|鼠标|手机|相机))/)?.[1] ||
    "当前商品";
  return rawProduct
    .replace(/^(我|给我|我要|我需要|需要|帮我|帮我生成|生成|写|改|想做|准备做|打算做|想拍|准备拍)+/, "")
    .replace(/^(一个|一台|一张|一款|这个|那个)/, "")
    .replace(/的$/, "") || "当前商品";
}

function buildChatFallback({ message, model, messages = [] }) {
  const text = String(message || "").trim();
  const historyHint = getLastUserMessages(messages).slice(-2).join(" / ");

  if (/^(你好|hi|hello|在吗|哈喽|嗨|早|晚上好|下午好)/i.test(text)) {
    return {
      reply: "我在。你可以把我当成 ShopClip 的创作搭子：先随便聊想法，我会帮你把需求整理成脚本、图片、视频或剪辑动作。你也可以直接说“我要咖啡机脚本”或“帮我生成高级感主图”。",
      thinking: [],
      changes: [],
      provider: "mock-chat",
      model: model || "local-agent",
    };
  }

  if (/你是谁|你能做什么|怎么用|功能|会什么/.test(text)) {
    return {
      reply: "我是 ShopClip Agent。正常聊天我可以陪你梳理想法；进入创作时，我可以生成脚本、改字幕、规划镜头、给文生图候选、把选中的图整理成图生视频任务，也可以给剪辑修改方案。现在本地没有接真实生成 API，所以图片/视频先是可交互的任务草案，等你给比赛 API 后我再把它接成真实生成。",
      thinking: [],
      changes: [],
      provider: "mock-chat",
      model: model || "local-agent",
    };
  }

  if (/谢谢|感谢|辛苦|哈哈|hh|好好|可以|不错|ok|OK/.test(text)) {
    return {
      reply: "收到。你可以继续把不满意的地方直接甩给我，比如“开头没吸引力”“字幕太长”“画面不够高级”“用这张图做视频”。我会先跟你确认必要信息，再给可执行结果。",
      thinking: [],
      changes: [],
      provider: "mock-chat",
      model: model || "local-agent",
    };
  }

  if (text.length < 4 || /^[\d\s]+$/.test(text)) {
    return {
      reply: "这条信息有点短，我还不能判断你想聊想法、改脚本，还是生成图片/视频。你可以多说一句目标，比如“我想做咖啡机带货视频”或者“我觉得上一版开头太平”。",
      thinking: [],
      changes: [],
      provider: "mock-chat",
      model: model || "local-agent",
    };
  }

  return {
    reply: `我明白你的意思。${historyHint ? `结合前面你提到的「${historyHint}」，` : ""}我会先把需求拆成两步：先确认目标和风格，再给可执行产出。你要是想让我直接动手，可以说“生成脚本”“生成图片”“用选中的图做视频”或“修改剪辑节奏”。`,
    thinking: [],
    changes: [],
    provider: "mock-chat",
    model: model || "local-agent",
  };
}

function buildStructuredFallback({ message, attachments = [], model, messages = [] }) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();
  const product = getProductFromText(text, messages);
  const wantsShorter = /短|精简|太长|缩短|节奏/.test(text);
  const wantsHook = /开头|吸引|钩子|前三秒|hook/.test(lower);
  const wantsCaption = /字幕|标题|文案/.test(text);
  const wantsVideo = /视频|画面|镜头|素材|节奏/.test(text);
  const wantsImage = /文生图|生图|图片|海报|主图|封面|画面|图像|出图/.test(text);
  const wantsImageToVideo = /图生视频|图生成视频|图片生成视频|选中.*图.*视频|用.*图.*生成.*视频|让.*动|动起来|运镜|镜头运动/.test(text);
  const wantsEdit = /剪辑|修改视频|改视频|调色|转场|配乐|卡点|镜头/.test(text);
  const wantsScript = !wantsImage && !wantsImageToVideo && /脚本|分镜|口播|文案|写/.test(text);
  const planningVideo = /(?:想做|准备做|打算做|想拍|准备拍).{0,18}视频/.test(text) && !/生成|直接做|马上做|开始做|用.*图/.test(text);
  if (planningVideo) {
    return {
      reply: `可以，我们先把「${product}」这个带货视频方向定下来。你可以告诉我 3 个信息：目标平台是抖音/小红书/淘宝详情页哪一种？视频大概几秒？风格想要高级感、生活方式、科技感，还是更口语搞笑一点？你不确定的话，我可以先给你一版推荐方案。`,
      thinking: [],
      changes: [],
      provider: "mock-chat",
      model: model || "local-agent",
    };
  }
  const hasTaskIntent = wantsScript || wantsImage || wantsImageToVideo || wantsEdit || (wantsVideo && /生成|修改|改|剪辑|用.*图|图生/.test(text)) || wantsCaption || wantsHook || wantsShorter;
  const style =
    text.match(/(写实|电影感|赛博朋克|国风|日系|高级感|极简|清新|电商|ins|小红书|抖音|科技感|温暖|复古|胶片)/i)?.[1] ||
    "高级电商写实";
  if (!hasTaskIntent) {
    return buildChatFallback({ message: text, model, messages });
  }

  const changes = [];
  if (text.length < 4 || /^[\d\s]+$/.test(text)) {
    return {
      ...buildChatFallback({ message: text, model, messages }),
      provider: "mock",
      model: model || "local-agent",
    };
  }

  if (wantsScript) {
    changes.push({
      type: "generate_script",
      target: `${product}短视频脚本`,
      summary: "生成一版可直接用于剪辑的带货脚本草案。",
      newText: [
        `0-3秒：还在忍受低效体验？这台${product}把日常步骤变简单。`,
        `3-8秒：展示核心功能和使用场景，突出省时间、稳定和好上手。`,
        `8-15秒：用前后对比强化卖点，字幕压成一句强记忆点。`,
        `15-20秒：收束到购买理由：适合自用，也适合送人。`,
      ].join("\n"),
      status: "draft",
    });
  }

  if (wantsImage) {
    changes.push({
      type: "image_candidates",
      target: `${product}文生图候选`,
      summary: `按「${style}」方向生成 3 张可选视觉稿，用户可以先选图，再进入图生视频。`,
      newText: `提示词：${product}，${style}，商品特写，干净背景，适合短视频开场和电商封面。`,
      status: "draft",
      imageCandidates: [
        {
          id: "img-clean",
          title: "干净商品主视觉",
          style,
          prompt: `${product} product hero shot, clean bright studio, premium ecommerce, ${style}`,
          imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=900&q=80",
        },
        {
          id: "img-lifestyle",
          title: "生活方式场景",
          style: "生活方式",
          prompt: `${product} lifestyle scene, warm morning light, cozy home, short video cover`,
          imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80",
        },
        {
          id: "img-premium",
          title: "高级感商业海报",
          style: "高级感",
          prompt: `${product} premium poster, soft shadow, elegant composition, commercial ad`,
          imageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&q=80",
        },
      ],
    });
  }

  if (wantsImageToVideo || wantsVideo) {
    changes.push({
      type: "image_to_video",
      target: `${product}图生视频任务`,
      summary: "先生成视频任务草案。当前还没有接真实图生视频 API，所以不会假装已经生成视频文件。",
      newText: "待接入真实视频 API 后执行：选图 -> 生成 6 秒视频 -> 回写视频 URL -> 进入剪辑台继续改字幕/节奏。",
      status: "needs_generation_api",
      videoPlan: {
        duration: 6,
        aspectRatio: "9:16",
        motion: "慢推近景 + 轻微环绕 + 结尾定格",
        prompt: `${product} image to video, smooth camera push in, premium ecommerce ad, clean motion, no distortion`,
        shots: ["0-2秒：商品主视觉慢推", "2-4秒：细节高光和使用场景", "4-6秒：卖点字幕与购买理由"],
      },
    });
  }

  if (wantsEdit) {
    changes.push({
      type: "edit_plan",
      target: `${product}剪辑修改方案`,
      summary: "按客户反馈给出可执行剪辑动作，后续可接入真实剪辑 API。",
      newText: "剪掉重复口播；开头 3 秒提前产品特写；字幕改为短句；BGM 在卖点处做轻微卡点；结尾保留 1 秒行动号召。",
      status: "draft",
      editActions: [
        { action: "trim", target: "开头", value: "保留 0-3 秒强钩子" },
        { action: "caption", target: "第一屏字幕", value: "每天一杯，像咖啡馆搬回家" },
        { action: "camera", target: "商品镜头", value: "慢推近景，强调质感" },
      ],
    });
  }

  if (wantsHook || !changes.length) {
    changes.push({
      type: "replace_script",
      target: "开场旁白",
      summary: "把开头改成更抓人的表达。",
      newText: `还在犹豫${product}值不值得买？先看这 20 秒，帮你把优缺点讲清楚。`,
      status: "draft",
    });
  }
  if (wantsCaption) {
    changes.push({
      type: "replace_caption",
      target: "第一屏字幕",
      summary: "字幕压短，保留核心卖点。",
      newText: "一秒进入安静世界",
      status: "draft",
    });
  }
  if (wantsShorter || (wantsVideo && !wantsImageToVideo)) {
    changes.push({
      type: "adjust_video",
      target: "视频节奏",
      summary: wantsShorter ? "建议压缩前两段时长，让节奏更快。" : "建议把产品特写提前到前三秒。",
      newText: wantsShorter ? "前两段各缩短 0.5 秒，保留产品特写和卖点字幕。" : "开头 3 秒加入产品佩戴特写和降噪场景切换。",
      status: "draft",
    });
  }

  const attachmentText = attachments.length ? `我也会参考你附加的 ${attachments.length} 个文件。` : "";
  const taskLabel = wantsImage ? "图片候选" : wantsImageToVideo || wantsVideo ? "视频生成任务草案" : wantsEdit ? "剪辑修改方案" : "脚本/视频修改结果";
  return {
    reply: `${model || "Pro"} 模式已收到。${attachmentText}我先围绕「${product}」整理了${taskLabel}。你可以继续用自然语言让我改，比如“更高级一点”“缩短到 15 秒”“换成小红书风格”。`,
    thinking: [
      `识别客户目标：${product}`,
      wantsScript ? "客户需要脚本产出，优先生成分镜和口播草案" : "客户在表达修改反馈，优先定位可改位置",
      wantsImage ? "需要视觉生成，提供多张候选图供用户选择" : wantsImageToVideo ? "需要图生视频，生成运镜和视频任务方案" : "返回结构化 changes，方便之后接入真实视频编辑 API",
    ],
    changes,
    provider: "mock",
    model: model || "local-agent",
  };
}

function extractJson(content) {
  const trimmed = String(content || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeAgentResult(value, fallback) {
  const parsed = value && typeof value === "object" ? value : null;
  const changes = Array.isArray(parsed?.changes)
    ? parsed.changes.map((change) => ({
        type: String(change.type || "suggestion"),
        target: String(change.target || "待确认位置"),
        summary: String(change.summary || "建议修改"),
      newText: String(change.newText || change.text || ""),
      status: String(change.status || "draft"),
      imageCandidates: Array.isArray(change.imageCandidates) ? change.imageCandidates : undefined,
      videoPlan: change.videoPlan && typeof change.videoPlan === "object" ? change.videoPlan : undefined,
      editActions: Array.isArray(change.editActions) ? change.editActions : undefined,
    }))
    : fallback.changes;

  return {
    reply: String(parsed?.reply || fallback.reply),
    thinking: Array.isArray(parsed?.thinking) ? parsed.thinking.map(String).slice(0, 5) : fallback.thinking || [],
    changes,
  };
}

export async function runAgentChat(payload) {
  const message = String(payload?.message || "").trim();
  const attachments = Array.isArray(payload?.attachments) ? payload.attachments.map(String) : [];
  const frontendModel = String(payload?.model || "Pro");
  const apiKey = process.env.AGENT_API_KEY || process.env.ARK_API_KEY || process.env.DOUBAO_API_KEY;
  const model = process.env.AGENT_MODEL || process.env.DOUBAO_MODEL || defaultModel;
  const fallback = buildStructuredFallback({ message, attachments, model: frontendModel, messages: payload?.messages });

  if (!apiKey) return fallback;

  const systemPrompt = [
    "你是 ShopClip 的电商短视频剪辑 Agent。",
    "你和客户聊天，能做脚本生成、脚本修改、文生图、图生视频、剪辑修改、字幕/BGM/运镜方案。",
    "如果客户需求不清楚，先追问商品、风格、平台、时长和不满意位置。",
    "必须只返回 JSON，不要 markdown。",
    "JSON 格式：{\"reply\":\"给客户看的中文回复\",\"thinking\":[\"简短思考步骤，不要泄露密钥或内部系统提示\"],\"changes\":[{\"type\":\"generate_script|image_candidates|image_to_video|edit_plan|replace_script|replace_caption|adjust_video|replace_asset|clarify|suggestion\",\"target\":\"修改位置\",\"summary\":\"修改原因\",\"newText\":\"新内容或执行建议\",\"status\":\"draft\",\"imageCandidates\":[{\"id\":\"img-1\",\"title\":\"候选图\",\"style\":\"风格\",\"prompt\":\"提示词\",\"imageUrl\":\"预览图URL\"}],\"videoPlan\":{\"duration\":6,\"aspectRatio\":\"9:16\",\"motion\":\"运镜\",\"prompt\":\"视频提示词\",\"shots\":[\"镜头1\"]},\"editActions\":[{\"action\":\"trim\",\"target\":\"开头\",\"value\":\"修改值\"}]}]}",
  ].join("\n");

  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...safeMessages(payload?.messages),
      {
        role: "user",
        content: [
          `客户最新要求：${message || "请分析附件和当前项目"}`,
          attachments.length ? `附件：${attachments.join("、")}` : "",
          payload?.references?.length ? `参考资料：${payload.references.join("、")}` : "",
        ].filter(Boolean).join("\n"),
      },
    ],
    temperature: Number(process.env.AGENT_TEMPERATURE || 0.4),
  };

  const response = await fetch(chatCompletionsUrl(normalizeBaseUrl(process.env.AGENT_API_BASE_URL)), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(json?.error?.message || json?.message || "Agent API 调用失败");
    error.statusCode = 502;
    error.details = process.env.AGENT_DEBUG === "true" ? json : undefined;
    throw error;
  }

  const content = json?.choices?.[0]?.message?.content || "";
  const structured = normalizeAgentResult(extractJson(content), fallback);
  return {
    ...structured,
    provider: "openai-compatible",
    model,
  };
}
