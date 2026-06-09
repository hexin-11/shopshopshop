import { generateText } from "../services/arkClient.js";
import { buildAgentMessages, compactTrace, normalizeAgentInput } from "./helpers.js";

export const ProductAnalysisAgent = {
  async run(input) {
    const normalized = normalizeAgentInput(input);
    const llm = await generateText({
      messages: buildAgentMessages(
        "ProductAnalysisAgent",
        "分析商品核心价值、目标痛点、主要卖点、视频切入角度和推荐风格。",
        normalized,
      ),
      temperature: 0.3,
    });

    const firstPoint = normalized.sellingPoints[0];
    const secondPoint = normalized.sellingPoints[1] || firstPoint;

    return {
      coreValue: `${normalized.productName}的核心价值是用${firstPoint}解决${normalized.targetAudience}在${normalized.category}选择中的实际顾虑，并用${normalized.tone}方式降低理解成本。`,
      targetPainPoints: [
        `${normalized.targetAudience}想快速判断${normalized.productName}是否适合自己`,
        `用户会比较${normalized.price}和${secondPoint}带来的实际价值`,
        `${normalized.platform}场景下需要在前几秒讲清楚购买理由`,
      ],
      mainSellingPoints: normalized.sellingPoints,
      videoAngle: `${normalized.videoType}方向：先用真实痛点抓住注意力，再用商品细节和使用场景证明${normalized.productName}值得买。`,
      recommendedStyle: normalized.style,
      llm,
      trace: compactTrace("product_analysis", llm),
    };
  },
};
