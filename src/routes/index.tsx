import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { readStoredAuthUser, useAuth } from "@/lib/auth";
import { useCurrentPermissions } from "@/lib/rbac";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "HyperTrack — Rail Operations" },
    { name: "description", content: "Rail cleaning operations, quality and workforce workspace." },
    { property: "og:title", content: "HyperTrack — Rail Operations" },
    { property: "og:description", content: "Rail cleaning operations, quality and workforce workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();
  const {
    can,
    isLoading,
    isSuperAdmin,
    roleKey,
  } = useCurrentPermissions();

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    // Login persists the verified role before navigating here. Check it before
    // waiting for the independently-hydrated RBAC query so a stale frontline
    // redirect can never be queued for a super administrator.
    if (user.role === "super_admin" || readStoredAuthUser()?.role === "super_admin") {
      navigate({ to: "/admin/rail/command", replace: true });
      return;
    }
    if (isLoading) return;

    // Role-based dashboard landing — derived from RBAC role helpers,
    // not from hardcoded role-key sets.
    if (isSuperAdmin) {
      navigate({ to: "/admin/rail/command", replace: true });
      return;
    }
    if (roleKey?.startsWith("rail_")) {
      navigate({ to: roleKey === "rail_cleaner" ? "/admin/rail/me" : roleKey === "rail_railway_checker" ? "/admin/rail/checker" : "/admin/rail/command", replace: true });
      return;
    }
    if (can("rail_ops")) {
      navigate({ to: "/admin/rail/command", replace: true });
      return;
    }
    navigate({ to: "/admin/dashboard", replace: true });
  }, [user, isReady, isLoading, isSuperAdmin, roleKey, can, navigate]);

  return <div className="min-h-screen bg-background" />;
}
