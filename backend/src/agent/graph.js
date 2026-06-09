// 轻量级 intent 路由，替换 LangGraph StateGraph
// 去除 @langchain/langgraph 和 @langchain/openai 依赖，避免 OPENAI_API_KEY 报错

import {
  analyzeIntentNode,
  chatNode,
  scriptGenerationNode,
  videoAnalysisNode,
  editPlanNode,
} from "./nodes.js";

function routeByIntent(intent) {
  switch (intent) {
    case "analyze":
      return "analyze_video";
    case "script":
      return "generate_script";
    case "edit":
      return "edit_plan";
    case "chat":
    case "image":
    case "video":
    default:
      return "chat_fallback";
  }
}

/**
 * 轻量级 Agent Graph，不依赖 LangGraph
 * 完全通过 arkClient.js 执行 LLM 调用
 */
export const agentGraph = {
  async invoke(initialState) {
    // Step 1: 分析意图
    const intentResult = await analyzeIntentNode(initialState);
    const state = { ...initialState, ...intentResult };

    // Step 2: 根据意图路由到对应节点
    const route = routeByIntent(state.intent);

    let nodeResult;
    switch (route) {
      case "analyze_video":
        nodeResult = await videoAnalysisNode(state);
        break;
      case "generate_script":
        nodeResult = await scriptGenerationNode(state);
        break;
      case "edit_plan":
        nodeResult = await editPlanNode(state);
        break;
      case "chat_fallback":
      default:
        nodeResult = await chatNode(state);
        break;
    }

    return { ...state, ...nodeResult, trace: state.trace || [] };
  },
};
