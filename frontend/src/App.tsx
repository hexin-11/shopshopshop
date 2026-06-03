import { useEffect, useMemo, useState } from "react";
import AgentDock from "./components/AgentDock";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import VideoProjectsPage from "./pages/VideoProjectsPage";
import ProjectWorkspacePage from "./pages/ProjectWorkspacePage";
import SettingsPage from "./pages/SettingsPage";
import type { RouteKey } from "./data/mockData";
import { getRouteKeyFromPath, routePaths } from "./lib/routes";

type Route = RouteKey | "login" | "register" | "projectWorkspace" | "productDetail";

const routeFromLocation = (): Route => {
  const p = window.location.pathname;
  if (p === "/login") return "login";
  if (p === "/register") return "register";
  if (p.startsWith("/projects/") || p.startsWith("/editor/")) return "projectWorkspace";
  if (p.startsWith("/products/")) return "productDetail";
  return getRouteKeyFromPath(p);
};

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeFromLocation());
  const [selectedProductId, setSelectedProductId] = useState<string>("prod-earphone");

  useEffect(() => {
    const onPopState = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (next: Route) => {
    setRoute(next);
    if (next === "login" || next === "register") {
      window.history.pushState({}, "", `/${next}`); return;
    }
    if (next === "projectWorkspace") {
      window.history.pushState({}, "", "/projects/p-earphone"); return;
    }
    if (next === "productDetail") {
      window.history.pushState({}, "", `/products/${selectedProductId}`); return;
    }
    window.history.pushState({}, "", routePaths[next as RouteKey]);
  };

  const openProject = (projectId: string) => {
    setRoute("projectWorkspace");
    window.history.pushState({}, "", `/projects/${projectId}`);
  };

  const selectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setRoute("productDetail");
    window.history.pushState({}, "", `/products/${productId}`);
  };

  const page = useMemo(() => {
    switch (route) {
      case "login":         return <LoginPage navigate={navigate} />;
      case "register":      return <RegisterPage navigate={navigate} />;
      case "products":      return <ProductsPage onSelectProduct={selectProduct} />;
      case "productDetail": return (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={() => navigate("products")}
          openProject={openProject}
          onQuickGenerate={() => navigate("products")}
        />
      );
      case "projects":      return <VideoProjectsPage openProject={openProject} />;
      case "projectWorkspace": return <ProjectWorkspacePage navigate={(r) => navigate(r)} />;
      case "settings":      return <SettingsPage />;
      default:              return <DashboardPage navigate={(r) => navigate(r)} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, selectedProductId]);

  // 全屏页面（不用 AppLayout）
  if (route === "login" || route === "register" || route === "projectWorkspace") {
    return <AgentDock>{page}</AgentDock>;
  }

  // 普通应用页面
  const navCurrent: RouteKey = route === "productDetail" ? "products" : (route as RouteKey);

  return (
    <AgentDock>
      <AppLayout current={navCurrent} navigate={(r) => navigate(r)}>
        {page}
      </AppLayout>
    </AgentDock>
  );
}
