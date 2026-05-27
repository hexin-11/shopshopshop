export default function Stepper({ current = 1 }: { current?: number }) {
  const steps = ["填写商品信息", "上传素材", "生成脚本", "编辑分镜", "导出视频"];
  return (
    <div className="card p-5">
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const active = index + 1 <= current;
          return (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>{index + 1}</div>
              <span className={`text-sm font-medium ${active ? "text-slate-900" : "text-slate-500"}`}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
