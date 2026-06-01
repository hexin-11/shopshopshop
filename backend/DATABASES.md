# ShopClip AI 数据库预留清单

当前演示阶段使用 JSON 文件模拟数据库：

- 业务数据：`backend/data/appData.json`
- 素材元数据：`backend/data/assets.json`
- 文件对象：`backend/uploads/`

真实数据库接入位置已经预留：

- 业务库：`backend/src/storage/databaseAppStore.js`
- 素材库：`backend/src/storage/databaseAssetStore.js`

## 业务库表/集合

| 名称 | 对应前端 | 用途 |
| --- | --- | --- |
| `users` | Topbar / 当前用户 | 登录用户、角色、邮箱、头像 |
| `members` | 协作状态、项目工作区 | 团队成员、在线状态、正在编辑的位置 |
| `products` | 商品库、商品详情、仪表盘近期商品 | 商品名称、品牌、分类、主图、状态、统计计数 |
| `productAssets` | 商品详情素材 Tab | 商品素材卡片、标签、归属商品、使用次数 |
| `productScripts` | 商品详情 AI 脚本 Tab | 每个商品的脚本版本、分镜文案、作者、更新时间 |
| `videoProjects` | 视频项目页、商品详情新建项目 | 项目名称、商品、负责人、进度、比例、权限状态 |
| `renderJobs` | 仪表盘正在渲染、视频项目正在生成 | 生成任务、渲染进度、状态、Trace Terminal 日志 |
| `comments` | 项目协作面板 | 评论目标、评论内容、作者、是否解决 |
| `analyticsSnapshots` | 仪表盘指标卡 | 播放量、转化率、点击率、预计营收等阶段性统计 |
| `platformPerformance` | 仪表盘平台趋势 | TikTok、YouTube、Instagram 等平台曲线和转化表现 |
| `auditLogs` | 后续后台审计 | 创建、更新、生成、发布、删除等操作记录 |

## 编辑器本地工程库

OpenCut 编辑器当前主要使用浏览器 `IndexedDB` / `localStorage` 管理工程状态、媒体缓存、波形缓存、字幕和转写缓存。后续需要云端协作时，建议新增：

| 名称 | 用途 |
| --- | --- |
| `editorProjects` | OpenCut 工程 JSON、场景、时间线、轨道、元素 |
| `editorMedia` | 编辑器媒体索引、波形、字幕、转写、缓存状态 |
| `editorMigrations` | 工程数据版本迁移记录 |

## 已提供 API

- `GET /api/database/manifest`
- `GET /api/bootstrap`
- `GET /api/dashboard`
- `GET /api/users/current`
- `GET /api/members`
- `GET /api/analytics/summary`
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/:id/assets`
- `GET /api/products/:id/scripts`
- `POST /api/products/:id/scripts`
- `GET /api/products/:id/projects`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `GET /api/jobs`
- `POST /api/jobs`
- `PATCH /api/jobs/:id`
- `POST /api/jobs/:id/trace`
- `GET /api/comments`
- `POST /api/comments`
- `PATCH /api/comments/:id`
