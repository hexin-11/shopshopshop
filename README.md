# VibeGen AI - 面向电商场景的 AIGC 带货视频生成系统


### 基础信息
- **项目名称 / 课题**：VibeGen AI - 面向电商场景的 AIGC 带货视频生成系统
- **团队名称与成员名单**：VibeGen 研发团队
- **分工说明**：负责全栈开发，包含前端交互界面搭建、后端 API 服务开发、AI 大模型接入与多 Agent 工作流编排调度。

### 功能说明
- **核心功能清单**：
  1. **商品特征与素材分析**：自动分析商品核心价值与受众痛点。
  2. **多阶段 AIGC 内容生成**：自动生成口播剧本、可视化分镜方案及对应画面的视频 Prompt。
  3. **自动化视频生成与任务编排**：一键发起基于视频大模型的成片生成任务，支持异步进度跟踪。
  4. **Mock 与真实 API 灵活切换**：内置 Mock 数据机制，方便无网络/无 Key 情况下本地演示完整闭环。
- **端到端使用流程**：
  用户进入系统后，首先填写或上传商品的基本信息（如商品名称、卖点、受众等）。点击一键生成后，系统会在后台通过多 Agent 工作流依次进行商品分析、剧本撰写、分镜设计和视频 Prompt 编写。随后，系统会调用视频生成模型创建带货短视频，并返回一个追踪任务 ID。用户可通过系统查询任务进度，待任务完成后，即可在线预览最终生成的带货视频和图文分镜结果，并提供导出选项。

### 交付材料
- **在线 Demo / 演示视频链接**：请参阅下方的演示视频，或参考“本地环境启动指南”在本地运行。
- **源代码仓库链接**：本项目提供本地完整代码压缩包（详见当前目录）。

### 🎥 全链路演示视频

> **💡 评委请注意：** 以下视频展示了在无网络/无真实模型 API Key 环境下，通过系统内置的 Mock 引擎完美跑通“商品输入 -> 多 Agent 分析流 -> 视频生成任务编排 -> 结果预览”的全链路闭环过程。

[🎬 点击此处观看全链路演示视频 (demo_recording.mp4)](./demo_recording.mp4)

