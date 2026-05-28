import { useCallback, useEffect, useState, useMemo } from "react";

// Helper hook to subscribe to pathname/search changes
function useLocationChange() {
  const [loc, setLoc] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));

  useEffect(() => {
    const handlePopState = () => {
      setLoc({
        pathname: window.location.pathname,
        search: window.location.search,
      });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return loc;
}

export function useRouter() {
  const push = useCallback((url: string) => {
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const replace = useCallback((url: string) => {
    window.history.replaceState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  return useMemo(() => ({
    push,
    replace,
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  }), [push, replace]);
}

export function useParams() {
  const { pathname } = useLocationChange();
  const parts = pathname.split("/");
  const project_id = parts[parts.length - 1] || "p-new";
  return useMemo(() => ({ project_id }), [project_id]);
}

export function usePathname() {
  const { pathname } = useLocationChange();
  return pathname;
}

export function useSearchParams() {
  const { search } = useLocationChange();
  return useMemo(() => new URLSearchParams(search), [search]);
}
