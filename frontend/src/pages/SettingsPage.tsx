export default function SettingsPage() {
  const groups = [
    ["账号设置", ["用户名", "邮箱", "头像"]],
    ["团队设置", ["团队名称", "成员权限", "邀请链接"]],
    ["项目设置", ["默认视频比例", "默认语言", "默认导出格式", "默认字幕样式"]],
    ["API 设置", ["模型服务状态：已配置", "TTS 服务状态：已配置", "视频生成服务状态：已配置"]]
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-slate-900">设置</h1><p className="mt-2 text-slate-500">管理账号、团队、项目默认项和服务状态。</p></div>
      <div className="grid gap-6 xl:grid-cols-2">
        {groups.map(([title, items]) => <section key={title as string} className="card p-6"><h2 className="mb-5 font-semibold text-slate-900">{title as string}</h2><div className="space-y-4">{(items as string[]).map((it) => <label key={it} className="block"><span className="label">{it}</span>{it.includes("状态") ? <div className="mt-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">已配置 · 服务正常</div> : <input className="input mt-1" placeholder={it} />}</label>)}</div><button className="btn-primary mt-6">保存设置</button></section>)}
      </div>
    </div>
  );
}
