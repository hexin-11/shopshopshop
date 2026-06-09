import type { ReactNode } from "react";
import TopNav from "./TopNav";
import type { RouteKey } from "../data/mockData";

interface AppLayoutProps {
  children: ReactNode;
  current: RouteKey;
  navigate: (route: RouteKey) => void;
  onLogout: () => void;
}

export default function AppLayout({ children, current, navigate, onLogout }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-[#171719] overflow-x-hidden">
      <TopNav current={current} navigate={navigate} onLogout={onLogout} />
      <main className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12 py-8 lg:py-16">
        {children}
      </main>
    </div>
  );
}
