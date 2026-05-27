const styles: Record<string, string> = {
  "已完成": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "渲染中 60%": "bg-blue-50 text-blue-700 ring-blue-200",
  "待审核": "bg-amber-50 text-amber-700 ring-amber-200",
  "排队中": "bg-slate-100 text-slate-700 ring-slate-200",
  "失败": "bg-rose-50 text-rose-700 ring-rose-200",
  "等待中": "bg-slate-100 text-slate-700 ring-slate-200",
  "生成配音中": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "合成视频中": "bg-blue-50 text-blue-700 ring-blue-200"
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${styles[status] ?? styles["排队中"]}`}>{status}</span>;
}
