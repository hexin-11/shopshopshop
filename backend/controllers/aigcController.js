import { ProductAnalysisAgent, ScriptAgent, StoryboardAgent, TaskOrchestratorAgent } from "../agents/index.js";
import {
  generateVideoTask,
  getTask,
  listMaterials,
  uploadMaterial,
} from "../services/mockWorkflowService.js";
import { fail, ok, normalizeProductInput } from "../utils/aigcResponse.js";

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

export async function generateAgentController({ body }) {
  const input = normalizeProductInput(body);
  if (!input.productName) return { status: 400, body: fail("productName 必填") };
  return { status: 200, body: ok(await TaskOrchestratorAgent.run(input)) };
}
