import type { LucideIcon } from "lucide-react";

export default function StatCard({ label, value, icon: Icon, delta, onClick }: { label: string; value: string; icon?: LucideIcon; delta?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`card w-full p-5 text-left ${onClick ? "transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        {Icon && <div className="rounded-lg bg-brand-50 p-2 text-brand-600"><Icon size={20} /></div>}
      </div>
      {delta && <p className="mt-3 text-xs font-medium text-emerald-600">{delta}</p>}
    </button>
  );
}
