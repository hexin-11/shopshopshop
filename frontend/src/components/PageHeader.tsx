import type { ReactNode } from "react";

export default function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-900">{title}</h1>
        {description ? <p className="mt-2 text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
