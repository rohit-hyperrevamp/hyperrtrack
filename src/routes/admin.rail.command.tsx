import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowUpRight, FileWarning, MessageSquareWarning, MapPin, TrainFront } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { RailDateStepper, RailTopbarSlot } from "@/components/RailTopbar";
import { db, inr, Kpi, num, pct, railHead, rows, today } from "@/lib/rail-ui";
import { cn } from "@/lib/utils";
import { RailBriefing } from "@/components/RailBriefing";
import { RailResourceGauges } from "@/components/RailResourceGauges";
import { RailAnimatedNumber } from "@/components/RailAnimatedValue";
import { useCurrentPermissions } from "@/lib/rbac";

export const Route = createFileRoute("/admin/rail/command")({
  head: () => railHead("Overview", "Live rail cleaning operations, depot performance, quality and exceptions."),
  component: CommandPage,
});

type K = Record<string, number>;
type Depot = { id: string; code: string; name: string; type: string; parent_id: string | null; total: number; released: number; late: number; state: string };

function CommandPage() {
  const { roleKey, isSuperAdmin } = useCurrentPermissions();
  if (roleKey === "rail_cleaner") return <Navigate to="/admin/rail/me" replace />;
  // Resource gauges are for the super admin and the leadership level just below.
  return <ManagementCommand leader={isSuperAdmin || ["project_head", "leadership", "vp_operations"].includes(roleKey ?? "")} />;
}

