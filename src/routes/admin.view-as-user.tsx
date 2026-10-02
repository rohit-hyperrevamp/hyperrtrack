import { createFileRoute } from "@tanstack/react-router";
import { ViewAsUserButton } from "@/components/ImpersonationControls";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/view-as-user")({
  head: () => ({
    meta: [
      { title: "View as User — HyperTrack" },
      { name: "description", content: "Open an employee's view of HyperTrack." },
      { property: "og:title", content: "View as User — HyperTrack" },
      { property: "og:description", content: "Open an employee's view of HyperTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ViewAsUserPage,
});

function ViewAsUserPage() {
  const { user } = useAuth();
  if (user?.role !== "super_admin") return <p className="p-4 text-muted-foreground">This page is only available to super admins.</p>;
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-4">
      <h1 className="text-2xl font-semibold">View as User</h1>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <ViewAsUserButton initialOpen className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-primary-foreground" />
        <span className="min-w-0 text-sm text-muted-foreground">Choose an employee to see their view.</span>
      </div>
    </div>
  );
}