import { useEffect, useMemo, useState } from "react";
import AgentDock from "./components/AgentDock";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import VideoProjectsPage from "./pages/VideoProjectsPage";
import ProjectWorkspacePage from "./pages/ProjectWorkspacePage";
import type { RouteKey } from "./data/mockData";
import { getRouteKeyFromPath, routePaths } from "./lib/routes";

type Route = RouteKey | "login" | "projectWorkspace" | "productDetail";
const AUTH_STORAGE_KEY = "tikframe-authenticated";

const routeFromLocation = (): Route => {
  const p = window.location.pathname;
  if (p === "/login") return "login";
  if (p === "/register") return "login";
  if (p.startsWith("/projects/") || p.startsWith("/editor/")) return "projectWorkspace";
  if (p.startsWith("/products/")) return "productDetail";
  return getRouteKeyFromPath(p);
};

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeFromLocation());
  const [selectedProductId, setSelectedProductId] = useState<string>("prod-earphone");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    const onPopState = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", onPopState);

    const onOpenProjects = () => navigate("projects");
    window.addEventListener("tikframe:openProjects", onOpenProjects as EventListener);

    const onOpenWorkspace = (e: any) => {
      openProject(e.detail?.projectId || "new-project");
    };
    window.addEventListener("tikframe:openProjectWorkspace", onOpenWorkspace);

    const onProductCreated = (e: any) => {
      const productId = e.detail?.productId;
      if (!productId) return;
      setSelectedProductId(productId);
      if (e.detail?.returnTo) {
        setRoute(routeFromLocation());
      }
    };
    window.addEventListener("tikframe:productCreated", onProductCreated);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("tikframe:openProjects", onOpenProjects as EventListener);
      window.removeEventListener("tikframe:openProjectWorkspace", onOpenWorkspace);
      window.removeEventListener("tikframe:productCreated", onProductCreated);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (next: Route) => {
    setRoute(next);
    if (next === "login") {
      window.history.pushState({}, "", "/login"); return;
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

  const handleLogin = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    setIsAuthenticated(true);
    navigate("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setRoute("login");
    window.history.pushState({}, "", "/login");
  };

  const page = useMemo(() => {
    switch (route) {
      case "login":         return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case "products":      return <ProductsPage onSelectProduct={selectProduct} />;
      case "productDetail": return (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={() => navigate("products")}
          openProject={openProject}
        />
      );
      case "projects":      return <VideoProjectsPage openProject={openProject} />;
      case "projectWorkspace": return <ProjectWorkspacePage navigate={(r) => navigate(r)} />;
      default:              return <DashboardPage navigate={(r) => navigate(r)} selectProduct={selectProduct} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, selectedProductId, isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage navigate={navigate} onLogin={handleLogin} />;
  }

  // 全屏页面（不用 AppLayout）
  if (route === "login") {
    return page;
  }

  if (route === "projectWorkspace") {
    return <AgentDock>{page}</AgentDock>;
  }

  // 普通应用页面
  const navCurrent: RouteKey = route === "productDetail" ? "products" : (route as RouteKey);

  return (
    <AgentDock>
      <AppLayout current={navCurrent} navigate={(r) => navigate(r)} onLogout={handleLogout}>
        {page}
      </AppLayout>
    </AgentDock>
  );
}
