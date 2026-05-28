import type { ReactNode } from "react";
import TopNav from "./TopNav";
import type { RouteKey } from "../data/mockData";

interface AppLayoutProps {
  children: ReactNode;
  current: RouteKey;
  navigate: (route: RouteKey) => void;
}

export default function AppLayout({ children, current, navigate }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-[#171719]">
      <TopNav current={current} navigate={navigate} />
      <main className="mx-auto w-full max-w-[1440px] px-8 py-16 lg:px-12">
        {children}
      </main>
    </div>
  );
}
