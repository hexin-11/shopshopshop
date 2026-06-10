import { generateText } from "./services/arkClient.js";
import { loadEnvFile } from "./src/config/env.js";

async function main() {
  await loadEnvFile(".");
  // Override mock to false for testing
  process.env.ARK_MOCK = "false";
  
  try {
    console.log("Calling API...");
    const result = await generateText({
      messages: [{ role: "user", content: "你好，你是谁？" }]
    });
    console.log("Success:", result);
  } catch (error) {
    console.error("Error details:", error);
    if (error.response) {
      console.error(await error.response.text());
    }
  }
}
main();