function ManagementCommand({ leader }: { leader: boolean }) {
  const [date, setDate] = useState(today());
  const { data: k } = useQuery({ queryKey: ["rail-kpis", date], refetchInterval: 30_000, queryFn: async () => {
    const { data, error } = await db.rpc("rail_kpis", { _date: date });
    if (error) throw error;
    return (data ?? {}) as K;
  } });
  const { data: depots = [] } = useQuery({
    queryKey: ["rail-depots-status", date], refetchInterval: 30_000,
    queryFn: async () => {
      const locs = await rows<{ id: string; code: string; name: string; type: string; parent_id: string | null }>(db.from("rail_locations").select("id,code,name,type,parent_id").is("deleted_at", null));
      const ev = await rows<{ location_id: string; status: string; planned_end: string | null }>(db.from("rail_events").select("location_id,status,planned_end").eq("event_date", date).is("deleted_at", null));
      const locById = new Map(locs.map((l) => [l.id, l]));
      const depotOf = (id: string) => { let l = locById.get(id); const seen = new Set<string>(); while (l && l.type !== "depot" && l.type !== "station" && !seen.has(l.id)) { seen.add(l.id); l = l.parent_id ? locById.get(l.parent_id) : undefined; } return l?.id; };
      return locs.filter((l) => l.type === "depot" || l.type === "station").map((d) => {
        const events = ev.filter((x) => depotOf(x.location_id) === d.id);
        const late = events.filter((x) => x.status !== "released" && x.planned_end && new Date(x.planned_end) < new Date()).length;
        return { ...d, total: events.length, released: events.filter((x) => x.status === "released").length, late, state: !events.length ? "idle" : late ? "red" : events.some((x) => x.status !== "released") ? "amber" : "green" } as Depot;
      }).sort((a, b) => b.late - a.late || b.total - a.total || a.name.localeCompare(b.name));
    },
  });
  const { data: trend = [] } = useQuery({
    queryKey: ["rail-seven-day-throughput", date], refetchInterval: 60_000,
    queryFn: async () => {
      const dates = Array.from({ length: 7 }, (_, i) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
      const events: { event_date: string; status: string }[] = [];
      for (let offset = 0; ; offset += 1000) {
        const page = await rows<{ event_date: string; status: string }>(db.from("rail_events").select("event_date,status").gte("event_date", dates[0]).lte("event_date", dates[6]).is("deleted_at", null).order("id").range(offset, offset + 999));
        events.push(...page);
        if (page.length < 1000) break;
      }
      return dates.map((day) => {
        const jobs = events.filter((e) => e.event_date === day);
        const cleaned = jobs.filter((e) => ["completed", "approved", "released"].includes(e.status)).length;
        const ratio = jobs.length ? cleaned / jobs.length : 0;
        return { date: day, total: jobs.length, cleaned, tone: ratio >= 0.9 ? "on-track" : ratio >= 0.6 ? "in-between" : "behind" };
      });
    },
  });
  const { data: feed = [] } = useQuery({
    queryKey: ["rail-exceptions"], refetchInterval: 30_000,
    queryFn: async () => {
      const [a, p, c] = await Promise.all([
        rows<{ id: string; message: string; severity: string; created_at: string; link: string | null }>(db.from("rail_alerts").select("id,message,severity,created_at,link").eq("status", "open").order("created_at", { ascending: false }).limit(10)),
        rows<{ id: string; rule_code: string; amount: number; reason: string | null; created_at: string }>(db.from("rail_penalties").select("id,rule_code,amount,reason,created_at").eq("status", "proposed").order("created_at", { ascending: false }).limit(10)),
        rows<{ id: string; description: string | null; created_at: string; sla_due: string | null }>(db.from("rail_complaints").select("id,description,created_at,sla_due").in("status", ["open", "assigned"]).order("created_at", { ascending: false }).limit(10)),
      ]);
      return [
        ...a.map((x) => ({ id: x.id, at: x.created_at, text: x.message, to: x.link ?? "/admin/rail/quality", kind: "Alert", urgency: /critical|high|urgent/i.test(x.severity) ? "urgent" : "normal" })),
        ...p.map((x) => ({ id: x.id, at: x.created_at, text: `${x.rule_code.replace(/_/g, " ")} ${inr(x.amount)} — ${x.reason ?? ""}`, to: "/admin/rail/quality", kind: "Penalty", urgency: "urgent" })),
        ...c.map((x) => ({ id: x.id, at: x.created_at, text: x.description ?? "Complaint", to: "/admin/rail/quality", kind: x.sla_due && new Date(x.sla_due) < new Date() ? "Complaint (late)" : "Complaint", urgency: x.sla_due && new Date(x.sla_due) < new Date() ? "urgent" : "normal" })),
      ].sort((x, y) => y.at.localeCompare(x.at));
    },
  });

  const maximum = Math.max(1, ...trend.map((d) => d.total));
  const hasTrend = trend.some((d) => d.total > 0);
  const statusTone = (state: string) => state === "green" ? "bg-brand" : state === "amber" || state === "red" ? "bg-danger" : "bg-muted-foreground";

  return (
    <div className="rail-command space-y-5 sm:space-y-6">
      <RailTopbarSlot><RailDateStepper value={date} onChange={setDate} /></RailTopbarSlot>
      <PageHeader title="Overview" description={date === today() ? "Today › Rail operations" : `${new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} › Rail operations`} />
      <RailBriefing date={date} />
      <div className="rail-command-kpis grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Jobs today" value={<RailAnimatedNumber value={num(k?.events_today)} />} to="/admin/rail/live" />
        <Kpi label="Coaches cleaned" value={<RailAnimatedNumber value={num(k?.coaches_cleaned)} />} to="/admin/rail/live" tone="good" />
        <Kpi label="On-time release" value={<RailAnimatedNumber value={pct(k?.on_time_release ?? 0, k?.released ?? 0)} />} hint={`${num(k?.released)} released`} to="/admin/rail/live" tone="good" />
        <Kpi label="Open alerts" value={<RailAnimatedNumber value={num(k?.open_alerts)} />} to="/admin/rail/quality" tone={k?.open_alerts ? "bad" : "default"} />
        <Kpi label="First-pass approval" value={<RailAnimatedNumber value={pct(k?.first_pass ?? 0, k?.reviewed ?? 0)} />} to="/admin/rail/quality" tone="good" />
        <Kpi label="Staff present / norm" value={<RailAnimatedNumber value={`${num(k?.staff_present)} / ${num(k?.staff_norm)}`} />} to="/admin/rail/people" tone={k?.staff_norm && (k?.staff_present ?? 0) < k.staff_norm ? "warn" : "default"} />
        <Kpi label="Penalties this month" value={<RailAnimatedNumber value={inr(k?.penalties_mtd)} />} to="/admin/rail/quality" tone={k?.penalties_mtd ? "bad" : "default"} />
        <Kpi label="Bill this month" value={<RailAnimatedNumber value={inr(k?.bill_mtd)} />} to="/admin/rail/billing" />
      </div>

      {leader && <RailResourceGauges />}
      <div className="rail-command-insights grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-lg border border-border/70 bg-card p-4 sm:p-5" aria-label="Seven-day cleaning activity">
          <div className="flex items-center justify-between gap-2"><h2 className="font-heading text-base font-semibold">Cleaning activity</h2><span className="text-xs text-muted-foreground">7 days to {new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
          {hasTrend ? <>
            <div className="mt-6 grid h-44 grid-cols-7 items-end gap-2 border-b border-border/70 pb-1 sm:gap-4">
              {trend.map((d) => <div key={d.date} className="flex h-full flex-col justify-end gap-0.5" title={`${d.date}: ${d.cleaned} cleaned of ${d.total} planned jobs (${d.total ? Math.round(d.cleaned / d.total * 100) : 0}%)`} aria-label={`${d.date}: ${d.cleaned} of ${d.total} planned jobs cleaned`}>
                <div key={`${d.date}-${d.total}-${d.cleaned}`} className="rail-chart-bar relative w-full overflow-hidden rounded-t-md bg-muted" style={{ height: `${Math.max(4, d.total / maximum * 100)}%` }}>
                  <div className="absolute inset-x-0 bottom-0" data-performance={d.tone} style={{ height: `${d.total ? d.cleaned / d.total * 100 : 0}%` }} />
                </div>
              </div>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2 text-center text-[11px] text-muted-foreground sm:gap-4">{trend.map((d) => <span key={d.date}>{new Date(`${d.date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short" })}</span>)}</div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-good" />≥90% cleaned</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand" />60–89%</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-danger" />Below 60%</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-muted ring-1 ring-border" />Not cleaned</span></div>
          </> : <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">No cleaning jobs in the last 7 days</div>}
        </section>
        <section className="min-w-0 rounded-lg border border-border/70 bg-card p-4 sm:p-5" aria-label="Depot operations">
          <div className="flex items-center justify-between gap-2"><h2 className="font-heading text-base font-semibold">Depot operations</h2><span className="text-xs text-muted-foreground">{depots.length} sites</span></div>
          {!depots.length ? <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">No depots set up</div> : <div className="mt-3 max-h-72 divide-y divide-border/70 overflow-y-auto">{depots.map((d) => <Link key={d.id} to="/admin/rail/live" search={{ depot: d.id, date }} className="group flex items-center gap-3 py-2.5 text-sm hover:text-brand">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-primary-foreground"><MapPin className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate font-medium">{d.name}</span><span className="text-xs text-muted-foreground">{d.code}{d.late ? ` · ${d.late} late` : ""}</span></span>
            <span className="shrink-0 text-right"><span className="block font-semibold tabular-nums">{d.released}/{d.total}</span><span className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground"><i className={cn("h-1.5 w-1.5 rounded-full", statusTone(d.state))} />Released</span></span>
          </Link>)}</div>}
        </section>
      </div>

      <section className="min-w-0 rounded-lg border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2"><h2 className="font-heading text-base font-semibold">Needs attention</h2>{feed.length > 0 && <span className="rounded-md bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">{feed.length}</span>}</div>
         {!feed.length ? <div className="flex min-h-20 items-center gap-2 text-sm text-muted-foreground"><TrainFront className="h-4 w-4 text-brand" />All clear</div> : <div className="mt-3 grid gap-2 lg:grid-cols-2">{feed.slice(0, 8).map((f) => {
          const Icon = f.kind === "Penalty" ? FileWarning : f.kind.startsWith("Complaint") ? MessageSquareWarning : AlertCircle;
           return <Link key={f.kind + f.id} to={f.to as never} aria-label={`${f.kind}: ${f.text}`} className="rail-attention-item group grid min-w-0 grid-cols-[36px_minmax(0,1fr)_16px] items-center gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-3 text-sm transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand">
            <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-primary-foreground", f.urgency === "urgent" ? "bg-danger" : "bg-brand")}><Icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate font-medium">{f.text}</span><span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", f.urgency === "urgent" ? "bg-danger-soft text-danger" : "bg-brand/10 text-brand")}>{f.urgency === "urgent" ? "Urgent" : "Review"}</span>{f.kind} · {new Date(f.at).toLocaleDateString("en-IN")}</span></span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>;
        })}</div>}
      </section>
    </div>
  );
}