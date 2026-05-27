import { projects } from "../data/mockData";
import StatusBadge from "./StatusBadge";

export default function ProjectTable() {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">最近项目</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {["项目名称", "商品", "负责人", "状态", "更新时间", "操作"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.name} className="hover:bg-slate-50/70">
                <td className="px-5 py-4 font-medium text-slate-900">{p.name}</td>
                <td className="px-5 py-4 text-slate-600">{p.product}</td>
                <td className="px-5 py-4 text-slate-600">{p.owner}</td>
                <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-4 text-slate-500">{p.updated}</td>
                <td className="px-5 py-4"><button className="text-brand-600 hover:text-brand-700">打开</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
