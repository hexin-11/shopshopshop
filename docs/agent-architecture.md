# Agent 架构说明

VibeGen AI 的后端 Agent 采用流水线结构，把一个电商商品逐步转成可执行的视频生成任务。

## Agent 列表

## ProductAnalysisAgent

负责商品分析。

输入商品名称、分类、价格、卖点、人群、平台、时长和语气，输出：

- 核心价值
- 目标痛点
- 主要卖点
- 视频切入角度
- 推荐风格

## ScriptAgent

负责带货脚本生成。

基于商品分析结果，输出：

- hook
- problem
- solution
- sellingPoints
- cta
- fullVoiceover

## StoryboardAgent

负责分镜生成。

把脚本拆成 3 到 6 个分镜，每个分镜包含：

- shotId
- duration
- scene
- visual
- subtitle
- voiceover
- camera
- transition

## VideoPromptAgent

负责视频 Prompt 生成。

根据每个分镜生成文生视频或图生视频 Prompt，输出：

- shotId
- mode
- prompt
- negativePrompt
- style
- aspectRatio

## TaskOrchestratorAgent

负责编排完整链路。

它会按顺序调用：

1. ProductAnalysisAgent
2. ScriptAgent
3. StoryboardAgent
4. VideoPromptAgent
5. Ark Client mock 视频任务
6. mock 任务状态查询
7. mock 预览结果返回

## 文本版流程图

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

## 安全设计

- Agent 不直接读取 API Key。
- Agent 只通过 `backend/services/arkClient.js` 调用模型能力。
- 默认 `ARK_MOCK=true`，所有模型和视频任务都返回 mock 结果。
- 只有 `ARK_MOCK=false` 且本地环境变量完整时，Ark Client 才会请求真实 API。

## 当前实现状态

当前 Agent 已可用于比赛 Demo：

- 能生成商品分析。
- 能生成带货脚本。
- 能生成基础分镜。
- 能生成视频 Prompt。
- 能创建 mock 视频任务。
- 能返回 mock 预览结果。

当前仍未完成：

- 真实视频生成回调。
- 任务持久化。
- trace 持久化。
- 失败重试。
- 素材 Embedding 检索。
