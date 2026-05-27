import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { RouteKey } from "../data/mockData";
import { cn } from "../lib/utils";

export default function AppLayout({ children, current, navigate }: { children: ReactNode; current: RouteKey; navigate: (route: RouteKey) => void }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar current={current} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} navigate={navigate} />
      <div className={cn("transition-all", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        <Topbar />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
