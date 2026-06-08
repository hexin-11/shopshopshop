# TikFrame AI 素材库后端

这是素材库的轻量后端服务，使用 Node.js 原生能力实现。当前默认使用 JSON 文件保存素材元数据，同时已经预留数据库接入位置。

当前已经建好业务数据库结构：

- 本地演示数据：`backend/data/appData.json`
- Agent 会话数据：`backend/data/agentConversations.json`
- 真实数据库建表脚本：`backend/database/schema.sql`

## 启动

```bash
cd backend
npm run dev
```

默认地址：

```text
http://localhost:8787
```

## 接口

### 健康检查

```http
GET /api/health
```

### Agent 聊天

```http
POST /api/agent/chat
Content-Type: application/json

{
  "message": "开头太平了，帮我改得更吸引人",
  "model": "Pro",
  "attachments": [],
  "references": [],
  "messages": []
}
```

返回固定结构，方便前端展示和后续执行脚本/视频修改：

```json
{
  "reply": "我已经理解你的修改要求。",
  "changes": [
    {
      "type": "replace_script",
      "target": "开场旁白",
      "summary": "把开头改成更抓人的表达。",
      "newText": "每天都被噪音打断？戴上它，一秒切回自己的安静节奏。",
      "status": "draft"
    }
  ]
}
```

没有配置 `AGENT_API_KEY` 时，接口会返回本地 mock 结果，方便前端演示。接入真实豆包/比赛 API 时，把 `backend/.env.example` 复制成 `backend/.env`，只在 `.env` 中填写真实密钥。

当前 Agent 支持的结构化能力：

- `generate_script`：生成或修改带货脚本
- `image_candidates`：文生图/商品图候选，前端可选图
- `image_to_video`：基于选图生成图生视频任务方案
- `edit_plan`：剪辑动作计划，包括裁剪、字幕、运镜、配乐和节奏
- `replace_caption` / `adjust_video` / `replace_asset`：后续接真实剪辑 API 时的执行指令

### Agent 会话历史

```http
GET /api/agent/conversations
```

返回后端保存的 Agent 会话、消息、思考摘要和结构化修改结果。之后你想往数据库里加数据，可以先直接改 `backend/data/agentConversations.json`，或者接真实数据库后往 `agent_conversations`、`agent_messages`、`agent_change_events` 三张表插入。
文生图和图生视频资产后续写入 `generated_images`、`generated_videos` 两张表。

### 素材列表

```http
GET /api/assets?keyword=耳机&type=商品图片&category=数码配件&tag=通勤&page=1&pageSize=12
```

### 素材详情

```http
GET /api/assets/:id
```

### 上传素材

使用 JSON 上传，`contentBase64` 可选。比赛演示时可以只传元数据；如果传文件内容，会保存到 `backend/uploads/`。

```http
POST /api/assets
Content-Type: application/json

{
  "fileName": "earphone-main.png",
  "type": "商品图片",
  "category": "数码配件",
  "tags": ["耳机", "白底", "主图"],
  "uploader": "何鑫",
  "mimeType": "image/png",
  "size": 245760,
  "contentBase64": "..."
}
```

### 更新素材

```http
PATCH /api/assets/:id
Content-Type: application/json

{
  "tags": ["耳机", "降噪", "通勤"],
  "category": "数码配件"
}
```

### 记录使用次数

```http
POST /api/assets/:id/use
```

### 删除素材

```http
DELETE /api/assets/:id
```

### 筛选项

```http
GET /api/assets/meta/filters
```

### 统计

```http
GET /api/assets/meta/summary
```

## 说明

- 元数据存储在 `backend/data/assets.json`
- 业务数据存储在 `backend/data/appData.json`
- Agent 会话存储在 `backend/data/agentConversations.json`
- 真实数据库 schema 在 `backend/database/schema.sql`
- 上传文件存储在 `backend/uploads/`
- 数据库接入预留在 `backend/src/storage/databaseAssetStore.js`
- 当前存储适配器在 `backend/src/storage/jsonAssetStore.js`
- 之后接数据库时，把 `.env` 里的 `ASSET_STORE=json` 改成 `ASSET_STORE=database`，并实现 `databaseAssetStore.js`
- `node_modules/` 不需要提交到 GitHub
- `backend/.env` 不要提交到 GitHub，真实 API Key 只放本地或部署平台环境变量
