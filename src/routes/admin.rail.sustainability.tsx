import { confirmAction } from "@/components/ConfirmProvider";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logActivity } from "@/lib/activity-log";
import { db, Empty, Kpi, monthStart, num, parseCsv, railHead, rows } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail/sustainability")({
  head: () => railHead("Sustainability", "Water saved, recycled share, chemicals and carbon per coach, meter readings, ACWP imports and the monthly ESG report."),
  component: SustainPage,
});

type L = { id: string; event_coach_id: string | null; location_id: string | null; ledger_date: string; resource: string; qty: number; unit: string; metered: boolean; co2e_kg: number; method: string | null };

export function summarize(ledger: L[], baseline: number, chemL: number) {
  const coaches = new Set(ledger.map((l) => l.event_coach_id).filter(Boolean)).size;
  const sum = (f: (l: L) => boolean) => ledger.filter(f).reduce((s, l) => s + Number(l.qty), 0);
  const fresh = sum((l) => l.resource === "water_fresh");
  const recycled = sum((l) => l.resource === "water_recycled");
  const acwpCoaches = new Set(ledger.filter((l) => l.method === "acwp").map((l) => l.event_coach_id)).size;
  const acwpFresh = sum((l) => l.method === "acwp" && l.resource === "water_fresh");
  const saved = acwpCoaches * baseline - acwpFresh;
  const co2 = ledger.reduce((s, l) => s + Number(l.co2e_kg), 0);
  const meteredShare = ledger.length ? ledger.filter((l) => l.metered).length / ledger.length : 0;
  return { coaches, fresh, recycled, saved, co2, acwpCoaches, meteredShare, recycledPct: fresh + recycled ? recycled / (fresh + recycled) : 0, freshPerCoach: coaches ? fresh / coaches : 0, co2PerCoach: coaches ? co2 / coaches : 0, chemPerCoach: coaches ? chemL / coaches : 0 };
}

