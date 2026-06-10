import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getArkConfig, isArkMockEnabled } from "../services/arkClient.js";

class MockChatModel extends ChatOpenAI {
  constructor() {
    super({ apiKey: "mock-key" });
  }
  bindTools(tools, kwargs) {
    return this;
  }
  async invoke(messages, options) {
    // Check if the last message is a tool response
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && (lastMessage._getType() === "tool" || lastMessage.name === "edit_storyboard")) {
      return new AIMessage({
        content: "好的，我已为你修改了分镜，请查看右侧画布的变化！"
      });
    }

    const userMsg = messages.findLast(m => m._getType() === "human")?.content || "";
    const isEdit = /改|重新|加|生成|换|删|调整/.test(userMsg);

    if (isEdit) {
      return new AIMessage({ 
        content: "没问题，我已经根据你的要求更新了分镜大纲，请确认！",
        tool_calls: [
          {
            name: "edit_storyboard",
            args: { instruction: userMsg, currentStoryboard: "[]" },
            id: "call_mock123"
          }
        ]
      });
    }

    // Default conversational response for "你好" and other chats
    return new AIMessage({
      content: "你好！我现在可以帮你解释当前项目状态、调整分镜、或者在真实 Ark 配置完成后创建视频生成任务。当前系统处于 MOCK 模式（ARK_MOCK=true），所以页面展示的是模拟素材，不会真实请求大模型和消耗资源。你可以尝试让我修改分镜（如：'把第一个画面改成下雨天'）。"
    });
  }
}

function getLLM(streaming = false) {
  const config = getArkConfig();
  if (config.mock) {
    return new MockChatModel();
  }
  
  return new ChatOpenAI({
    modelName: config.textModel,
    apiKey: config.textApiKey || config.apiKey,
    configuration: { 
      baseURL: config.textEndpoint.replace(/\/chat\/completions$/, ""),
      defaultHeaders: {
        "X-DashScope-OssResourceResolve": "enable"
      }
    },
    temperature: 0.4,
    streaming: false,
    modelKwargs: { thinking: { type: "disabled" } }
  });
}

const editStoryboardTool = tool(
  async ({ instruction, currentStoryboard }) => {
    console.log("[editStoryboardTool] invoked with instruction:", instruction);
    
    if (isArkMockEnabled()) {
      try {
        const parsed = JSON.parse(currentStoryboard);
        if (parsed.length > 0) {
          parsed[0].visual = "已应用修改：" + instruction;
        }
        return JSON.stringify(parsed);
      } catch (e) {
        return currentStoryboard;
      }
    }

    const config = getArkConfig();
    const response = await fetch(config.textEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.textApiKey || config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.textModel,
        messages: [
          {
            role: "user",
            content: `请根据以下要求修改分镜JSON数组并原样返回修改后的JSON数组，不要输出markdown格式，只输出合法JSON：\n要求: ${instruction}\n当前分镜: ${currentStoryboard}`
          }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error("Failed to call Ark API:", responseText);
      return currentStoryboard;
    }

    const data = JSON.parse(responseText);
    const text = (data.choices?.[0]?.message?.content || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return text || currentStoryboard;
  },
  {
    name: "edit_storyboard",
    description: "Modify the current video storyboard based on user instructions. Use this when the user asks to change a scene, subtitle, or visual.",
    schema: z.object({
      instruction: z.string().describe("User's instruction for modification"),
      currentStoryboard: z.string().describe("Current storyboard JSON string"),
    }),
  }
);

export const chatAgent = createReactAgent({
  llm: getLLM(true),
  tools: [editStoryboardTool],
  messageModifier: "你是一个专业的电商短视频编导助手。如果用户要求修改分镜，请调用 edit_storyboard 工具，传入他们的要求和当前的 currentStoryboard。"
});
