import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function createJsonAgentStore({ rootDir }) {
  const dataFile = join(rootDir, "data", "agentConversations.json");

  async function ensureStorage() {
    await mkdir(join(rootDir, "data"), { recursive: true });
    try {
      await stat(dataFile);
    } catch {
      const { default: seed } = await import("../../data/agentConversations.seed.js");
      await writeFile(dataFile, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
    }
  }

  return {
    name: "json-agent",
    async read() {
      await ensureStorage();
      const raw = await readFile(dataFile, "utf8");
      return JSON.parse(raw.replace(/^\uFEFF/, ""));
    },
    async write(data) {
      await ensureStorage();
      await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    },
  };
}