function SustainPage() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(monthStart().slice(0, 7));
  const m0 = `${month}-01`;
  const m1 = new Date(new Date(m0).getFullYear(), new Date(m0).getMonth() + 1, 0).toISOString().slice(0, 10);
  const { data } = useQuery({
    queryKey: ["rail-sus", month],
    queryFn: async () => {
      const [ledger, meters, readings, locs, chem, acwp, trend, baseline, leakPct] = await Promise.all([
        rows<L>(db.from("rail_resource_ledger").select("id,event_coach_id,location_id,ledger_date,resource,qty,unit,metered,co2e_kg,method").gte("ledger_date", m0).lte("ledger_date", m1).limit(20000)),
        rows<{ id: string; code: string; name: string; resource: string; unit: string; location_id: string }>(db.from("rail_meters").select("id,code,name,resource,unit,location_id")),
        rows<{ id: string; meter_id: string; reading: number; read_at: string }>(db.from("rail_meter_readings").select("id,meter_id,reading,read_at").order("read_at", { ascending: false }).limit(200)),
        rows<{ id: string; code: string; name: string; type: string; parent_id: string | null }>(db.from("rail_locations").select("id,code,name,type,parent_id")),
        rows<{ qty: number; inv_items: { unit: string } | null }>(db.from("rail_job_consumption").select("qty,inv_items(unit)").gte("created_at", m0).lte("created_at", m1 + "T23:59:59")),
        rows<{ id: string; run_date: string; coaches: number; kwh: number | null; fresh_litres: number | null; recycled_litres: number | null }>(db.from("rail_acwp_runs").select("id,run_date,coaches,kwh,fresh_litres,recycled_litres").gte("run_date", m0).lte("run_date", m1)),
        rows<L>(db.from("rail_resource_ledger").select("ledger_date,resource,qty,co2e_kg,event_coach_id,method,metered").gte("ledger_date", new Date(new Date(m0).getFullYear(), new Date(m0).getMonth() - 5, 1).toISOString().slice(0, 10)).limit(50000)),
        db.rpc("rail_setting", { _key: "baseline_manual_litres" }).then((r: { data: number | null }) => r.data ?? 1500),
        db.rpc("rail_setting", { _key: "leak_alert_pct" }).then((r: { data: number | null }) => r.data ?? 20),
      ]);
      return { ledger, meters, readings, locs, chem, acwp, trend, baseline: Number(baseline), leakPct: Number(leakPct) };
    },
  });
  const [reading, setReading] = useState({ meter_id: "", value: "" });

  if (!data) return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  const chemL = data.chem.filter((c) => c.inv_items?.unit === "L").reduce((s, c) => s + Number(c.qty), 0);
  const s = summarize(data.ledger, data.baseline, chemL);
  const depotOf = (id: string | null) => { let l = data.locs.find((x) => x.id === id); while (l && l.type !== "depot") l = data.locs.find((x) => x.id === l!.parent_id); return l; };
  const league = data.locs.filter((l) => l.type === "depot").map((d) => ({ d, ...summarize(data.ledger.filter((x) => depotOf(x.location_id)?.id === d.id), data.baseline, 0) })).sort((a, b) => a.freshPerCoach - b.freshPerCoach);
  const months = [...new Set(data.trend.map((t) => t.ledger_date.slice(0, 7)))].sort();
  const manualCoaches = s.coaches - s.acwpCoaches;

  async function addReading() {
    const m = data!.meters.find((x) => x.id === reading.meter_id);
    const { error } = await db.from("rail_meter_readings").insert({ meter_id: reading.meter_id, reading: Number(reading.value), location_id: m?.location_id });
    if (error) return toast.error(error.message);
    toast.success("Reading saved"); setReading({ meter_id: "", value: "" });
    void logActivity({ module: "Rail Sustainability", action: "meter_reading", entityType: "rail_meter_readings", details: { meter: m?.code } });
    qc.invalidateQueries({ queryKey: ["rail-sus"] });
  }

  async function importAcwp(file: File) {
    const recs = parseCsv(await file.text());
    const depot = data!.locs.find((l) => l.type === "depot");
    const ins = recs.map((r) => ({ run_date: r.date || r.run_date, coaches: Number(r.coaches || r.coach_count || 0), run_minutes: Number(r.run_minutes || r.minutes || 0) || null, kwh: Number(r.kwh || r.energy_kwh || 0) || null, fresh_litres: Number(r.fresh_litres || 0) || null, recycled_litres: Number(r.recycled_litres || 0) || null, location_id: data!.locs.find((l) => l.code === r.depot)?.id ?? depot?.id, source_file: file.name }))
      .filter((r) => r.run_date && r.coaches > 0);
    if (!ins.length) return toast.error("No valid rows. Expected columns: date, coaches, run_minutes, kwh, fresh_litres, recycled_litres, depot");
    if (!(await confirmAction({ title: `Import ${ins.length} wash runs?`, description: `From ${file.name}.`, confirmText: "Import" }))) return;
    const { error } = await db.from("rail_acwp_runs").insert(ins);
    if (error) return toast.error(error.message);
    toast.success(`${ins.length} runs imported`); qc.invalidateQueries({ queryKey: ["rail-sus"] });
  }

  async function esgReport() {
    const summary = { month, ...s, baseline: data!.baseline, league: league.map((l) => ({ depot: l.d.name, freshPerCoach: Math.round(l.freshPerCoach), coaches: l.coaches })) };
    await db.from("rail_esg_reports").insert({ month: m0, summary });
    void logActivity({ module: "Rail Sustainability", action: "esg_report", entityType: "rail_esg_reports", entityLabel: month });
    const w = window.open("", "_blank");
    if (!w) return toast.error("Allow pop-ups to open the report");
    w.document.write(`<html><head><title>ESG report ${month}</title><style>body{font-family:system-ui;padding:32px;max-width:800px;margin:auto}td,th{padding:6px 10px;border-bottom:1px solid #ddd;text-align:left}h1{margin-bottom:0}</style></head><body>
      <h1>Monthly Environmental Report</h1><div>${month} · Coach cleaning operations</div>
      <h2>Summary</h2><table>
      <tr><td>Coaches cleaned</td><td>${num(s.coaches)}</td></tr><tr><td>Water saved vs manual baseline</td><td>${num(s.saved)} L</td></tr>
      <tr><td>Recycled water share</td><td>${Math.round(s.recycledPct * 100)}%</td></tr><tr><td>Fresh water per coach</td><td>${num(s.freshPerCoach)} L</td></tr>
      <tr><td>Chemical per coach</td><td>${num(s.chemPerCoach, 2)} L</td></tr><tr><td>CO₂e per coach</td><td>${num(s.co2PerCoach, 2)} kg</td></tr><tr><td>Total CO₂e</td><td>${num(s.co2, 1)} kg</td></tr>
      <tr><td>Method mix</td><td>${s.acwpCoaches} auto wash plant · ${manualCoaches} manual</td></tr></table>
      <h2>Depot league</h2><table><tr><th>Depot</th><th>Coaches</th><th>Fresh L/coach</th></tr>${league.map((l) => `<tr><td>${l.d.name}</td><td>${l.coaches}</td><td>${num(l.freshPerCoach)}</td></tr>`).join("")}</table>
      <h2>Data quality statement</h2><p>${Math.round(s.meteredShare * 100)}% of resource lines are from meter readings; the remaining ${100 - Math.round(s.meteredShare * 100)}% are estimates from approved norms (manual wash ${data!.baseline} L/coach; auto wash 300 L/coach with 80% recycled). Estimated and metered figures are kept separate. Emission factors: grid electricity 0.7 kg/kWh (to be replaced with the client's chosen CEA value), diesel 2.68 kg/L.</p>
      <br/><br/><table><tr><td>Prepared by: ____________________</td><td>Railway sign-off: ____________________</td></tr></table>
      <script>window.print()</script></body></html>`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Resources" description="Water, chemicals and carbon per coach." actions={
        <div className="flex gap-2"><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" aria-label="Month" /><Button onClick={esgReport}><FileDown className="mr-2 h-4 w-4" />ESG report</Button></div>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Fresh water L / coach" value={num(s.freshPerCoach)} hint={`Norm ${num(data.baseline)} L`} tone={s.freshPerCoach > data.baseline ? "bad" : "good"} />
        <Kpi label="Chemical L / coach" value={num(s.chemPerCoach, 2)} />
        <Kpi label="Water saved L" value={num(s.saved)} hint={`${Math.round(s.recycledPct * 100)}% recycled`} />
        <Kpi label="kg CO₂e / coach" value={num(s.co2PerCoach, 2)} hint={`${num(s.coaches)} coaches`} />
      </div>
      {league.filter((l) => l.coaches && l.freshPerCoach > data.baseline * (1 + data.leakPct / 100)).map((l) => (
        <div key={l.d.id} className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">Possible leak at <b>{l.d.name}</b>: {num(l.freshPerCoach)} L per coach.</div>
      ))}

      <Tabs defaultValue="trend">
        <TabsList><TabsTrigger value="trend">Trend</TabsTrigger><TabsTrigger value="league">Depots</TabsTrigger><TabsTrigger value="meters">Meters</TabsTrigger><TabsTrigger value="acwp">Import</TabsTrigger></TabsList>
        <TabsContent value="trend">
          {!months.length ? <Empty title="No water or energy data yet" hint="Figures are logged automatically when cleaning jobs complete." /> : (
            <div className="rounded-lg border bg-card p-4"><div className="flex h-48 items-end gap-3">{months.map((mo) => {
              const t = summarize(data.trend.filter((x) => x.ledger_date.startsWith(mo)), data.baseline, 0);
              const max = Math.max(...months.map((m2) => summarize(data.trend.filter((x) => x.ledger_date.startsWith(m2)), data.baseline, 0).saved), 1);
              return <div key={mo} className="flex flex-1 flex-col items-center gap-1"><div className="text-xs tabular-nums">{num(t.saved / 1000, 1)} kL</div><div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(4, (t.saved / max) * 150)}px` }} /><div className="text-xs text-muted-foreground">{mo}</div></div>;
            })}</div><div className="mt-2 text-xs text-muted-foreground">Water saved per month</div></div>)}
        </TabsContent>
        <TabsContent value="league">
          <div className="divide-y rounded-lg border bg-card">{league.map((l, i) => <div key={l.d.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{i + 1}. {l.d.name}</div><div className="text-xs text-muted-foreground">{l.coaches} coaches · {num(l.saved)} L saved · {num(l.co2PerCoach, 2)} kg CO₂e/coach</div></div><div className="tabular-nums">{num(l.freshPerCoach)} L/coach</div></div>)}</div>
        </TabsContent>
        <TabsContent value="meters" className="space-y-3">
          <div className="grid gap-2 rounded-lg border bg-card p-3 md:grid-cols-[2fr_1fr_auto]">
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={reading.meter_id} onChange={(e) => setReading({ ...reading, meter_id: e.target.value })} aria-label="Meter"><option value="">Choose meter…</option>{data.meters.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}</select>
            <Input type="number" placeholder="Reading" value={reading.value} onChange={(e) => setReading({ ...reading, value: e.target.value })} />
            <Button onClick={addReading} disabled={!reading.meter_id || !reading.value}>Save reading</Button>
          </div>
          {!data.readings.length ? <Empty title="No readings yet" /> : <div className="divide-y rounded-lg border bg-card">{data.readings.map((r) => <div key={r.id} className="flex justify-between p-3 text-sm"><span>{data.meters.find((m) => m.id === r.meter_id)?.name}</span><span className="tabular-nums">{num(r.reading, 1)} · {new Date(r.read_at).toLocaleString()}</span></div>)}</div>}
        </TabsContent>
        <TabsContent value="acwp" className="space-y-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed bg-card p-6 text-sm"><Upload className="h-4 w-4" />Upload ACWP MIS report (CSV)<input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importAcwp(e.target.files[0])} /></label>
          {!data.acwp.length ? <Empty title="No ACWP runs imported this month" /> : <div className="divide-y rounded-lg border bg-card">{data.acwp.map((a) => <div key={a.id} className="flex justify-between p-3 text-sm"><span>{a.run_date}</span><span>{a.coaches} coaches · {num(a.kwh)} kWh · {num(a.fresh_litres)} L fresh · {num(a.recycled_litres)} L recycled</span></div>)}</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
