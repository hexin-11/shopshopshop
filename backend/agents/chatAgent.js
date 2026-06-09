import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getArkConfig, isArkMockEnabled } from "../services/arkClient.js";

// Add a simple fallback class to extend ChatOpenAI for mock purposes, which naturally supports bindTools
class MockChatModel extends ChatOpenAI {
  constructor() {
    super({ apiKey: "mock-key" });
  }
  bindTools(tools, kwargs) {
    return this;
  }
  async invoke(messages, options) {
    // If the last message is a ToolMessage, it means the tool was already executed.
    // We must return a plain text response to stop the agent loop.
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage._getType() === "tool") {
      return new AIMessage({
        content: "我已成功执行修改，请查看右侧画布的变化！"
      });
    }

    const text = "这是一个模拟的聊天回复，我已经为你准备好了分镜修改！";
    return new AIMessage({ 
      content: text,
      tool_calls: [
        {
          name: "edit_storyboard",
          args: { instruction: "修改分镜", currentStoryboard: "[]" },
          id: "call_mock123"
        }
      ]
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
    configuration: { baseURL: config.textEndpoint.replace(/\/chat\/completions$/, "") },
    temperature: 0.4,
    streaming,
    modelKwargs: { thinking: { type: "disabled" } }
  });
}

const editStoryboardTool = tool(
  async ({ instruction, currentStoryboard }) => {
    console.log("[editStoryboardTool] invoked with instruction:", instruction);
    const llm = getLLM(false);
    
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
    
    const res = await llm.invoke(`请根据以下要求修改分镜JSON数组并原样返回修改后的JSON数组，不要输出markdown格式，只输出合法JSON：
要求: ${instruction}
当前分镜: ${currentStoryboard}`);
    
    let text = res.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return text;
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
