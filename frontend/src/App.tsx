import { useEffect, useMemo, useState } from "react";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import ScriptsPage from "./pages/ScriptsPage";
import VideoProjectsPage from "./pages/VideoProjectsPage";
import ProjectWorkspacePage from "./pages/ProjectWorkspacePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import type { RouteKey } from "./data/mockData";
import { getRouteKeyFromPath, routePaths } from "./lib/routes";

type Route = RouteKey | "login" | "register" | "projectWorkspace";

const routeFromLocation = (): Route => {
  const pathname = window.location.pathname;
  if (pathname === "/login") return "login";
  if (pathname === "/register") return "register";
  if (pathname.startsWith("/projects/")) return "projectWorkspace";
  return getRouteKeyFromPath(pathname);
};

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeFromLocation());

  useEffect(() => {
    const handlePopState = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (next: Route) => {
    setRoute(next);
    if (next === "login" || next === "register") {
      window.history.pushState({}, "", `/${next}`);
      return;
    }
    if (next === "projectWorkspace") {
      window.history.pushState({}, "", "/projects/p-earphone");
      return;
    }
    window.history.pushState({}, "", routePaths[next]);
  };

  const openProject = (projectId: string) => {
    setRoute("projectWorkspace");
    window.history.pushState({}, "", `/projects/${projectId}`);
  };

  const page = useMemo(() => {
    switch (route) {
      case "login": return <LoginPage navigate={navigate} />;
      case "register": return <RegisterPage navigate={navigate} />;
      case "assets": return <AssetsPage />;
      case "scripts": return <ScriptsPage navigate={(r) => navigate(r)} />;
      case "projects": return <VideoProjectsPage openProject={openProject} />;
      case "projectWorkspace": return <ProjectWorkspacePage navigate={(r) => navigate(r)} />;
      case "analytics": return <AnalyticsPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage navigate={(r) => navigate(r)} />;
    }
  }, [route]);

  if (route === "login" || route === "register") return page;
  if (route === "projectWorkspace") return page;

  return (
    <AppLayout current={route} navigate={(next) => navigate(next)}>
      {page}
    </AppLayout>
  );
}
