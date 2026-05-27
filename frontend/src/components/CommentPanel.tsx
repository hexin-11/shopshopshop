import { comments } from "../data/mockData";

export default function CommentPanel() {
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={`${c.author}-${c.time}`} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900">{c.author}</span>
            <span className="text-xs text-slate-400">{c.time}</span>
          </div>
          <p className="text-xs text-slate-500">{c.target}</p>
          <p className="mt-2 text-sm text-slate-700">{c.text}</p>
          <button className={`mt-3 text-xs font-medium ${c.solved ? "text-emerald-600" : "text-brand-600"}`}>{c.solved ? "已解决" : "标记已解决"}</button>
        </div>
      ))}
      <textarea className="input min-h-24" placeholder="@成员 添加评论…" />
    </div>
  );
}
