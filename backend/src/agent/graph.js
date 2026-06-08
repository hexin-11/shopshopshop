import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import { 
  analyzeIntentNode, 
  chatNode, 
  scriptGenerationNode, 
  videoAnalysisNode, 
  editPlanNode 
} from "./nodes.js";

// ====== 路由判断 ======

function routeByIntent(state) {
  const { intent } = state;
  switch (intent) {
    case "analyze":
      return "analyze_video";
    case "script":
      return "generate_script";
    case "edit":
      return "edit_plan";
    // 简化起见，image/video 在这里先统一走到 chat，可以后续扩展
    case "chat":
    case "image":
    case "video":
    default:
      return "chat_fallback";
  }
}

// ====== 构建图 ======

const workflow = new StateGraph(AgentState)
  // 添加节点
  .addNode("intent_router", analyzeIntentNode)
  .addNode("chat_fallback", chatNode)
  .addNode("generate_script", scriptGenerationNode)
  .addNode("analyze_video", videoAnalysisNode)
  .addNode("edit_plan", editPlanNode)
  
  // 添加边
  .addEdge(START, "intent_router")
  .addConditionalEdges("intent_router", routeByIntent, {
    "analyze_video": "analyze_video",
    "generate_script": "generate_script",
    "edit_plan": "edit_plan",
    "chat_fallback": "chat_fallback"
  })
  
  // 所有叶子节点结束
  .addEdge("analyze_video", END)
  .addEdge("generate_script", END)
  .addEdge("edit_plan", END)
  .addEdge("chat_fallback", END);

// 编译图
export const agentGraph = workflow.compile();
