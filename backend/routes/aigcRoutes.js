import {
  generateAgentController,
  generateScriptController,
  generateStoryboardController,
  generateVideoController,
  getTaskController,
  listMaterialsController,
  uploadMaterialController,
} from "../controllers/aigcController.js";

async function parseBody(req, readBody) {
  try {
    return await readBody(req);
  } catch (error) {
    return { __invalidJson: error.message };
  }
}

export async function handleAigcRoutes({ req, res, pathname, searchParams, readBody, sendJson }) {
  const execute = async (handler, args = {}) => {
    const result = await handler(args);
    sendJson(res, result.status, result.body);
    return true;
  };

  if (pathname === "/api/materials/upload" && req.method === "POST") {
    const body = await parseBody(req, readBody);
    if (body.__invalidJson) {
      sendJson(res, 400, { success: false, message: body.__invalidJson });
      return true;
    }
    return execute(uploadMaterialController, { body });
  }

  if (pathname === "/api/materials" && req.method === "GET") {
    return execute(listMaterialsController, { searchParams });
  }

  if (pathname === "/api/scripts/generate" && req.method === "POST") {
    const body = await parseBody(req, readBody);
    if (body.__invalidJson) {
      sendJson(res, 400, { success: false, message: body.__invalidJson });
      return true;
    }
    return execute(generateScriptController, { body });
  }

  if (pathname === "/api/storyboards/generate" && req.method === "POST") {
    const body = await parseBody(req, readBody);
    if (body.__invalidJson) {
      sendJson(res, 400, { success: false, message: body.__invalidJson });
      return true;
    }
    return execute(generateStoryboardController, { body });
  }

  if (pathname === "/api/videos/generate" && req.method === "POST") {
    const body = await parseBody(req, readBody);
    if (body.__invalidJson) {
      sendJson(res, 400, { success: false, message: body.__invalidJson });
      return true;
    }
    return execute(generateVideoController, { body });
  }

  const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (taskMatch && req.method === "GET") {
    return execute(getTaskController, { taskId: taskMatch[1] });
  }

  if (pathname === "/api/agent/generate" && req.method === "POST") {
    const body = await parseBody(req, readBody);
    if (body.__invalidJson) {
      sendJson(res, 400, { success: false, message: body.__invalidJson });
      return true;
    }
    return execute(generateAgentController, { body });
  }

  return false;
}
