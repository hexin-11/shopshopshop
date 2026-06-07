import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function createJsonAppStore({ rootDir }) {
  const dataFile = join(rootDir, "data", "appData.json");

  async function ensureStorage() {
    await mkdir(join(rootDir, "data"), { recursive: true });
    try {
      await stat(dataFile);
    } catch {
      const { default: seed } = await import("../../data/appData.seed.js");
      await writeFile(dataFile, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
    }
  }

  return {
    name: "json-app",
    async read() {
      await ensureStorage();
      return JSON.parse(await readFile(dataFile, "utf8"));
    },
    async write(data) {
      await ensureStorage();
      await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    }
  };
}
