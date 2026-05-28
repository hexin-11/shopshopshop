// 数据库接入预留位置。
// 之后可以在这里接 MySQL、PostgreSQL、MongoDB 或云数据库。
//
// 推荐实现同样的接口：
// {
//   name: "database",
//   async list() {},
//   async saveAll(assets) {}
// }
//
// 当前比赛演示阶段不启用数据库，避免引入额外环境依赖。

export function createDatabaseAssetStore() {
  throw new Error("数据库存储尚未配置。请先实现 backend/src/storage/databaseAssetStore.js，并设置 ASSET_STORE=database。");
}
