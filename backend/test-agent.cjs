const http = require("http");

const data = JSON.stringify({
  message: "你好，请帮我写个脚本",
  attachments: []
});

const options = {
  hostname: "127.0.0.1",
  port: 8787,
  path: "/api/agent/chat",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = http.request(options, (res) => {
  let chunks = "";
  res.on("data", (d) => {
    chunks += d;
  });
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", chunks);
  });
});

req.on("error", (error) => {
  console.error("Error:", error);
});

req.write(data);
req.end();
