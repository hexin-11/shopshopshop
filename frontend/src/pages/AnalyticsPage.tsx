import StatCard from "../components/StatCard";
import { analytics } from "../data/mockData";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-slate-900">数据分析</h1><p className="mt-2 text-slate-500">这是模拟数据，仅用于展示生成视频的优化思路。</p></div>
      <div className="card flex flex-wrap gap-3 p-4">{["日期范围", "商品", "平台", "语言", "视频版本"].map((f) => <select key={f} className="input w-40"><option>{f}</option></select>)}</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{analytics.stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} />)}</div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-5"><h2 className="mb-4 font-semibold text-slate-900">播放趋势</h2><div className="flex h-64 items-end gap-4 rounded-lg bg-slate-50 p-4">{analytics.trend.map((v, i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-brand-500" style={{ height: `${v * 1.8}px` }} /><span className="text-xs text-slate-500">D{i + 1}</span></div>)}</div></section>
        <section className="card p-5"><h2 className="mb-4 font-semibold text-slate-900">不同 Hook 类型表现</h2><div className="space-y-4">{analytics.hooks.map((h) => <div key={h.name}><div className="mb-1 flex justify-between text-sm"><span>{h.name}</span><span>{h.value}</span></div><div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-indigo-500" style={{ width: `${h.value}%` }} /></div></div>)}</div></section>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5"><h2 className="mb-4 font-semibold text-slate-900">A/B 视频版本对比</h2><table className="w-full text-sm"><tbody className="divide-y divide-slate-100">{[["版本 A", "痛点开场", "6.2%", "38%"], ["版本 B", "对比开场", "7.1%", "45%"]].map((r) => <tr key={r[0]}>{r.map((c) => <td key={c} className="py-3 text-slate-600">{c}</td>)}</tr>)}</tbody></table></section>
        <section className="card p-5"><h2 className="mb-4 font-semibold text-slate-900">曝光到下单漏斗</h2><div className="space-y-3">{[["曝光", 100], ["播放", 72], ["点击", 28], ["加购", 12], ["下单", 5]].map(([n, v]) => <div key={n as string} className="rounded bg-brand-50 p-2" style={{ width: `${v as number}%` }}>{n as string}</div>)}</div></section>
      </div>
      <section className="card p-5"><h2 className="mb-4 font-semibold text-slate-900">不同平台表现对比</h2><div className="grid gap-3 md:grid-cols-3">{["TikTok Shop", "Instagram Reels", "YouTube Shorts"].map((p, i) => <div key={p} className="rounded-lg border border-slate-200 p-4"><p className="font-medium text-slate-900">{p}</p><p className="mt-2 text-2xl font-semibold text-brand-700">{[8.4, 6.2, 5.8][i]}%</p><p className="text-sm text-slate-500">点击率</p></div>)}</div></section>
    </div>
  );
}
