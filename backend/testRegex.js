const chunk = `event: progress\ndata: {"message":"完成商品卖点和痛点分析","state":{}}`;
const match = chunk.match(/event: (.*?)\ndata: (.*)/);
console.log(match ? "matched" : "failed");
