import { createFileRoute, redirect } from "@tanstack/react-router";

// People opens straight on Candidates; the Candidates ↔ Employees switch lives on each page.
export const Route = createFileRoute("/admin/hr/recruitment/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/hr/recruitment/candidates", replace: true });
  },
});
