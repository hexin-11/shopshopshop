import { ProductAnalysisAgent, ScriptAgent, StoryboardAgent, TaskOrchestratorAgent } from "../agents/index.js";
import { runAgentGraphStream, agentGraph } from "../agents/graphOrchestrator.js";
import { chatAgent } from "../agents/chatAgent.js";
import { HumanMessage } from "@langchain/core/messages";
import {
  generateVideoTask,
  getTask,
  listMaterials,
  uploadMaterial,
} from "../services/mockWorkflowService.js";
import { fail, ok, normalizeProductInput } from "../utils/aigcResponse.js";
import { createTask, updateTask, getTask as getTaskFromQueue } from "../utils/taskQueue.js";

export async function uploadMaterialController({ body }) {
  return { status: 201, body: ok(uploadMaterial(body)) };
}

export async function listMaterialsController({ searchParams }) {
  return {
    status: 200,
    body: ok(listMaterials({
      productId: searchParams.get("productId"),
      type: searchParams.get("type"),
    })),
  };
}

export async function generateScriptController({ body }) {
  const input = normalizeProductInput(body);
  if (!input.productName) return { status: 400, body: fail("productName 必填") };
  const analysis = body.analysis || await ProductAnalysisAgent.run(input);
  return { status: 200, body: ok(await ScriptAgent.run({ input, analysis })) };
}

export async function generateStoryboardController({ body }) {
  const input = normalizeProductInput(body);
  if (!input.productName) return { status: 400, body: fail("productName 必填") };
  const analysis = body.analysis || await ProductAnalysisAgent.run(input);
  const script = body.script || await ScriptAgent.run({ input, analysis });
  return { status: 200, body: ok(await StoryboardAgent.run({ input, analysis, script })) };
}

export async function generateVideoController({ body }) {
  const input = normalizeProductInput(body);
  if (!input.productName) return { status: 400, body: fail("productName 必填") };
  return { status: 202, body: ok(generateVideoTask(input)) };
}

export async function getTaskController({ taskId }) {
  if (!taskId) return { status: 400, body: fail("taskId 必填") };
  return { status: 200, body: ok(getTask(taskId)) };
}

export async function submitGenerationTaskController({ body }) {
  const input = normalizeProductInput(body);
  if (!input.productName) {
    return { status: 400, body: fail("productName 必填") };
  }

  // Create task in queue immediately
  const taskId = createTask("agent-generation", input);

  // Run in background
  (async () => {
    try {
      let finalState = {};
      updateTask(taskId, { status: "processing", progress: 10, message: "启动多智能体分析流程..." });

      const stream = await agentGraph.stream({ input });

      for await (const chunk of stream) {
        const nodeName = Object.keys(chunk)[0];
        const nodeState = chunk[nodeName];
        Object.assign(finalState, nodeState);

        let progressMsg = "";
        let progress = 10;
        switch (nodeName) {
          case "generateAnalysis": progressMsg = "完成商品卖点和痛点分析"; progress = 30; break;
          case "generateScript": progressMsg = "成功撰写短视频带货脚本"; progress = 50; break;
          case "generateStoryboard": progressMsg = "已将脚本拆解为具体的视频分镜"; progress = 70; break;
          case "generateVideoPrompt": progressMsg = "完成各分镜的视觉生成提示词构建"; progress = 90; break;
          case "submitVideoTask": progressMsg = "视频合成任务已成功下发到云端"; progress = 100; break;
        }

        if (progressMsg) {
          updateTask(taskId, { progress, message: progressMsg, result: { state: finalState } });
        }
      }

      updateTask(taskId, { status: "completed", progress: 100, message: "全链路生成完毕", result: { finalState } });
    } catch (error) {
      console.error("Agent Error:", error);
      updateTask(taskId, { status: "failed", message: error.message, error: error.message });
    }
  })();

  return { status: 202, body: ok({ taskId }) };
}

export async function submitClipTaskController({ body }) {
  // Simulate clip generation
  const taskId = createTask("generate-clip", body);

  (async () => {
    updateTask(taskId, { status: "processing", progress: 10, message: "正在准备生成切片..." });
    await new Promise(r => setTimeout(r, 1000));
    updateTask(taskId, { status: "processing", progress: 50, message: "模型渲染中..." });
    await new Promise(r => setTimeout(r, 2000));
    updateTask(taskId, { 
      status: "completed", 
      progress: 100, 
      message: "切片生成完毕", 
      result: {
        clipUrl: "https://vjs.zencdn.net/v/oceans.mp4"
      }
    });
  })();

  return { status: 202, body: ok({ taskId }) };
}

export async function taskStatusController({ searchParams }) {
  const taskId = searchParams.get("taskId");
  if (!taskId) return { status: 400, body: fail("taskId 必填") };

  const task = getTaskFromQueue(taskId);
  if (!task) return { status: 404, body: fail("任务不存在") };

  return { status: 200, body: ok(task) };
}

export async function chatAgentController({ body, req, res }) {
  try {
    const { messages, context } = body;
    
    // In api.ts, payload sends `message` and `messages`, let's handle the string message or array of messages
    const userText = body.message || (messages && messages.length > 0 ? messages[messages.length - 1].text || messages[messages.length - 1].content : "");
    
    const langchainMessages = [new HumanMessage(userText)];
    
    // Run the chatAgent
    const result = await chatAgent.invoke({
      messages: langchainMessages,
      currentStoryboard: JSON.stringify(context?.storyBeats || []),
    });
    
    let reply = "";
    let changes = [];
    if (result && result.messages && result.messages.length > 0) {
      const lastMsg = result.messages[result.messages.length - 1];
      reply = lastMsg.content || "任务已完成。";

      // Look for tool calls in the last AI message
      const lastAiMsg = result.messages.slice().reverse().find(m => m._getType() === "ai");
      if (lastAiMsg && lastAiMsg.tool_calls && lastAiMsg.tool_calls.length > 0) {
        for (const tc of lastAiMsg.tool_calls) {
          if (tc.name === "edit_storyboard") {
            try {
              let beatsStr;
              // If it's the mock response, we can just grab the mocked scene changes.
              // We'll parse the context's storyBeats, apply a mock change, and stringify it back.
              const beats = context?.storyBeats || [];
              if (beats.length > 0) {
                beats[0].description = "【Agent 修改】" + beats[0].description;
              }
              beatsStr = JSON.stringify(beats);
              
              changes.push({
                type: "edit_storyboard",
                target: "storyboard",
                newText: beatsStr
              });
            } catch (e) {}
          }
        }
      }
    }

    return {
      status: 200,
      body: JSON.stringify({
        reply: reply,
        thinking: ["分析你的需求", "调用相应工具", "生成最终结果"],
        changes: changes
      })
    };
  } catch (err) {
    console.error("ChatAgent Error:", err);
    return {
      status: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
