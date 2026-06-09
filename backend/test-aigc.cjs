const http = require("http");

function requestApi(path, payload) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(payload));
    const req = http.request({
      hostname: "127.0.0.1",
      port: 8787,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log("=== Testing /api/agent/generate ===");
  const generatePayload = {
    productName: "测试商品智能水杯",
    productDescription: "一款能提醒喝水、保温保冷的智能水杯",
    sellingPoints: ["智能提醒", "超长保温", "LED水温显示"],
    tone: "幽默风趣",
    platform: "抖音",
    duration: 15,
    videoType: "product",
    userPrompt: "给我做一个好玩的带货视频"
  };
  
  try {
    const genRes = await requestApi("/api/agent/generate", generatePayload);
    console.log(`Status: ${genRes.status}`);
    console.log(`Body (first 500 chars): ${genRes.body.substring(0, 500)}...`);
  } catch(e) {
    console.error("Error calling /api/agent/generate:", e);
  }

  console.log("\n=== Testing /api/generate-clip ===");
  const clipPayload = {
    prompt: "智能水杯在桌子上发光",
    imageUrl: "",
    ratio: "9:16",
    duration: 5
  };
  
  try {
    const clipRes = await requestApi("/api/generate-clip", clipPayload);
    console.log(`Status: ${clipRes.status}`);
    console.log(`Body: ${clipRes.body}`);
  } catch(e) {
    console.error("Error calling /api/generate-clip:", e);
  }
}

runTest();
