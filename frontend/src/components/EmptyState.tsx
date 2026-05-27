import { Inbox } from "lucide-react";

export default function EmptyState({ title = "暂无内容", description = "完成操作后会在这里显示。" }: { title?: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <Inbox className="text-slate-300" size={36} />
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
