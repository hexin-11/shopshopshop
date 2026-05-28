import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function createJsonAssetStore({ rootDir }) {
  const dataFile = join(rootDir, "data", "assets.json");

  async function ensureStorage() {
    await mkdir(join(rootDir, "data"), { recursive: true });
    try {
      await stat(dataFile);
    } catch {
      await writeFile(dataFile, "[]", "utf8");
    }
  }

  return {
    name: "json",
    async list() {
      await ensureStorage();
      return JSON.parse(await readFile(dataFile, "utf8"));
    },
    async saveAll(assets) {
      await ensureStorage();
      await writeFile(dataFile, `${JSON.stringify(assets, null, 2)}\n`, "utf8");
    }
  };
}
