import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// ====== 辅助函数 ======

// 获取标准文本/结构化大模型实例（用于意图识别、剧本生成等）
function getLLM(modelName) {
  return new ChatOpenAI({
    modelName: modelName || process.env.AGENT_MODEL || "doubao-seed-2-0-lite-260428",
    temperature: 0.4,
    openAIApiKey: process.env.AGENT_API_KEY || process.env.ARK_API_KEY || process.env.LAS_API_KEY || process.env.DOUBAO_API_KEY,
    configuration: {
      baseURL: (process.env.AGENT_API_BASE_URL || "https://operator.las.cn-beijing.volces.com/api/v1").replace(/\/+$/, "")
    }
  });
}

// 统一的返回结构 Schema
const agentResponseSchema = z.object({
  reply: z.string().describe("给客户看的中文回复"),
  thinking: z.array(z.string()).describe("简短思考步骤"),
  changes: z.array(z.object({
    type: z.enum([
      "generate_script", "image_candidates", "image_to_video", 
      "edit_plan", "replace_script", "replace_caption", 
      "adjust_video", "replace_asset", "clarify", "suggestion"
    ]),
    target: z.string().describe("修改位置"),
    summary: z.string().describe("修改原因或简介"),
    newText: z.string().describe("新内容或执行建议").optional(),
    status: z.string().describe("状态，通常为 'draft'").default("draft"),
    imageCandidates: z.array(z.object({
      id: z.string(),
      title: z.string(),
      style: z.string().optional(),
      prompt: z.string(),
      imageUrl: z.string()
    })).optional(),
    videoPlan: z.object({
      duration: z.number().optional(),
      aspectRatio: z.string().optional(),
      motion: z.string().optional(),
      prompt: z.string().optional(),
      shots: z.array(z.string()).optional()
    }).optional(),
    editActions: z.array(z.object({
      action: z.string(),
      target: z.string(),
      value: z.string()
    })).optional()
  })).describe("系统操作动作负载，如果只是纯聊天，可为空数组")
});

/**
 * 专用于调用火山全模态（包含视频/深度思考）的原生接口
 */
async function invokeOmniModal(messages, modelName) {
  const apiKey = process.env.AGENT_API_KEY || process.env.LAS_API_KEY || process.env.DOUBAO_API_KEY;
  const baseUrl = (process.env.AGENT_API_BASE_URL || "https://operator.las.cn-beijing.volces.com/api/v1").replace(/\/+$/, "");
  
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName || "doubao-seed-2-0-lite-260428",
      messages: messages
    })
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || "OmniModal API Failed");
  }
  return json.choices[0].message;
}

// ====== 节点逻辑 ======

export async function analyzeIntentNode(state) {
  const { inputMessage, messages, attachments, modelName } = state;
  const llm = getLLM(modelName);

  const intentSchema = z.object({
    intent: z.enum(["chat", "script", "image", "video", "edit", "analyze"]),
    reason: z.string()
  });

  const structuredLlm = llm.withStructuredOutput(intentSchema);
  const history = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join("\n");
  const prompt = `分析最新输入判断意图。历史：\n${history}\n最新输入：${inputMessage}\n附加文件数：${attachments.length}\n意图分类：analyze, script, image, video, edit, chat`;

  try {
    const result = await structuredLlm.invoke([{ role: "user", content: prompt }]);
    return { intent: result.intent };
  } catch (error) {
    return { intent: "chat" };
  }
}

export async function chatNode(state) {
  const { inputMessage, modelName } = state;
  const llm = getLLM(modelName);
  const structuredLlm = llm.withStructuredOutput(agentResponseSchema);
  const prompt = `你是一个带货视频剪辑 Agent。用户：${inputMessage}`;
  const response = await structuredLlm.invoke([{ role: "user", content: prompt }]);
  return { finalResponse: response };
}

export async function scriptGenerationNode(state) {
  const { inputMessage, modelName } = state;
  const llm = getLLM(modelName);
  const structuredLlm = llm.withStructuredOutput(agentResponseSchema);
  const prompt = `请根据用户的需求生成脚本，包装在 replace_script 动作中。用户：${inputMessage}`;
  const response = await structuredLlm.invoke([{ role: "user", content: prompt }]);
  return { finalResponse: response };
}

export async function videoAnalysisNode(state) {
  const { inputMessage, attachments, modelName } = state;
  
  try {
    // 构建多模态内容体
    const contentBody = [];
    
    // 如果有附件（假设是视频URL），按照豆包 seed 多模态格式传入
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.endsWith(".mp4") || attachment.includes("video")) {
          contentBody.push({
            type: "video_url",
            video_url: { url: attachment }
          });
        } else {
          // 这里也可处理 image_url
          contentBody.push({
            type: "image_url",
            image_url: { url: attachment }
          });
        }
      }
    }

    contentBody.push({
      type: "text",
      text: `请分析上述素材的爆点和节奏，并提取出详细的分镜信息。用户的指示是：${inputMessage}`
    });

    // 调用全模态接口，利用深度思考模型
    const aiMessage = await invokeOmniModal([
      { role: "system", content: "你是一个资深的短视频拆解专家。" },
      { role: "user", content: contentBody }
    ], modelName);

    // AI 会返回 content 和 reasoning_content
    const analysisText = aiMessage.content;
    const reasoning = aiMessage.reasoning_content;

    // 将大模型的深度思考(reasoning_content)截取并包装进前端的 thinking 列表里
    const thinkingArray = reasoning ? reasoning.split('\n').filter(t => t.trim() !== '') : ["正在深度分析素材..."];

    // 因为直接调 API 没法轻易走 JSON schema 强制校验，这里我们手动组装返回值结构给前端
    const finalResponse = {
      reply: "我已为您深度解析了该视频素材。这是它的核心爆点和分镜结构：\n\n" + analysisText.substring(0, 500) + "...",
      thinking: thinkingArray.slice(0, 8), // 前端不需要太长的思维链，截断一下
      changes: [{
        type: "suggestion",
        target: "视频结构分析",
        summary: "基于深度思考和全模态分析生成的视频爆点解析",
        newText: analysisText,
        status: "draft"
      }]
    };

    return { finalResponse };
  } catch (error) {
    console.error("Video analysis failed:", error);
    return {
      finalResponse: {
        reply: "抱歉，视频解析失败。请确保链接可访问且为火山环境。错误信息：" + error.message,
        thinking: ["API 调用失败"],
        changes: []
      }
    };
  }
}

export async function editPlanNode(state) {
  const { inputMessage, modelName } = state;
  const llm = getLLM(modelName);
  const structuredLlm = llm.withStructuredOutput(agentResponseSchema);
  const prompt = `用户要求对已有视频或大纲进行剪辑修改。请输出 edit_plan 动作。用户：${inputMessage}`;
  const response = await structuredLlm.invoke([{ role: "user", content: prompt }]);
  return { finalResponse: response };
}
