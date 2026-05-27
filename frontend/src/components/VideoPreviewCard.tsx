export default function VideoPreviewCard() {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">最近视频预览</h3>
        <span className="text-xs text-slate-500">9:16</span>
      </div>
      <div className="mx-auto flex aspect-[9/16] max-h-80 max-w-[180px] flex-col justify-end rounded-xl bg-gradient-to-b from-slate-800 via-slate-700 to-brand-700 p-4 text-white">
        <p className="text-sm font-semibold">沉浸音效，全天在线</p>
        <p className="mt-1 text-xs text-slate-200">主动降噪头戴式耳机</p>
      </div>
    </div>
  );
}
