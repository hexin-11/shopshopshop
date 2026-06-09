import { generateText } from "../../services/arkClient.js";

function parseIntent(inputMessage = "") {
  const text = String(inputMessage).toLowerCase();
  if (text.includes("脚本") || text.includes("script")) return "script";
  if (text.includes("分析") || text.includes("素材") || text.includes("analyze")) return "analyze";
  if (text.includes("修改") || text.includes("剪辑") || text.includes("edit")) return "edit";
  if (text.includes("视频") || text.includes("video")) return "video";
  if (text.includes("图片") || text.includes("image")) return "image";
  return "chat";
}

function buildChange(type, target, summary, newText) {
  return {
    type,
    target,
    summary,
    newText,
    status: "draft",
  };
}

async function runArkText({ agentName, inputMessage, messages = [], attachments = [] }) {
  return generateText({
    messages: [
      {
        role: "system",
        content: `你是 VibeGen AI 的 ${agentName}，负责电商 AIGC 带货视频工作流。`,
      },
      {
        role: "user",
        content: JSON.stringify({
          inputMessage,
          messages: messages.slice(-6),
          attachments,
        }),
      },
    ],
    temperature: 0.4,
  });
}

export async function analyzeIntentNode(state) {
  return { intent: parseIntent(state.inputMessage) };
}

export async function chatNode(state) {
  const llm = await runArkText({ agentName: "ChatAgent", ...state });
  return {
    finalResponse: {
      reply: llm.content || `我已收到你的需求：${state.inputMessage || "请继续描述你想生成的视频"}`,
      thinking: ["理解用户需求", "进入 AIGC 带货视频工作流", "等待进一步指令"],
      changes: [],
    },
  };
}

export async function scriptGenerationNode(state) {
  const llm = await runArkText({ agentName: "ScriptAgent", ...state });
  const text = llm.content || `围绕“${state.inputMessage}”生成一版带货脚本，包含开场、痛点、卖点和行动引导。`;
  return {
    finalResponse: {
      reply: "已生成一版可继续编辑的带货脚本。",
      thinking: ["提取商品需求", "组织开场钩子", "补充卖点与转化引导"],
      changes: [buildChange("replace_script", "视频脚本", "根据用户需求生成脚本草稿", text)],
    },
  };
}

export async function videoAnalysisNode(state) {
  const llm = await runArkText({ agentName: "VideoAnalysisAgent", ...state });
  const text = llm.content || `已根据素材和需求“${state.inputMessage}”整理视频结构建议。`;
  return {
    finalResponse: {
      reply: "已完成素材和视频结构分析。",
      thinking: ["读取素材信息", "识别可用于成片的卖点", "整理分镜和节奏建议"],
      changes: [buildChange("suggestion", "素材分析", "生成素材使用建议和分镜方向", text)],
    },
  };
}

export async function editPlanNode(state) {
  const llm = await runArkText({ agentName: "EditPlanAgent", ...state });
  const text = llm.content || `根据“${state.inputMessage}”生成剪辑修改计划。`;
  return {
    finalResponse: {
      reply: "已生成可执行的剪辑修改计划。",
      thinking: ["理解修改目标", "定位脚本/字幕/镜头可改点", "输出编辑动作"],
      changes: [buildChange("edit_plan", "视频项目", "根据用户反馈生成修改计划", text)],
    },
  };
}
