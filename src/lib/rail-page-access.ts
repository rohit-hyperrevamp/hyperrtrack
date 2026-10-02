import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Navigation uses the same server-enforced rail_can decision as the database.
export const RAIL_PAGE_MODULES: Record<string, string> = {
  command: "rail_ops",
  live: "rail_ops",
  me: "rail_ops",
  checker: "rail_quality",
  quality: "rail_quality",
  supplies: "rail_supplies",
  sustainability: "rail_sustainability",
  billing: "rail_billing",
  people: "rail_access",
  settings: "rail_settings",
  "ai-check": "rail_ops",
};

export function railHomeForAccess(access?: Record<string, boolean>, roleKey?: string | null) {
  const preferred = roleKey === "rail_cleaner" ? "me" : roleKey === "rail_railway_checker" ? "checker" : "command";
  const sections = [preferred, "command", "live", "me", "checker", "quality", "supplies", "sustainability", "billing", "people", "settings", "ai-check"];
  const first = sections.find((section) => access?.[RAIL_PAGE_MODULES[section]] === true);
  return first ? `/admin/rail/${first}` : "/admin/profile";
}

export function useRailPageAccess(enabled: boolean) {
  return useQuery({
    queryKey: ["rail-page-access"],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const modules = [...new Set(Object.values(RAIL_PAGE_MODULES))];
      const results = await Promise.all(modules.map(async (module) => {
        const { data, error } = await supabase.rpc("rail_can", { _module: module, _action: "view" });
        if (error) throw error;
        return [module, data === true] as const;
      }));
      return Object.fromEntries(results) as Record<string, boolean>;
    },
  });
}