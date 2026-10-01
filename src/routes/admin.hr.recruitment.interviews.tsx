import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { InterviewResultDialog } from "@/components/recruitment/InterviewResultDialog";
import { Button } from "@/components/ui/button";
import { fetchMyInterviews, fmtDateTime, inr, openResume, PAGE_SIZE, QK, type RecInterview } from "@/lib/recruitment";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/hr/recruitment/interviews")({
  head: () => ({
    meta: [
      { title: "My Interviews — Radiant" },
      { name: "description", content: "Interviews assigned to you, with approve or reject decisions." },
      { property: "og:title", content: "My Interviews — Radiant" },
      { property: "og:description", content: "Interviews assigned to you, with approve or reject decisions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyInterviews,
});

function MyInterviews() {
  const q = useQuery({ queryKey: QK.myInterviews, queryFn: fetchMyInterviews });
  const userQ = useQuery({ queryKey: ["auth", "user-id"], queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null, staleTime: 300_000 });
  const [tab, setTab] = useState<"scheduled" | "done">("scheduled");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ i: RecInterview; name: string; d: "approved" | "rejected" } | null>(null);
  const rows = (q.data ?? []).filter((i) => tab === "scheduled" ? i.status === "scheduled" : i.status !== "scheduled");
  if (tab === "done") rows.reverse();
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Recruitment" title="My Interviews" description="Approve to move the candidate to the next round, or reject." icon={CalendarClock} />
      <div className="flex gap-2">
        {(["scheduled", "done"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => { setTab(t); setPage(0); }}>{t === "scheduled" ? "Upcoming" : "Completed"}</Button>
        ))}
      </div>
      <div className="space-y-2">
        {q.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!q.isLoading && pageRows.length === 0 && <p className="text-sm text-muted-foreground">Nothing here.</p>}
        {pageRows.map((i) => {
          const c = i.rec_candidates;
          return (
            <div key={i.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-sm">
                <div className="font-medium">{c?.full_name ?? "Candidate"} <span className="text-xs text-muted-foreground">{c?.code}</span></div>
                <div className="text-xs text-muted-foreground">Round {i.round_no}: {i.round_name} · {fmtDateTime(i.scheduled_at)} · {i.mode.replace("_", " ")}{i.location ? ` · ${i.location}` : ""}</div>
                {c && <div className="text-xs text-muted-foreground">{c.experience_years} yrs · expects {inr(c.expected_ctc)} · notice {c.notice_days} days</div>}
                {i.status !== "scheduled" && <div className={cn("mt-1 text-xs capitalize", i.status === "rejected" ? "text-destructive" : "text-primary")}>{i.status}{i.feedback ? ` — ${i.feedback}` : ""}</div>}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {c?.resume_path && <Button size="sm" variant="outline" onClick={() => openResume(c.resume_path).catch((e) => toast.error(e.message))}><FileText className="mr-1 h-4 w-4" />Resume</Button>}
                {i.status === "scheduled" && (
                  <>
                    <Button size="sm" onClick={() => setResult({ i, name: c?.full_name ?? "Candidate", d: "approved" })}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => setResult({ i, name: c?.full_name ?? "Candidate", d: "rejected" })}>Reject</Button>
                  </>
                )}
                {i.status === "scheduled" && i.created_by === userQ.data && <span className="self-center rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">Created by you</span>}
              </div>
            </div>
          );
        })}
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-muted-foreground">Page {page + 1} of {pages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
      {result && <InterviewResultDialog interview={result.i} candidateName={result.name} decision={result.d} onClose={() => setResult(null)} />}
    </div>
  );
}
