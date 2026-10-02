import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Droplets } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { db, Empty, inr, Kpi, num, pct, railHead, rows, today } from "@/lib/rail-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/rail/command")({
  head: () => railHead("Command Centre", "Live view of every depot: jobs, coaches cleaned, on-time release, quality, staff, penalties, billing and water saved."),
  component: CommandPage,
});

type K = Record<string, number>;

function CommandPage() {
  const { data: k } = useQuery({ queryKey: ["rail-kpis"], refetchInterval: 30_000, queryFn: async () => ((await db.rpc("rail_kpis", { _date: today() })).data ?? {}) as K });
  const { data: depots = [] } = useQuery({
    queryKey: ["rail-depots-status"], refetchInterval: 30_000,
    queryFn: async () => {
      const locs = await rows<{ id: string; code: string; name: string; type: string; parent_id: string | null; latitude: number | null; longitude: number | null }>(db.from("rail_locations").select("id,code,name,type,parent_id,latitude,longitude"));
      const ev = await rows<{ location_id: string; status: string; planned_end: string }>(db.from("rail_events").select("location_id,status,planned_end").eq("event_date", today()));
      const depotOf = (id: string) => { let l = locs.find((x) => x.id === id); while (l && l.type !== "depot" && l.type !== "station") l = locs.find((x) => x.id === l!.parent_id); return l?.id; };
      return locs.filter((l) => l.type === "depot" || l.type === "station").map((d) => {
        const e = ev.filter((x) => depotOf(x.location_id) === d.id);
        const late = e.filter((x) => x.status !== "released" && new Date(x.planned_end) < new Date()).length;
        return { ...d, total: e.length, released: e.filter((x) => x.status === "released").length, late, state: !e.length ? "idle" : late ? "red" : e.some((x) => x.status !== "released") ? "amber" : "green" };
      });
    },
  });
  const { data: feed = [] } = useQuery({
    queryKey: ["rail-exceptions"], refetchInterval: 30_000,
    queryFn: async () => {
      const [a, p, c] = await Promise.all([
        rows<{ id: string; message: string; created_at: string; link: string | null }>(db.from("rail_alerts").select("id,message,created_at,link").eq("status", "open").order("created_at", { ascending: false }).limit(10)),
        rows<{ id: string; rule_code: string; amount: number; reason: string | null; created_at: string }>(db.from("rail_penalties").select("id,rule_code,amount,reason,created_at").eq("status", "proposed").order("created_at", { ascending: false }).limit(10)),
        rows<{ id: string; description: string | null; created_at: string; sla_due: string | null }>(db.from("rail_complaints").select("id,description,created_at,sla_due").in("status", ["open", "assigned"]).order("created_at", { ascending: false }).limit(10)),
      ]);
      return [
        ...a.map((x) => ({ id: x.id, at: x.created_at, text: x.message, to: x.link ?? "/admin/rail/quality", kind: "Alert" })),
        ...p.map((x) => ({ id: x.id, at: x.created_at, text: `${x.rule_code.replace(/_/g, " ")} ${inr(x.amount)} — ${x.reason ?? ""}`, to: "/admin/rail/quality", kind: "Penalty" })),
        ...c.map((x) => ({ id: x.id, at: x.created_at, text: x.description ?? "Complaint", to: "/admin/rail/quality", kind: x.sla_due && new Date(x.sla_due) < new Date() ? "Complaint (late)" : "Complaint" })),
      ].sort((x, y) => y.at.localeCompare(x.at));
    },
  });

  // Savings ticker: count up to the month's litres saved
  const target = Math.max(0, k?.water_saved_mtd_l ?? 0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const from = 0;
    const step = (t: number) => { const p = Math.min(1, (t - start) / 1500); setShown(Math.round(from + (target - from) * p)); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const lat = depots.filter((d) => d.latitude && d.longitude);
  const [minLat, maxLat, minLng, maxLng] = lat.length ? [Math.min(...lat.map((d) => d.latitude!)), Math.max(...lat.map((d) => d.latitude!)), Math.min(...lat.map((d) => d.longitude!)), Math.max(...lat.map((d) => d.longitude!))] : [0, 1, 0, 1];

  return (
    <div className="space-y-6">
      <PageHeader title="Command Centre" description="Live operations across depots, coaches and quality." />
      <div className="grid gap-4 rounded-lg border border-border/70 bg-card p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
        <div className="flex min-w-0 items-center gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent"><Droplets className="h-5 w-5" /></span><div className="min-w-0"><div className="text-sm text-muted-foreground">Water saved this month</div><div className="mt-1 font-heading text-3xl font-semibold tabular-nums">{num(shown)} <span className="text-base text-muted-foreground">L</span></div></div></div>
        <div className="text-sm text-muted-foreground sm:text-right">{num(k?.coaches_mtd)} coaches · {num((k?.co2e_mtd_kg ?? 0) / Math.max(1, k?.coaches_mtd ?? 0), 2)} kg CO₂e/coach</div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Jobs today" value={k?.events_today ?? 0} to="/admin/rail/live" />
        <Kpi label="Coaches cleaned" value={k?.coaches_cleaned ?? 0} to="/admin/rail/live" />
        <Kpi label="On-time release" value={pct(k?.on_time_release ?? 0, k?.released ?? 0)} hint={`${k?.released ?? 0} released`} to="/admin/rail/live" />
        <Kpi label="First-pass approval" value={pct(k?.first_pass ?? 0, k?.reviewed ?? 0)} to="/admin/rail/quality" tone="good" />
        <Kpi label="Rework" value={k?.rework ?? 0} to="/admin/rail/quality" tone={k?.rework ? "warn" : "default"} />
        <Kpi label="Staff present / norm" value={`${k?.staff_present ?? 0} / ${k?.staff_norm ?? 0}`} to="/admin/rail/people" tone={(k?.staff_present ?? 0) < (k?.staff_norm ?? 0) ? "bad" : "good"} />
        <Kpi label="Penalties MTD" value={inr(k?.penalties_mtd)} to="/admin/rail/quality" tone={k?.penalties_mtd ? "bad" : "default"} />
        <Kpi label="Bill MTD" value={inr(k?.bill_mtd)} to="/admin/rail/billing" />
        <Kpi label="Open alerts" value={k?.open_alerts ?? 0} to="/admin/rail/quality" />
        <Kpi label="Open complaints" value={k?.open_complaints ?? 0} to="/admin/rail/quality" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-lg border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Depots</h2>
          {!depots.length ? <Empty title="No depots set up" /> : (
            <>
              {lat.length > 1 && (
                <div className="relative mb-4 h-56 rounded-lg bg-muted/40">
                  {lat.map((d) => (
                    <div key={d.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${10 + ((d.longitude! - minLng) / Math.max(0.01, maxLng - minLng)) * 80}%`, top: `${90 - ((d.latitude! - minLat) / Math.max(0.01, maxLat - minLat)) * 80}%` }}>
                      <div className={cn("mx-auto h-4 w-4 rounded-full ring-4", d.state === "green" ? "bg-emerald-500 ring-emerald-500/20" : d.state === "amber" ? "bg-amber-500 ring-amber-500/20" : d.state === "red" ? "bg-destructive ring-destructive/20" : "bg-muted-foreground ring-muted")} />
                      <div className="mt-1 whitespace-nowrap text-xs">{d.code}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="divide-y">{depots.map((d) => (
                <Link key={d.id} to="/admin/rail/live" className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 text-sm hover:text-accent">
                  <span className="flex min-w-0 items-center gap-2"><span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", d.state === "green" ? "bg-success" : d.state === "amber" ? "bg-warning" : d.state === "red" ? "bg-destructive" : "bg-muted-foreground")} /><span className="truncate">{d.name}</span></span>
                  <span className="shrink-0 text-right text-xs text-muted-foreground">{d.released}/{d.total} released{d.late ? ` · ${d.late} late` : ""}</span>
                </Link>))}</div>
            </>
          )}
        </section>
        <section className="min-w-0 rounded-lg border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Exceptions</h2>
          {!feed.length ? <Empty title="All clear" hint="Late jobs, penalties, complaints and alerts show here." /> : (
            <div className="divide-y">{feed.slice(0, 15).map((f) => (
              <Link key={f.kind + f.id} to={f.to as never} className="block py-3 text-sm hover:text-accent"><span className="mr-2 text-xs font-medium text-muted-foreground">{f.kind}</span>{f.text}<div className="mt-1 text-xs text-muted-foreground">{new Date(f.at).toLocaleString()}</div></Link>))}</div>
          )}
        </section>
      </div>
    </div>
  );
}
