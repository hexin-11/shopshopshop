# Demo 演示流程

本文档用于比赛现场快速演示 VibeGen AI 的后端 Agent 工作流。

## 1. 打开项目

启动后端：

```bash
cd backend
npm run start
```

默认地址：

```text
http://127.0.0.1:8787
```

如果端口被占用，可以换端口：

```powershell
$env:PORT=8795
npm run start
```

## 2. 输入商品信息

示例商品：

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

## 3. 调用一键生成接口

```bash
curl.exe -X POST http://127.0.0.1:8787/api/agent/generate -H "Content-Type: application/json" -d "{\"productName\":\"保湿粉底液\",\"category\":\"美妆\",\"price\":\"129元\",\"sellingPoints\":[\"保湿\",\"不卡粉\",\"持妆8小时\"],\"targetAudience\":\"20-30岁女性\",\"platform\":\"小红书\",\"duration\":30,\"tone\":\"自然生活化\",\"videoType\":\"口播带货\",\"style\":\"清新\",\"resolution\":\"1080x1920\"}"
```

## 4. 展示商品分析结果

返回字段：

```text
data.productAnalysis
```

重点展示：

- 核心价值
- 目标痛点
- 主要卖点
- 视频切入角度
- 推荐风格

## 5. 展示带货剧本

返回字段：

```text
data.script
```

重点展示：

- hook
- problem
- solution
- sellingPoints
- cta
- fullVoiceover

## 6. 展示分镜

返回字段：

```text
data.storyboard
```

每个分镜包含：

- shotId
- duration
- scene
- visual
- subtitle
- voiceover
- camera
- transition

## 7. 展示视频 Prompt

返回字段：

```text
data.videoPrompts
```

每个 Prompt 包含：

- shotId
- mode
- prompt
- negativePrompt
- style
- aspectRatio

## 8. 展示任务进度

一键生成接口会返回：

```text
data.taskId
data.taskStatus
```

继续查询任务：

```bash
curl.exe http://127.0.0.1:8787/api/tasks/YOUR_TASK_ID
```

## 9. 展示 mock 视频预览结果

返回字段：

```text
data.previewUrl
data.mockVideoUrl
data.previewResult.exportUrl
```

当前是 mock 预览地址，用于证明后端生成链路和任务状态已经打通。

## 10. 说明真实 Ark API 如何切换

当前默认：

```env
ARK_MOCK=true
```

这代表系统不会请求真实 Ark API。

切换真实 API 时，需要在本地 `.env` 中配置：

```env
ARK_MOCK=false
ARK_API_KEY=your_real_key_in_local_env_only
ARK_TEXT_MODEL_ENDPOINT=your_text_model_endpoint
ARK_VIDEO_MODEL_ENDPOINT=your_video_model_endpoint
```

真实 Key 只能放在本地 `.env`，不能提交到 GitHub。真实模式会通过 `backend/services/arkClient.js` 统一调用，不允许 Agent 直接读取 Key。
