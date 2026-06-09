# 后端 API 文档

默认后端地址：

```text
http://127.0.0.1:8787
```

所有接口返回 JSON。

## 通用商品请求示例

```json
{
  "productName": "保湿粉底液",
  "category": "美妆",
  "price": "129元",
  "sellingPoints": ["保湿", "不卡粉", "持妆8小时"],
  "targetAudience": "20-30岁女性",
  "platform": "小红书",
  "duration": 30,
  "tone": "自然生活化",
  "videoType": "口播带货",
  "style": "清新",
  "resolution": "1080x1920"
}
```

## POST /api/materials/upload

### 功能说明

上传商品素材。当前为 mock 逻辑，不进行真实文件存储。

### 请求示例

```json
{
  "productId": "prod-demo",
  "fileName": "demo.jpg",
  "type": "image",
  "tags": ["主图", "美妆"],
  "url": "/uploads/mock/demo.jpg"
}
```

### 返回示例

```json
{
  "success": true,
  "data": {
    "id": "mat-xxx",
    "productId": "prod-demo",
    "fileName": "demo.jpg",
    "type": "image",
    "tags": ["主图", "美妆"],
    "url": "/uploads/mock/demo.jpg",
    "bindTo": "project",
    "createdAt": "2026-06-09T00:00:00.000Z"
  }
}
```

### curl 测试命令

```bash
curl.exe -X POST http://127.0.0.1:8787/api/materials/upload -H "Content-Type: application/json" -d "{\"productId\":\"prod-demo\",\"fileName\":\"demo.jpg\",\"type\":\"image\",\"tags\":[\"主图\",\"美妆\"],\"url\":\"/uploads/mock/demo.jpg\"}"
```

## GET /api/materials

### 功能说明

查询素材列表。

### 请求示例

```text
GET /api/materials
GET /api/materials?productId=prod-demo&type=image
```

### 返回示例

```json
{
  "success": true,
  "data": [
    {
      "id": "mat-demo-hero",
      "productId": "prod-earphone",
      "fileName": "earphone-hero.jpg",
      "type": "image",
      "tags": ["主图", "耳机", "商品展示"],
      "url": "/uploads/mock/earphone-hero.jpg"
    }
  ]
}
```

### curl 测试命令

```bash
curl.exe http://127.0.0.1:8787/api/materials
```

## POST /api/scripts/generate

### 功能说明

根据商品信息生成带货脚本。

### 请求示例

使用通用商品请求示例。

### 返回示例

```json
{
  "success": true,
  "data": {
    "hook": "如果你正在找一款美妆，先看完保湿粉底液这几个细节。",
    "problem": "20-30岁女性想快速判断保湿粉底液是否适合自己",
    "solution": "保湿粉底液把保湿、不卡粉、持妆8小时组合在一起。",
    "sellingPoints": ["卖点1：保湿", "卖点2：不卡粉"],
    "cta": "可以直接用这套脚本生成成片。",
    "fullVoiceover": "完整口播文案...",
    "llm": {
      "provider": "ark",
      "mock": true
    }
  }
}
```

### curl 测试命令

```bash
curl.exe -X POST http://127.0.0.1:8787/api/scripts/generate -H "Content-Type: application/json" -d "{\"productName\":\"保湿粉底液\",\"category\":\"美妆\",\"price\":\"129元\",\"sellingPoints\":[\"保湿\",\"不卡粉\",\"持妆8小时\"],\"targetAudience\":\"20-30岁女性\",\"platform\":\"小红书\",\"duration\":30,\"tone\":\"自然生活化\"}"
```

## POST /api/storyboards/generate

### 功能说明

根据商品信息和脚本生成基础分镜。

### 请求示例

使用通用商品请求示例。也可以额外传入 `script` 字段。

### 返回示例

```json
{
  "success": true,
  "data": [
    {
      "shotId": 1,
      "duration": 7,
      "scene": "开场吸引",
      "visual": "保湿粉底液主视觉快速出现",
      "subtitle": "如果你正在找一款美妆...",
      "voiceover": "如果你正在找一款美妆...",
      "camera": "稳定推进，商品居中",
      "transition": "自然切换"
    }
  ]
}
```

### curl 测试命令

```bash
curl.exe -X POST http://127.0.0.1:8787/api/storyboards/generate -H "Content-Type: application/json" -d "{\"productName\":\"保湿粉底液\",\"category\":\"美妆\",\"sellingPoints\":[\"保湿\",\"不卡粉\",\"持妆8小时\"],\"platform\":\"小红书\",\"duration\":30,\"tone\":\"自然生活化\"}"
```

## POST /api/videos/generate

### 功能说明

创建 mock 视频生成任务。

### 请求示例

使用通用商品请求示例。

### 返回示例

```json
{
  "success": true,
  "data": {
    "taskId": "task-xxx",
    "status": "queued",
    "progress": 0,
    "productName": "保湿粉底液",
    "previewUrl": null,
    "exportUrl": null
  }
}
```

### curl 测试命令

```bash
curl.exe -X POST http://127.0.0.1:8787/api/videos/generate -H "Content-Type: application/json" -d "{\"productName\":\"保湿粉底液\",\"category\":\"美妆\",\"sellingPoints\":[\"保湿\",\"不卡粉\"],\"duration\":30}"
```

## GET /api/tasks/:taskId

### 功能说明

查询任务进度。当前任务状态为内存级 mock。

### 请求示例

```text
GET /api/tasks/task-xxx
```

### 返回示例

```json
{
  "success": true,
  "data": {
    "taskId": "task-xxx",
    "status": "running",
    "progress": 45,
    "previewUrl": null,
    "exportUrl": null
  }
}
```

### curl 测试命令

```bash
curl.exe http://127.0.0.1:8787/api/tasks/YOUR_TASK_ID
```

## POST /api/agent/generate

### 功能说明

一键生成完整视频创作方案：

商品信息 → 商品分析 → 剧本 → 分镜 → 视频 Prompt → mock 视频任务 → mock 预览结果。

### 请求示例

使用通用商品请求示例。

### 返回示例

```json
{
  "success": true,
  "data": {
    "productAnalysis": {
      "coreValue": "商品核心价值...",
      "targetPainPoints": ["痛点1", "痛点2"],
      "mainSellingPoints": ["保湿", "不卡粉"],
      "videoAngle": "视频切入角度...",
      "recommendedStyle": "清新"
    },
    "script": {
      "hook": "开场钩子...",
      "problem": "痛点...",
      "solution": "解决方案...",
      "sellingPoints": ["卖点1：保湿"],
      "cta": "行动引导...",
      "fullVoiceover": "完整口播..."
    },
    "storyboard": [],
    "videoPrompts": [],
    "taskId": "mock-video-xxx",
    "taskStatus": "succeeded",
    "previewUrl": "/uploads/mock/mock-video-xxx-preview.mp4",
    "mockVideoUrl": "/uploads/mock/mock-video-xxx-preview.mp4",
    "trace": []
  }
}
```

### curl 测试命令

```bash
curl.exe -X POST http://127.0.0.1:8787/api/agent/generate -H "Content-Type: application/json" -d "{\"productName\":\"保湿粉底液\",\"category\":\"美妆\",\"price\":\"129元\",\"sellingPoints\":[\"保湿\",\"不卡粉\",\"持妆8小时\"],\"targetAudience\":\"20-30岁女性\",\"platform\":\"小红书\",\"duration\":30,\"tone\":\"自然生活化\",\"videoType\":\"口播带货\",\"style\":\"清新\",\"resolution\":\"1080x1920\"}"
```
