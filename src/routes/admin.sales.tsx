import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/sales")({
  head: () => ({
    meta: [
      { title: "Sales & Marketing — Radiant" },
      { name: "description", content: "Prospect pipeline, quotes and sales funnel for Radiant Guard Services." },
      { property: "og:title", content: "Sales & Marketing — Radiant" },
      { property: "og:description", content: "Prospect pipeline, quotes and sales funnel for Radiant Guard Services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <Outlet />,
});
