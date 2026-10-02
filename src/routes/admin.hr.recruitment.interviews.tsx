import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ChevronRight, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { InterviewReviewSheet } from "@/components/recruitment/InterviewReviewSheet";
import { Button } from "@/components/ui/button";
import { fetchMyInterviews, fmtDateTime, inr, PAGE_SIZE, QK, type RecCandidate, type RecInterview } from "@/lib/recruitment";
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
  const [review, setReview] = useState<{ i: RecInterview; c: RecCandidate | null } | null>(null);
  const rows = (q.data ?? []).filter((i) => tab === "scheduled" ? i.status === "scheduled" : i.status !== "scheduled");
  if (tab === "done") rows.reverse();
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Recruitment" title="My Interviews" description="Open a candidate to view their profile and resume, and give your feedback." icon={CalendarClock} />
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
            <div key={i.id} role="button" tabIndex={0} onClick={() => setReview({ i, c })} onKeyDown={(e) => { if (e.key === "Enter") setReview({ i, c }); }} className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-accent/50 hover:bg-accent/5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-sm">
                <div className="font-medium">{c?.full_name ?? "Candidate"} <span className="text-xs text-muted-foreground">{c?.code}</span></div>
                {c?.rec_openings?.title && <div className="text-xs font-medium text-accent">{c.rec_openings.title}</div>}
                <div className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent"><CalendarClock className="h-3.5 w-3.5" />{fmtDateTime(i.scheduled_at)}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Round {i.round_no}: {i.round_name} · {i.mode.replace("_", " ")}{i.location ? ` · ${i.location}` : ""}</div>
                {c && <div className="text-xs text-muted-foreground">{c.experience_years} yrs · expects {inr(c.expected_ctc)} · notice {c.notice_days} days</div>}
                {i.status !== "scheduled" && <div className={cn("mt-1 text-xs capitalize", i.status === "rejected" ? "text-destructive" : "text-primary")}>{i.status}{i.feedback ? ` — ${i.feedback}` : ""}</div>}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button size="sm" variant={i.status === "scheduled" ? "default" : "outline"} onClick={(e) => { e.stopPropagation(); setReview({ i, c }); }}>
                  <MessageSquareText className="mr-1 h-4 w-4" />{i.status === "scheduled" ? "Review & give feedback" : "View feedback"}<ChevronRight className="ml-1 h-4 w-4" />
                </Button>
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
      {review && <InterviewReviewSheet interview={review.i} candidate={review.c} onClose={() => setReview(null)} />}
    </div>
  );
}
