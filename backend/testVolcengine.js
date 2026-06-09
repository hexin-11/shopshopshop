import { loadEnvFile } from "./src/config/env.js";
await loadEnvFile(process.cwd());
import { ChatOpenAI } from "@langchain/openai";

async function test() {
  const config = {
    modelName: process.env.ARK_TEXT_MODEL_NAME,
    apiKey: process.env.ARK_TEXT_API_KEY,
    baseURL: process.env.ARK_TEXT_MODEL_ENDPOINT.replace(/\/chat\/completions$/, "")
  };
  
  console.log("Config:", config);
  
  const llm = new ChatOpenAI({
    modelName: config.modelName,
    apiKey: config.apiKey,
    configuration: { baseURL: config.baseURL },
    temperature: 0.4,
    streaming: true,
    modelKwargs: { thinking: { type: "disabled" } }
  });

  try {
    console.log("Invoking on streaming LLM...");
    const res = await llm.invoke("Hello, say 'Test Passed' in JSON");
    console.log("Result:", res.content);
  } catch(e) {
    console.error("Error:", e);
  }
}

test();
