# ShopClip AI 素材库后端

这是素材库的轻量后端服务，使用 Node.js 原生能力实现。当前默认使用 JSON 文件保存素材元数据，同时已经预留数据库接入位置。

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
- 上传文件存储在 `backend/uploads/`
- 数据库接入预留在 `backend/src/storage/databaseAssetStore.js`
- 当前存储适配器在 `backend/src/storage/jsonAssetStore.js`
- 之后接数据库时，把 `.env` 里的 `ASSET_STORE=json` 改成 `ASSET_STORE=database`，并实现 `databaseAssetStore.js`
- `node_modules/` 不需要提交到 GitHub
