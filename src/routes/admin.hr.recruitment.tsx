import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/hr/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — Radiant" },
      { name: "description", content: "Hiring pipeline, interviews and onboarding for Radiant Guard Services staff." },
      { property: "og:title", content: "Recruitment — Radiant" },
      { property: "og:description", content: "Hiring pipeline, interviews and onboarding for Radiant Guard Services staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <Outlet />,
});
