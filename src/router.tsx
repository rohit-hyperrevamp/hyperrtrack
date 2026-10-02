import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const STALE_BUILD_RELOAD_KEY = "radiant.stale-build-reload";

// Saved sign-ins and cached screens (dashboard counts, employee lists, units…)
// belong to one backend. When the backend changes (e.g. after a remix), wipe
// them so nothing from the previous database is shown.
const BACKEND_MARKER_KEY = "radiant.backend-project";
if (typeof window !== "undefined") {
  try {
    const current = String(import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "");
    if (current && window.localStorage.getItem(BACKEND_MARKER_KEY) !== current) {
      const keep = new Set(["radiant-theme", "theme"]);
      for (const k of Object.keys(window.localStorage)) {
        if (!keep.has(k)) window.localStorage.removeItem(k);
      }
      window.sessionStorage.clear();
      window.localStorage.setItem(BACKEND_MARKER_KEY, current);
    }
  } catch { /* storage unavailable */ }
}

if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    const lastReload = Number(window.sessionStorage.getItem(STALE_BUILD_RELOAD_KEY) ?? 0);
    if (Date.now() - lastReload < 30_000) return;
    window.sessionStorage.setItem(STALE_BUILD_RELOAD_KEY, String(Date.now()));
    window.location.reload();
  });
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cache aggressively — admin reference data (designations, service
        // types, allowances, etc.) barely changes between navigations.
        staleTime: 5 * 60 * 1000, // 5 min: served instantly from cache
        gcTime: 30 * 60 * 1000, // 30 min in memory
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Refetch when a component re-mounts if the query is stale.
        // After a mutation calls invalidateQueries, this guarantees the
        // very next visit to that page shows fresh data instead of a
        // cached copy — the "count updates but the row is missing until
        // I refresh" symptom users see across admin lists.
        refetchOnMount: true,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
