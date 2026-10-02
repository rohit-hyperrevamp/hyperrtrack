import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { db } from "@/lib/rail-ui";

type B = Record<string, number>;
const ITEMS: { key: string; one: string; many: string; to: string; urgent?: boolean }[] = [
  { key: "late_jobs", one: "train job running late", many: "train jobs running late", to: "/admin/rail/live", urgent: true },
  { key: "short_depots", one: "depot short of staff", many: "depots short of staff", to: "/admin/rail/people", urgent: true },
  { key: "complaints_late", one: "complaint past its deadline", many: "complaints past their deadline", to: "/admin/rail/quality", urgent: true },
  { key: "unassigned_tasks", one: "task nobody is assigned to", many: "tasks nobody is assigned to", to: "/admin/rail/live" },
  { key: "waiting_accept", one: "task waiting for the cleaner to accept", many: "tasks waiting for cleaners to accept", to: "/admin/rail/live" },
  { key: "penalties_proposed", one: "penalty to review", many: "penalties to review", to: "/admin/rail/quality" },
  { key: "bills_to_sign", one: "bill awaiting sign-off", many: "bills awaiting sign-off", to: "/admin/rail/billing" },
  { key: "purchase_waiting", one: "purchase request to approve", many: "purchase requests to approve", to: "/admin/rail/supplies" },
  { key: "stock_expiring", one: "stock batch expiring in 15 days", many: "stock batches expiring in 15 days", to: "/admin/rail/supplies" },
];

/** Morning briefing: plain-language counts, each one tap from the screen that fixes it. */
export function RailBriefing({ date }: { date: string }) {
  const { data } = useQuery({
    queryKey: ["rail-briefing", date], refetchInterval: 60_000,
    queryFn: async () => { const { data, error } = await db.rpc("rail_briefing", { _date: date }); if (error) throw error; return (data ?? {}) as B; },
  });
  const items = ITEMS.filter((i) => Number(data?.[i.key] ?? 0) > 0);
  return (
    <section className="rounded-lg border border-border/70 bg-card p-4 sm:p-5" aria-label="Briefing">
      <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-primary-foreground"><Sparkles className="h-4 w-4" /></span><h2 className="font-heading text-base font-semibold">Today's briefing</h2></div>
      {!data ? <div className="mt-3 h-10 animate-pulse rounded bg-muted" /> : !items.length ? <p className="mt-3 text-sm text-muted-foreground">Nothing needs you right now.</p> : (
        <div className="mt-3 flex flex-wrap gap-2">{items.map((i) => {
          const n = Number(data[i.key]);
          return <Link key={i.key} to={i.to as never} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${i.urgent ? "bg-danger-soft text-danger hover:bg-danger/15" : "bg-brand/10 text-brand hover:bg-brand/15"}`}>{n} {n === 1 ? i.one : i.many} →</Link>;
        })}</div>
      )}
    </section>
  );
}
