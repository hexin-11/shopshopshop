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
import { isArkMockEnabled } from "../services/arkClient.js";

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

import { createVideoTask, getVideoTask } from "../services/arkClient.js";

export async function submitClipTaskController({ body }) {
  try {
    const arkTask = await createVideoTask({
      prompt: body.prompt,
      imageUrl: body.imageUrl,
      ratio: body.aspectRatio || "9:16",
      duration: 5,
      generateAudio: false
    });

    const localTaskId = createTask("generate-clip", { ...body, arkTaskId: arkTask.taskId });
    
    updateTask(localTaskId, { 
      status: arkTask.status === "succeeded" ? "completed" : "processing", 
      progress: arkTask.progress || 0, 
      message: "视频生成任务已提交到云端", 
      result: {
        clipUrl: arkTask.previewUrl || arkTask.exportUrl || null
      }
    });

    return { status: 202, body: ok({ taskId: localTaskId }) };
  } catch (error) {
    console.error("Clip Task Error:", error);
    return { status: 500, body: fail(error.message) };
  }
}

export async function taskStatusController({ searchParams }) {
  const taskId = searchParams.get("taskId");
  if (!taskId) return { status: 400, body: fail("taskId 必填") };

  const task = getTaskFromQueue(taskId);
  if (!task) return { status: 404, body: fail("任务不存在") };

  if (task.type === "generate-clip" && task.data?.arkTaskId && task.status !== "completed" && task.status !== "failed") {
    try {
      const arkStatus = await getVideoTask(task.data.arkTaskId);
      
      let newStatus = task.status;
      if (arkStatus.status === "succeeded") newStatus = "completed";
      else if (arkStatus.status === "failed") newStatus = "failed";

      updateTask(taskId, {
        status: newStatus,
        progress: arkStatus.progress || task.progress,
        message: newStatus === "completed" ? "切片生成完毕" : "模型渲染中...",
        result: {
          clipUrl: arkStatus.previewUrl || arkStatus.exportUrl || task.result?.clipUrl || null
        }
      });
    } catch (e) {
      console.error("Failed to sync Ark video status:", e);
    }
  }

  return { status: 200, body: ok(getTaskFromQueue(taskId)) };
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

      // Look for tool calls in any AI message in the turn
      const aiMsgWithTools = result.messages.slice().reverse().find(m => m._getType() === "ai" && m.tool_calls && m.tool_calls.length > 0);
      if (aiMsgWithTools) {
        for (const tc of aiMsgWithTools.tool_calls) {
          if (tc.name === "edit_storyboard") {
            try {
              let beatsStr;
              
              // Find the corresponding ToolMessage
              const toolMsg = result.messages.find(m => m._getType() === "tool" && m.tool_call_id === tc.id);
              
              if (!isArkMockEnabled() && toolMsg) {
                // Use the real output from the tool
                beatsStr = toolMsg.content;
              } else {
                // Fallback to mock
                const beats = context?.storyBeats || [];
                if (beats.length > 0) {
                  beats[0].visual = "【Agent 修改】" + beats[0].visual;
                }
                beatsStr = JSON.stringify(beats);
              }
              
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
