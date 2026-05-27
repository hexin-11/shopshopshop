import { jobs } from "../data/mockData";

export default function TaskProgressCard() {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold text-slate-900">任务进度</h3>
      <div className="space-y-4">
        {jobs.slice(0, 3).map((j) => (
          <div key={j.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-slate-700">{j.name}</span>
              <span className="text-slate-500">{j.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${j.progress}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
