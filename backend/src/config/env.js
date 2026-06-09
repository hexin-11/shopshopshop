import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function loadEnvFile(rootDir) {
  const envPath = join(rootDir, ".env");
  let raw = "";
  try {
    raw = await readFile(envPath, "utf8");
  } catch {
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key) {
      process.env[key] = value;
    }
  }
}