- **README / 运行说明**：请参阅下方的 [本地环境启动指南](#本地环境启动指南)。

### 技术说明
- **系统架构说明**：
  - **前端层**：基于 React 18 + Vite 构建的交互式工作流控制台。
  - **后端层**：Node.js HTTP Server，提供 RESTful API 与前端交互。
  - **AI / Agent 层**：基于 Volcano Ark API 构建的 Agent 编排层，实现从文本分析到视频生成的链式调用。
- **核心技术栈**：
  - **前端**：React, Vite, TailwindCSS, Zustand
  - **后端**：Node.js, Express
  - **大模型 API**：Volcengine Ark API
  - **数据与部署**：当前使用内存 Mock 数据保障轻量化演示。
- **大模型 / AI 能力使用说明**：
  系统在链路上使用了 Doubao 模型，并拆分为 5 个具体的 Agent：
  - `ProductAnalysisAgent`：分析核心价值与卖点（使用 `Doubao-Seed-2.0-lite`/`pro` 等文本模型）。
  - `ScriptAgent`：生成带货脚本（使用文本模型）。
  - `StoryboardAgent`：生成 3-6 个分镜（使用文本模型）。
  - `VideoPromptAgent`：为每个分镜生成视频 Prompt（使用文本模型）。
  - `TaskOrchestratorAgent`：统筹管理从文本到视频大模型（`Doubao-Seedance-1.5-pro`）的完整链路。
- **关键工程难点与解决方案**：
  1. **复杂 AIGC 链路的状态管理与解耦**：将复杂的“商品到视频”过程拆分为 5 个串联的 Agent，每个 Agent 只负责一个维度的输出。这样不仅提升了中间步骤的可视化程度，也方便后期做断点重试。
  2. **模型输出的 JSON 结构化保证**：通过精心设计的 Prompt 约束和后端的宽容解析机制，确保语言模型稳定输出 JSON 格式以便跨 Agent 稳定流转数据。
  3. **演示环境与真实环境的隔离**：内置了完整的本地内存 Mock 机制（受 `ARK_MOCK` 控制）。即使在比赛演示现场网络不佳或没有配额时，也能展示整个产品的交互与逻辑闭环。
- **部署与访问说明**：
  项目当前可直接在本地启动。启动后端服务（Node.js, 默认端口 8787）及前端服务（Vite, 默认端口 5173）后，评委可通过浏览器访问 `http://localhost:5173` 进行快速体验。

### 结果说明
- **项目完成度**：可用 Demo 版本（已完成前后端基础骨架、5 个核心 Agent 的工作流链路，以及基于模拟的视频生成全链路闭环）。
- **项目亮点 / 创新点**：
  1. **高度聚焦电商垂类痛点**：将原本繁琐的带货短视频策划流程（写脚本、想分镜、找素材）一键自动化，极大地降本增效。
  2. **透明化的多 Agent 架构**：拒绝黑盒式的“一键生成”，将剧本、分镜、Prompt 明确拆解展示，允许用户审核中间产物。
  3. **健壮的工程化 Mock 设计**：兼顾了前瞻性与落地性，一键切换 API 即可接入真实模型，具备极强的二次开发和生产级扩展潜力。

---

## 本地环境启动指南

### 启动方式

**后端：**
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

**前端：**
```bash
cd frontend
npm install
npm run dev
```

### 环境变量配置
根目录和 `backend/` 下都提供了 `.env.example`。真实配置请写入本地 `.env`，不要提交到代码仓库。
```env
ARK_API_KEY=your_ark_api_key_here
ARK_TEXT_MODEL_ENDPOINT=your_text_model_endpoint_here
ARK_VIDEO_MODEL_ENDPOINT=your_video_model_endpoint_here
ARK_TEXT_MODEL_NAME=Doubao-Seed-2.0-pro
ARK_VIDEO_MODEL_NAME=Doubao-Seedance-1.5-pro
ARK_MOCK=true
```

## Ark API 安全说明
- 不要把真实 API Key 写进源代码、README、测试文件或 commit message。
- 后端只允许通过环境变量读取 API Key。
- 默认 `ARK_MOCK=true`，此时不会请求真实 Ark API。文本生成返回 mock LLM 结果，视频生成返回 mock task。
- 只有设置 `ARK_MOCK=false` 且环境变量完整时，`arkClient` 才会请求真实 API。
- 不在日志中打印 API Key、Authorization header 或 Bearer token。
- `.gitignore` 已屏蔽 `.env` 系列文件。

## 详细功能介绍与 API 说明

VibeGen AI 的目标是把“商品信息 → AIGC 视频创作链路”做成一个可演示、可扩展、可接真实模型 API 的系统。

### 核心用户
- 电商商家：快速生成商品带货视频方案。
- 内容运营：批量整理商品卖点、脚本和分镜。
- 视频剪辑/投放团队：把商品素材转成可执行的视频生成任务。
- 比赛评委/产品体验者：通过 mock 流程快速理解完整业务闭环。

### 后端架构
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
当前任务状态保存在内存中，服务重启后不会保留。素材上传目前为 mock 逻辑。

### Agent 架构工作流
```text
商品信息
→ ProductAnalysisAgent
→ ScriptAgent
→ StoryboardAgent
→ VideoPromptAgent
→ TaskOrchestratorAgent
→ 视频任务 → 进度查询 → 预览结果
```

### API 测试示例
完整一键生成：
```bash
curl.exe -X POST http://127.0.0.1:8787/api/agent/generate -H "Content-Type: application/json" -d "{\"productName\":\"保湿粉底液\",\"category\":\"美妆\",\"price\":\"129元\",\"sellingPoints\":[\"保湿\",\"不卡粉\",\"持妆8小时\"],\"targetAudience\":\"20-30岁女性\",\"platform\":\"小红书\",\"duration\":30,\"tone\":\"自然生活化\",\"videoType\":\"口播带货\",\"style\":\"清新\",\"resolution\":\"1080x1920\"}"
```
详细 API 列表及请求示例见 [docs/api.md](docs/api.md)。演示流程见 [docs/demo.md](docs/demo.md)。
