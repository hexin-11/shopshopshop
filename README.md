# VibeGen AI

面向电商场景的 AIGC 带货视频生成系统：让商家输入商品信息后，自动完成商品分析、带货脚本、分镜、视频 Prompt、生成任务和 mock 预览结果。

## 项目背景

电商商家在小红书、抖音、TikTok 等平台做短视频带货时，通常需要反复完成选品理解、卖点提炼、脚本撰写、分镜设计、素材整理和视频生成。这个流程对中小商家成本高、周期长，也很难稳定复用。

VibeGen AI 的目标是把“商品信息 → AIGC 视频创作链路”做成一个可演示、可扩展、可接真实模型 API 的系统。当前版本重点完成后端和 Agent 工作流，适合比赛 Demo 展示。

## 核心用户

- 电商商家：快速生成商品带货视频方案。
- 内容运营：批量整理商品卖点、脚本和分镜。
- 视频剪辑/投放团队：把商品素材转成可执行的视频生成任务。
- 比赛评委/产品体验者：通过 mock 流程快速理解完整业务闭环。

## 核心功能

- 商品素材上传 mock。
- 商品分析。
- 带货剧本生成。
- 基础分镜生成。
- 视频 Prompt 生成。
- 一键成片任务创建。
- 任务进度查询。
- mock 视频预览和导出结果。
- Ark API mock / 真实调用可切换架构。

## 当前技术状态

- 当前后端运行版本是 JavaScript。
- `backend/services/arkClient.js` 是实际运行文件。
- `backend/services/arkClient.ts` 是为后续 TypeScript 化准备的镜像文件。
- 当前任务进度是内存级 mock，服务重启后不会保留。
- 当前素材上传是 mock 逻辑，还没有真实文件存储。
- 当前视频生成是 mock / Ark 可切换架构，还没有真实视频生成回调和持久化 trace。

## 后端架构

```text
backend/
  src/server.js              当前后端入口，Node.js HTTP server
  routes/                    AIGC API 路由
  controllers/               请求处理和参数校验
  services/                  Ark Client、mock workflow 等服务
  agents/                    多 Agent 工作流
  data/                      mock 数据
  utils/                     通用响应和输入标准化
  types/                     类型说明
```

当前后端保留原有接口，并新增 AIGC 生成链路。所有接口返回 JSON。

## Agent 架构

```text
商品信息
→ ProductAnalysisAgent
→ ScriptAgent
→ StoryboardAgent
→ VideoPromptAgent
→ TaskOrchestratorAgent
→ 视频任务
→ 进度查询
→ 预览结果
```

- `ProductAnalysisAgent`：分析核心价值、用户痛点、卖点和视频角度。
- `ScriptAgent`：生成带货脚本。
- `StoryboardAgent`：生成 3 到 6 个分镜。
- `VideoPromptAgent`：为每个分镜生成视频 Prompt。
- `TaskOrchestratorAgent`：编排完整一键生成链路。

## API 列表

- `POST /api/materials/upload`
- `GET /api/materials`
- `POST /api/scripts/generate`
- `POST /api/storyboards/generate`
- `POST /api/videos/generate`
- `GET /api/tasks/:taskId`
- `POST /api/agent/generate`

详细请求和返回示例见 [docs/api.md](docs/api.md)。

## 环境变量配置

根目录和 `backend/` 下都提供了 `.env.example`。真实配置请写入本地 `.env`，不要提交到 GitHub。

```env
ARK_API_KEY=your_ark_api_key_here
ARK_TEXT_MODEL_ENDPOINT=your_text_model_endpoint_here
ARK_VIDEO_MODEL_ENDPOINT=your_video_model_endpoint_here
ARK_TEXT_MODEL_NAME=Doubao-Seed-2.0-lite
ARK_VIDEO_MODEL_NAME=Doubao-Seedance-1.5-pro
ARK_MOCK=true
```

## Ark API 安全说明

- 不要把真实 API Key 写进源代码、README、测试文件或 commit message。
- 后端只允许通过环境变量读取 API Key。
- 默认 `ARK_MOCK=true`，不会请求真实 Ark API。
- 只有设置 `ARK_MOCK=false` 且环境变量完整时，`arkClient` 才会请求真实 API。
- 不在日志中打印 API Key、Authorization header 或 Bearer token。
- `.gitignore` 已屏蔽 `.env`、`.env.local`、`.env.*.local`。

## Mock 模式和真实 API 模式

### Mock 模式

默认模式：

```env
ARK_MOCK=true
```

此时：

- 文本生成返回 mock LLM 结果。
- 视频生成返回 mock task。
- 任务查询返回 mock 预览地址和导出地址。
- 不会请求真实 Ark API。

### 真实 API 模式

后续接入真实模型时：

```env
ARK_MOCK=false
ARK_API_KEY=your_real_key_in_local_env_only
ARK_TEXT_MODEL_ENDPOINT=your_text_model_endpoint
ARK_VIDEO_MODEL_ENDPOINT=your_video_model_endpoint
```

真实 Key 只能放在本地 `.env`，不能提交。

## 启动方式

后端：

```bash
cd backend
npm install
npm run start
```

如果默认端口 `8787` 被占用：

```powershell
$env:PORT=8795
npm run start
```

前端：

```bash
cd frontend
npm install
npm run dev
```

## API 测试方式

完整一键生成：

```bash
curl.exe -X POST http://127.0.0.1:8787/api/agent/generate -H "Content-Type: application/json" -d "{\"productName\":\"保湿粉底液\",\"category\":\"美妆\",\"price\":\"129元\",\"sellingPoints\":[\"保湿\",\"不卡粉\",\"持妆8小时\"],\"targetAudience\":\"20-30岁女性\",\"platform\":\"小红书\",\"duration\":30,\"tone\":\"自然生活化\",\"videoType\":\"口播带货\",\"style\":\"清新\",\"resolution\":\"1080x1920\"}"
```

更多接口测试见 [docs/api.md](docs/api.md)。

## Demo 演示流程

1. 启动后端。
2. 准备商品信息。
3. 调用 `/api/agent/generate`。
4. 展示商品分析结果。
5. 展示带货剧本。
6. 展示分镜列表。
7. 展示视频 Prompt。
8. 展示任务 ID 和任务状态。
9. 查询 `/api/tasks/:taskId`。
10. 展示 mock 预览地址和导出地址。

详细演示稿见 [docs/demo.md](docs/demo.md)。

## 当前完成度

已完成：

- 后端 mock API 骨架。
- Ark Client mock / 真实模式切换架构。
- 5 个核心 Agent。
- `/api/agent/generate` 一键生成链路。
- mock 任务进度查询。
- 安全规则和环境变量模板。
- 交付文档。

## 当前不足

- 当前任务状态保存在内存中，服务重启后不会保留。
- 当前素材上传只是 mock 数据，没有真实文件存储。
- 当前视频生成没有真实回调。
- trace 还没有持久化。
- 没有真实数据库。
- 还没有完善的自动化测试和 CI。

## 后续扩展方向

- 接入真实 Ark 文本模型和视频生成模型。
- 增加真实文件上传和对象存储。
- 增加数据库持久化任务、素材、trace 和生成结果。
- 增加失败重试、生成过程 trace 看板。
- 增加素材标签、Embedding 检索和智能剪辑 Agent。
- 增加 TTS、字幕、BGM 和分镜级编辑。
- 将后端逐步 TypeScript 化。
