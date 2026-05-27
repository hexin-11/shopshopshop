export default function LoadingState({ label = "正在加载…" }: { label?: string }) {
  return (
    <div className="card flex items-center gap-3 p-5 text-sm text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-r-transparent" />
      {label}
    </div>
  );
}
