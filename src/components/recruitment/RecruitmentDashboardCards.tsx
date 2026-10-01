import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarClock, UsersRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyInterviews, fmtDateTime, QK } from "@/lib/recruitment";

type RecruitmentSummary = {
  pipeline: number;
  blue_collar: number;
  white_collar: number;
  billable: number;
  non_billable: number;
  upcoming: Array<{
    id: string;
    candidate_id: string;
    candidate_code: string;
    candidate_name: string;
    round_no: number;
    round_name: string;
    scheduled_at: string;
    workforce_class: string | null;
    billing_class: string | null;
  }>;
};

export function MyUpcomingInterviewsCard() {
  const query = useQuery({ queryKey: QK.myInterviews, queryFn: fetchMyInterviews });
  const upcoming = (query.data ?? []).filter((item) => item.status === "scheduled" && new Date(item.scheduled_at) >= new Date()).slice(0, 4);
  if (!query.isLoading && upcoming.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/80">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold"><CalendarClock className="h-4 w-4 text-accent" />My upcoming interviews</div>
        <Link to="/admin/hr/recruitment/interviews" className="text-xs font-semibold text-accent hover:underline">View all</Link>
      </div>
      <div className="divide-y divide-border/60">
        {query.isLoading ? <p className="p-4 text-xs text-muted-foreground">Loading…</p> : upcoming.map((item) => (
          <Link key={item.id} to="/admin/hr/recruitment/candidates/$recId" params={{ recId: item.candidate_id }} className="block px-4 py-3 transition hover:bg-accent/5">
            <div className="truncate text-sm font-semibold">{item.rec_candidates?.full_name ?? "Candidate"}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Round {item.round_no} · {fmtDateTime(item.scheduled_at)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function RecruitmentLeadershipPanel() {
  const query = useQuery({
    queryKey: ["rec", "leadership-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("recruitment_leadership_summary" as never);
      if (error) throw error;
      return data as unknown as RecruitmentSummary;
    },
  });
  const data = query.data;
  const stats = [
    ["Pipeline", data?.pipeline ?? 0],
    ["Blue collar", data?.blue_collar ?? 0],
    ["White collar", data?.white_collar ?? 0],
    ["Billable", data?.billable ?? 0],
    ["Non-billable", data?.non_billable ?? 0],
  ] as const;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/60 bg-card p-3">
            <div className="text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
            <div className="mt-1 font-display text-xl font-bold">{query.isLoading ? "—" : value.toLocaleString("en-IN")}</div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 text-sm font-semibold"><UsersRound className="h-4 w-4 text-accent" />Upcoming interviews · 7 days</div>
        {query.error ? <p className="p-4 text-sm text-destructive">Recruitment summary is not available for this role.</p> : !query.isLoading && !data?.upcoming.length ? <p className="p-4 text-sm text-muted-foreground">No interviews scheduled.</p> : (
          <div className="divide-y divide-border/60">
            {(data?.upcoming ?? []).slice(0, 8).map((item) => (
              <Link key={item.id} to="/admin/hr/recruitment/candidates/$recId" params={{ recId: item.candidate_id }} className="flex flex-col gap-1 px-4 py-3 transition hover:bg-accent/5 sm:flex-row sm:items-center sm:justify-between">
                <div><span className="font-semibold">{item.candidate_name}</span> <span className="text-xs text-muted-foreground">{item.candidate_code} · Round {item.round_no}</span></div>
                <div className="text-xs text-muted-foreground">{fmtDateTime(item.scheduled_at)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}