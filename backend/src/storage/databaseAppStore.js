// TikFrame 业务数据库接入预留位置。
//
// 这里负责承接前端工作台除素材文件本体以外的核心业务数据：
// users, members, products, productScripts, videoProjects, renderJobs,
// comments, analyticsSnapshots, platformPerformance, auditLogs。
//
// 未来接真实数据库时，推荐实现同样接口：
// {
//   name: "postgres-app" | "mysql-app" | "mongo-app",
//   async read() {},
//   async write(data) {}
// }
//
// 当前比赛演示阶段默认使用 backend/data/appData.json，避免额外环境依赖。

export function createDatabaseAppStore() {
  throw new Error("业务数据库尚未配置。请实现 backend/src/storage/databaseAppStore.js，并设置 APP_STORE=database。");
}

