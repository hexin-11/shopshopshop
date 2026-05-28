export default function SettingsPage() {
  const groups = [
    ["账号设置", ["用户名", "邮箱", "头像"]],
    ["团队设置", ["团队名称", "成员权限", "邀请链接"]],
    ["项目默认设置", ["默认视频比例", "默认语言", "导出格式", "字幕样式"]],
    ["API 集成", ["模型服务状态: 已配置", "TTS 服务状态: 已配置", "视频生成 API: 已配置"]]
  ];
  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-[32px] font-bold text-[#171719] tracking-tight">偏好设置</h1>
        <p className="mt-2 text-[16px] text-[#171719]/60">管理您的账号、团队以及系统集成配置。</p>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        {groups.map(([title, items]) => (
          <section key={title as string} className="card p-8">
            <h2 className="h2-siter text-[24px] mb-8">{title as string}</h2>
            <div className="space-y-6">
              {(items as string[]).map((it) => (
                <label key={it} className="block">
                  <span className="label block mb-2">{it}</span>
                  {it.includes("状态") || it.includes("API") ? (
                    <div className="mt-2 rounded-lg border border-[#4684EE]/30 bg-[#4684EE]/5 px-4 py-3 text-[15px] font-medium text-[#4684EE]">
                      已配置 · 服务正常
                    </div>
                  ) : (
                    <input className="input" placeholder={it} />
                  )}
                </label>
              ))}
            </div>
            <button className="btn-primary mt-8">保存更改</button>
          </section>
        ))}
      </div>
    </div>
  );
}
