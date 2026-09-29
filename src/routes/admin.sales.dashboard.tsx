import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageStat } from "@/components/PageHeader";
import { fetchLeads, fetchQuotes, fetchStages, inr, leadProbability, QK, stageTone } from "@/lib/crm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/sales/dashboard")({
  head: () => ({
    meta: [
      { title: "Sales Dashboard — Radiant" },
      { name: "description", content: "Sales funnel health: stage counts, pipeline value, conversions and follow-ups." },
      { property: "og:title", content: "Sales Dashboard — Radiant" },
      { property: "og:description", content: "Sales funnel health: stage counts, pipeline value, conversions and follow-ups." },
    ],
  }),
  component: SalesDashboard,
});

function monthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function SalesDashboard() {
  const stagesQ = useQuery({ queryKey: QK.stages, queryFn: fetchStages });
  const leadsQ = useQuery({ queryKey: QK.leads, queryFn: fetchLeads });
  const quotesQ = useQuery({ queryKey: QK.quotes, queryFn: () => fetchQuotes() });
  const stages = stagesQ.data ?? [];
  const leads = leadsQ.data ?? [];
  const quotes = quotesQ.data ?? [];

  const stats = useMemo(() => {
    const byStage = new Map<string, { count: number; value: number }>();
    for (const s of stages) byStage.set(s.key, { count: 0, value: 0 });
    const stageOf = new Map(stages.map((s) => [s.key, s]));
    let open = 0, openValue = 0, weighted = 0, wonMonth = 0, lostMonth = 0, wonValueMonth = 0;
    const ms = monthStart();
    const today = new Date();
    const closing = { d30: 0, d60: 0, d90: 0 };
    const bySource = new Map<string, number>();
    const byOwner = new Map<string, { count: number; value: number }>();
    const overdue = [] as typeof leads;
    for (const l of leads) {
      const st = stageOf.get(l.stage_key);
      const b = byStage.get(l.stage_key);
      if (b) { b.count++; b.value += Number(l.estimated_monthly_value || 0); }
      const isOpen = st ? !st.is_won && !st.is_lost : true;
      if (isOpen) {
        open++;
        openValue += Number(l.estimated_monthly_value || 0);
        weighted += Number(l.estimated_monthly_value || 0) * leadProbability(l, stages) / 100;
        if (l.expected_close_date) {
          const days = (new Date(l.expected_close_date).getTime() - today.getTime()) / 86400000;
          if (days >= 0 && days <= 30) closing.d30++;
          if (days >= 0 && days <= 60) closing.d60++;
          if (days >= 0 && days <= 90) closing.d90++;
        }
        if (l.next_follow_up_at && new Date(l.next_follow_up_at) < today) overdue.push(l);
      }
      if (st?.is_won && l.stage_changed_at >= ms) { wonMonth++; wonValueMonth += Number(l.estimated_monthly_value || 0); }
      if (st?.is_lost && l.stage_changed_at >= ms) lostMonth++;
      const src = l.source || "Unknown";
      bySource.set(src, (bySource.get(src) ?? 0) + 1);
      const own = l.owner_name || "Unassigned";
      const o = byOwner.get(own) ?? { count: 0, value: 0 };
      o.count++; o.value += Number(l.estimated_monthly_value || 0);
      byOwner.set(own, o);
    }
    // Funnel conversion: share of leads that reached at least each stage (open funnel stages only).
    const funnel = stages.filter((s) => !s.is_lost && s.key !== "on_hold");
    const reached = funnel.map((s) => ({
      stage: s,
      count: leads.filter((l) => {
        const ls = stageOf.get(l.stage_key);
        return ls && !ls.is_lost && ls.key !== "on_hold" && ls.sort_order >= s.sort_order;
      }).length,
    }));
    const winRate = wonMonth + lostMonth > 0 ? Math.round((wonMonth / (wonMonth + lostMonth)) * 100) : 0;
    return { byStage, open, openValue, weighted, wonMonth, lostMonth, wonValueMonth, closing, bySource, byOwner, overdue, reached, winRate };
  }, [stages, leads]);

  const quoteStats = useMemo(() => {
    const c = { draft: 0, sent: 0, signed: 0, rejected: 0 };
    for (const q of quotes) c[q.status]++;
    return c;
  }, [quotes]);

  const to = "/admin/sales/prospects";
  const maxReached = Math.max(1, ...stats.reached.map((r) => r.count));

  return (
    <div>
      <PageHeader
        eyebrow="Sales & Marketing"
        title="Sales Dashboard"
        description="Your sales funnel from first contact to signed contract. Tap any tile to open the matching prospects."
        crumbs={[{ label: "Sales & Marketing" }, { label: "Dashboard" }]}
        actions={<Link to={to} search={{}} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Open pipeline</Link>}
        kpis={
          <>
            <PageStat label="Open prospects" value={stats.open} tone="accent" />
            <PageStat label="Pipeline / month" value={inr(stats.openValue)} />
            <PageStat label="Weighted / month" value={inr(stats.weighted)} />
            <PageStat label="Won this month" value={stats.wonMonth} tone="success" sub={inr(stats.wonValueMonth)} />
            <PageStat label="Lost this month" value={stats.lostMonth} tone="destructive" />
            <PageStat label="Win rate (month)" value={`${stats.winRate}%`} />
          </>
        }
      />

      <div className="mb-4 rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Stages</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {stages.map((s) => {
            const b = stats.byStage.get(s.key) ?? { count: 0, value: 0 };
            return (
              <Link key={s.key} to={to} search={{ stage: s.key }} className="rounded-xl border border-border p-3 transition-colors hover:border-primary/50 hover:bg-muted/40">
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium", stageTone(s))}>{s.label}</span>
                <div className="mt-2 text-xl font-semibold tabular-nums">{b.count}</div>
                <div className="text-xs text-muted-foreground">{inr(b.value)} / mo</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Funnel conversion</h2>
          <div className="space-y-2">
            {stats.reached.map((r, i) => {
              const prev = i > 0 ? stats.reached[i - 1].count : r.count;
              const conv = prev > 0 ? Math.round((r.count / prev) * 100) : 0;
              return (
                <Link key={r.stage.key} to={to} search={{ stage: r.stage.key }} className="block">
                  <div className="flex items-center justify-between text-xs">
                    <span>{r.stage.label}</span>
                    <span className="tabular-nums text-muted-foreground">{r.count}{i > 0 ? ` · ${conv}% from previous` : ""}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${(r.count / maxReached) * 100}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Expected closures &amp; quotes</h2>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Next 30 days" value={stats.closing.d30} />
            <Stat label="Next 60 days" value={stats.closing.d60} />
            <Stat label="Next 90 days" value={stats.closing.d90} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(["draft", "sent", "signed", "rejected"] as const).map((k) => (
              <Link key={k} to="/admin/sales/quotes" search={{ status: k }} className="rounded-xl border border-border p-3 hover:bg-muted/40">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Quotes {k}</div>
                <div className="text-lg font-semibold tabular-nums">{quoteStats[k]}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">By source</h2>
          <Breakdown rows={[...stats.bySource.entries()].map(([k, v]) => ({ label: k, value: v }))} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">By owner</h2>
          <Breakdown rows={[...stats.byOwner.entries()].map(([k, v]) => ({ label: k, value: v.count, sub: inr(v.value) }))} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Overdue follow-ups ({stats.overdue.length})</h2>
          <Link to={to} search={{ overdue: true }} className="text-xs text-primary">View all</Link>
        </div>
        {stats.overdue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overdue follow-ups.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.overdue.slice(0, 10).map((l) => (
              <li key={l.id}>
                <Link to="/admin/sales/prospects/$leadId" params={{ leadId: l.id }} className="flex items-center justify-between py-2 text-sm hover:text-primary">
                  <span><span className="mr-2 font-mono text-xs text-muted-foreground">{l.lead_code}</span>{l.company_name}</span>
                  <span className="text-xs text-destructive">{new Date(l.next_follow_up_at!).toLocaleDateString("en-IN")}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {(leadsQ.error || stagesQ.error) && (
        <p className="mt-4 text-sm text-destructive">{String((leadsQ.error || stagesQ.error) as Error)}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Breakdown({ rows }: { rows: { label: string; value: number; sub?: string }[] }) {
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...sorted.map((r) => r.value));
  if (sorted.length === 0) return <p className="text-sm text-muted-foreground">No prospects yet.</p>;
  return (
    <div className="space-y-2">
      {sorted.slice(0, 8).map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-xs"><span>{r.label}</span><span className="tabular-nums text-muted-foreground">{r.value}{r.sub ? ` · ${r.sub}` : ""}</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary/70" style={{ width: `${(r.value / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
