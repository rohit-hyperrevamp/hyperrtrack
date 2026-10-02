import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Users, UserPlus, BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Button } from "@/components/ui/button";
import { Kpi } from "@/lib/rail-ui";
import { fetchCandidates, fetchOnboarding, QK } from "@/lib/recruitment";

export const Route = createFileRoute("/admin/hr/recruitment/dashboard")({
  head: () => ({ meta: [
    { title: "People — HyperTrack" },
    { name: "description", content: "Candidate intake, approvals and the active rail team." },
    { property: "og:title", content: "People — HyperTrack" },
    { property: "og:description", content: "Candidate intake, approvals and the active rail team." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PeopleDashboard,
});

function PeopleDashboard() {
  const candidates = useQuery({ queryKey: QK.candidates, queryFn: fetchCandidates });
  const approvals = useQuery({ queryKey: QK.onboarding, queryFn: fetchOnboarding });
  const rows = candidates.data ?? [];
  const inProgress = rows.filter((c) => ["new", "screening", "on_hold", "round_1", "round_2", "round_3", "hr_approved"].includes(c.stage)).length;
  const waiting = (approvals.data ?? []).filter((r) => r.status === "pending").length;
  return <div className="space-y-5">
    <RailTopbarSlot>
      <Button asChild variant="outline" className="h-10 shrink-0"><Link to="/admin/hr/recruitment/candidates">Candidates</Link></Button>
      <Button asChild variant="outline" className="h-10 shrink-0"><Link to="/admin/rail/people">Team</Link></Button>
      <Button asChild variant="outline" className="h-10 shrink-0"><Link to="/admin/hr/recruitment/onboarding">Approvals{waiting ? ` · ${waiting}` : ""}</Link></Button>
    </RailTopbarSlot>
    <PageHeader title="People" description="Candidates join the team after approval." icon={Users} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Kpi label="In progress" value={inProgress} to="/admin/hr/recruitment/candidates" />
      <Kpi label="Awaiting approval" value={waiting} to="/admin/hr/recruitment/onboarding" tone="warn" />
      <Kpi label="Onboarded" value={rows.filter((c) => c.stage === "onboarded").length} to="/admin/rail/people" tone="good" />
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <Link to="/admin/hr/recruitment/candidates" className="flex items-center gap-3 border-b border-border p-4 text-sm hover:text-brand"><UserPlus className="h-5 w-5 text-brand" /><span className="flex-1"><strong className="block">Candidates</strong><span className="text-muted-foreground">New and returning applicants</span></span><ArrowRight className="h-4 w-4" /></Link>
      <Link to="/admin/hr/recruitment/onboarding" className="flex items-center gap-3 border-b border-border p-4 text-sm hover:text-brand"><BadgeCheck className="h-5 w-5 text-brand" /><span className="flex-1"><strong className="block">Approvals</strong><span className="text-muted-foreground">Review submitted candidates</span></span><ArrowRight className="h-4 w-4" /></Link>
      <Link to="/admin/rail/people" className="flex items-center gap-3 border-b border-border p-4 text-sm hover:text-brand"><Users className="h-5 w-5 text-brand" /><span className="flex-1"><strong className="block">Team</strong><span className="text-muted-foreground">Approved staff and work access</span></span><ArrowRight className="h-4 w-4" /></Link>
    </div>
  </div>;
}