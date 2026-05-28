# ShopClip AI 前端项目

这是一个用于比赛展示的电商 AIGC 带货短视频生成系统前端原型。

技术栈：

- React
- TypeScript
- Vite
- Tailwind CSS
- lucide-react

项目使用 Vite 默认配置，开发服务的 host 和 port 已写入 `npm run dev`，减少本地环境配置问题。

## 页面路由

- `/login` 登录页面
- `/register` 注册页面
- `/dashboard` 仪表盘首页
- `/assets` 素材库页面
- `/scripts` AI 脚本生成页面
- `/projects` 视频项目列表页面
- `/projects/:id` 沉浸式项目工作区
- `/analytics` 数据分析页面
- `/settings` 设置页面

## 启动方式

请注意命令是 `npm`，不是 `nmp`。

前端：

```bash
npm install
npm run dev
```

启动后访问：

```text
http://localhost:5173
```

如果提示 `vite is not recognized`，说明依赖还没有安装成功，需要先执行 `npm install`。

素材库后端：

```bash
cd backend
npm run dev
```

后端默认地址：

```text
http://localhost:8787
```

健康检查：

```text
http://localhost:8787/api/health
```

## 代码结构

```text
src/
  App.tsx
  main.tsx
  index.css
  data/
    mockData.ts
  lib/
    routes.ts
    utils.ts
  components/
    AppLayout.tsx
    Sidebar.tsx
    Topbar.tsx
    StatCard.tsx
    ProjectTable.tsx
    VideoPreviewCard.tsx
    TaskProgressCard.tsx
    AssetCard.tsx
    Stepper.tsx
    Timeline.tsx
    SceneCard.tsx
    CommentPanel.tsx
    MemberAvatarGroup.tsx
    StatusBadge.tsx
    EmptyState.tsx
    LoadingState.tsx
    PageHeader.tsx
    ui/
      Button.tsx
      Panel.tsx
  pages/
    LoginPage.tsx
    RegisterPage.tsx
    DashboardPage.tsx
    AssetsPage.tsx
    ScriptsPage.tsx
    VideoProjectsPage.tsx
    ProjectWorkspacePage.tsx
    AnalyticsPage.tsx
    SettingsPage.tsx
backend/
  src/
    server.js
  data/
    assets.json
  uploads/
    .gitkeep
  README.md
```

## 说明

当前项目使用 mock data，不依赖真实后端。主要交互包括侧边栏收起/展开、页面切换、脚本发送到视频项目、素材搜索筛选、脚本版本切换、视频项目权限展示、项目内沉浸式编辑、任务队列 Tab、Trace Terminal 展开、项目内协作面板和多平台数据对比。
