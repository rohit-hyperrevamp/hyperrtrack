import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/hr/recruitment/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/hr/recruitment/dashboard", replace: true });
  },
});
