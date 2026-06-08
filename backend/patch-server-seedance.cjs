const fs = require('fs');
const path = 'src/server.js';
let txt = fs.readFileSync(path, 'utf8');

const injectionPoint = '  if (pathname === "/api/assets/meta/filters" && req.method === "GET") {';

const newRoutes = `
  // --- Seedance API Integration ---
  if (pathname === "/api/generate-clip" && req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch (error) {
      return badRequest(res, error.message);
    }
    
    const arkApiKey = process.env.ARK_API_KEY || "YOUR_ARK_API_KEY"; // Please set this in your environment
    
    const content = [];
    if (payload.prompt) {
      content.push({ type: "text", text: payload.prompt });
    }
    if (payload.imageUrl) {
      content.push({ type: "image_url", image_url: { url: payload.imageUrl } });
    }
    
    if (content.length === 0) {
      return badRequest(res, "prompt or imageUrl is required");
    }

    try {
      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${arkApiKey}\`
        },
        body: JSON.stringify({
          model: "doubao-seedance-1-5-pro-251215",
          content,
          generate_audio: payload.generateAudio ?? true,
          ratio: payload.ratio || "16:9",
          duration: payload.duration || 5,
          watermark: false
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        return sendJson(res, response.status, { error: data });
      }
      return sendJson(res, 201, { taskId: data.id });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  if (pathname === "/api/generate-clip/status" && req.method === "GET") {
    const taskId = searchParams.get("taskId");
    if (!taskId) return badRequest(res, "taskId is required");
    
    const arkApiKey = process.env.ARK_API_KEY || "YOUR_ARK_API_KEY";
    try {
      const response = await fetch(\`https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/\${taskId}\`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${arkApiKey}\`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return sendJson(res, response.status, { error: data });
      }
      return sendJson(res, 200, data);
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }
  // --- End Seedance API ---

`;

if (!txt.includes('/api/generate-clip')) {
  txt = txt.replace(injectionPoint, newRoutes + injectionPoint);
  fs.writeFileSync(path, txt);
  console.log('Backend patched with Seedance API routes!');
} else {
  console.log('Routes already exist!');
}
