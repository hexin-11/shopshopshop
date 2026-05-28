import { useCallback } from "react";

export function useRouter() {
  const push = useCallback((url: string) => {
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const replace = useCallback((url: string) => {
    window.history.replaceState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  return {
    push,
    replace,
    back: useCallback(() => {
      window.history.back();
    }, []),
    forward: useCallback(() => {
      window.history.forward();
    }, []),
    refresh: useCallback(() => {
      window.location.reload();
    }, []),
    prefetch: useCallback(() => {}, []),
  };
}

export function useParams() {
  const parts = window.location.pathname.split("/");
  // The last segment of /projects/p-new is p-new, which is project_id
  const project_id = parts[parts.length - 1] || "p-new";
  return { project_id };
}

export function usePathname() {
  return window.location.pathname;
}

export function useSearchParams() {
  return new URLSearchParams(window.location.search);
}
