import { MessageSquare, RefreshCw, Save, Send } from "lucide-react";
import { useState } from "react";
import CommentPanel from "../components/CommentPanel";

export default function ScriptsPage({ navigate }: { navigate: (r: "projects") => void }) {
  const [version, setVersion] = useState("v3 增强转化话术");
  const versionNotes: Record<string, string> = {
    "v1 初稿": "偏基础结构，适合快速生成分镜。",
    "v2 修改卖点顺序": "将主动降噪提前，弱化技术参数。",
    "v3 增强转化话术": "强化购买引导和平台优惠表达。"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-2xl font-semibold text-slate-900">AI 脚本生成</h1><p className="mt-2 text-slate-500">像文案工作台一样管理商品脚本、版本和协作建议。</p></div>
        <div className="flex flex-wrap gap-2"><button className="btn-primary">生成脚本</button><button className="btn-secondary"><RefreshCw size={16} />重新生成</button><button className="btn-secondary"><Save size={16} />保存为版本</button><button onClick={() => navigate("projects")} className="btn-secondary"><Send size={16} />发送到视频项目</button></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[280px_1fr_320px]">
        <aside className="card h-fit p-5">
          <h2 className="font-semibold text-slate-900">商品信息和生成参数</h2>
          <div className="mt-4 space-y-4">
            {[
              ["视频目标", ["种草", "转化", "新品介绍", "促销活动"]],
              ["视频时长", ["15秒", "30秒", "60秒"]],
              ["语言", ["中文", "英文", "韩文", "日文"]],
              ["风格", ["生活方式", "专业测评", "轻松口播", "高级质感"]],
              ["开场方式", ["痛点开场", "问题开场", "场景开场", "对比开场"]]
            ].map(([label, opts]) => <label key={label as string} className="block"><span className="label">{label as string}</span><select className="input mt-1">{(opts as string[]).map((o) => <option key={o}>{o}</option>)}</select></label>)}
          </div>
        </aside>
        <section className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900">脚本版本</h2>
            <div className="grid gap-3 md:grid-cols-3">{["v1 初稿", "v2 修改卖点顺序", "v3 增强转化话术"].map((v) => <button key={v} onClick={() => setVersion(v)} className={`rounded-lg border p-3 text-left text-sm ${version === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"}`}><span className="font-medium">{v}</span><span className="mt-1 block text-xs text-slate-500">{versionNotes[v]}</span></button>)}</div>
          </div>
          <article className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">降噪耳机夏季促销脚本</h2>
                <p className="mt-1 text-sm text-slate-500">当前版本：{version}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">已自动保存</span>
            </div>
            <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700">
              {[
                ["开场 Hook", "通勤路上总被噪音打断？戴上 Havit H630BT，把注意力还给自己。"],
                ["卖点顺序", "主动降噪、柔软耳罩、长续航、低延迟连接。"],
                ["分镜脚本", "镜头 1 展示地铁环境，镜头 2 切换佩戴瞬间，镜头 3 展示产品细节，镜头 4 强化续航，镜头 5 引导购买。"],
                ["字幕文案", "沉浸音效，全天在线。主动降噪头戴式耳机，通勤、办公、学习都适合。"],
                ["旁白文案", "如果你需要一副舒服、安静、续航够久的耳机，可以试试这款。"],
                ["结尾 CTA", "现在进入 TikTok Shop，查看今日优惠。"]
              ].map(([h, c]) => <section key={h}><h3 className="font-semibold text-slate-900">{h}</h3><p className="mt-1">{c}</p></section>)}
            </div>
          </article>
        </section>
        <aside className="card h-fit p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><MessageSquare size={17} />评论和协作建议</h2>
          <CommentPanel />
        </aside>
      </div>
    </div>
  );
}
