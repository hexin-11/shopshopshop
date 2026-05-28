# ShopClip AI

面向电商商家的 AIGC 带货短视频生成系统。项目用于比赛展示，当前包含前端工作台和素材库后端雏形。

## 目录结构

```text
frontend/  React + TypeScript + Vite + Tailwind CSS 前端页面
backend/   素材库 REST API，当前使用 JSON 文件模拟数据库
```

## 本地启动

前端：

```bash
cd frontend
npm install
npm run dev
```

后端：

```bash
cd backend
npm run dev
```

后端数据库位置已经预留在 `backend/.env.example` 和 `backend/src/storage/databaseAssetStore.js`，之后接真实数据库时再实现即可。
