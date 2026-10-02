import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { confirmAction } from "@/components/ConfirmProvider";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { RailEvidenceReview } from "@/components/RailEvidenceReview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logActivity } from "@/lib/activity-log";
import { downloadCsv } from "@/lib/csv-export";
import { db, Empty, inr, Kpi, railHead, rows, StatusPill, today } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail/quality")({
  head: () => railHead("Quality", "Review cleaning task photos, inspections, penalties, complaints and depot quality."),
  component: QualityPage,
});

async function setField(table: string, id: string, patch: Record<string, unknown>, msg: string) {
  const { error } = await db.from(table).update(patch).eq("id", id);
  if (error) { toast.error(error.message); return false; }
  toast.success(msg);
  void logActivity({ module: "Rail Quality", action: "update", entityType: table, entityId: id, details: patch });
  return true;
}

function QualityPage() {
  const qc = useQueryClient();
  const [depot, setDepot] = useState("");
  const inv = () => qc.invalidateQueries({ queryKey: ["rail-q"] });
  const { data: rawData } = useQuery({
    queryKey: ["rail-q"],
    queryFn: async () => {
      const [insp, pen, comp, alerts, coaches, locs, ec] = await Promise.all([
        rows<{ id: string; result: string; remarks: string | null; created_at: string; inspector_role: string | null; location_id: string | null }>(db.from("rail_inspections").select("id,result,remarks,created_at,inspector_role,location_id").order("created_at", { ascending: false }).limit(300)),
        rows<{ id: string; rule_code: string; amount: number; qty: number; reason: string | null; status: string; penalty_date: string; location_id: string | null }>(db.from("rail_penalties").select("id,rule_code,amount,qty,reason,status,penalty_date,location_id").order("penalty_date", { ascending: false }).limit(300)),
        rows<{ id: string; ref_no: string | null; coach_number: string | null; category: string; description: string | null; status: string; sla_due: string | null; created_at: string; location_id: string | null }>(db.from("rail_complaints").select("id,ref_no,coach_number,category,description,status,sla_due,created_at,location_id").order("created_at", { ascending: false }).limit(300)),
        rows<{ id: string; rule_code: string; severity: string; message: string; status: string; created_at: string }>(db.from("rail_alerts").select("id,rule_code,severity,message,status,created_at").order("created_at", { ascending: false }).limit(200)),
        rows<{ id: string; coach_number: string; last_intensive_on: string | null; rail_coach_types: { code: string } | null }>(db.from("rail_coaches").select("id,coach_number,last_intensive_on,rail_coach_types(code)").eq("status", "active").order("last_intensive_on", { nullsFirst: true }).limit(500)),
        rows<{ id: string; code: string; name: string; type: string; parent_id: string | null }>(db.from("rail_locations").select("id,code,name,type,parent_id")),
        rows<{ location_id: string; first_pass: boolean | null; rework_count: number }>(db.from("rail_event_coaches").select("location_id,first_pass,rework_count").not("first_pass", "is", null).limit(5000)),
      ]);
      return { insp, pen, comp, alerts, coaches, locs, ec };
    },
  });
  const { data: interval = 30 } = useQuery({ queryKey: ["rail-setting-int"], queryFn: async () => (await db.rpc("rail_setting", { _key: "intensive_interval_days" })).data ?? 30 });
  const [newC, setNewC] = useState({ ref_no: "", coach_number: "", description: "" });

  const locName = (id: string | null) => rawData?.locs.find((l) => l.id === id)?.code ?? "—";
  const depotOf = (id: string | null): string | null => {
    let l = rawData?.locs.find((x) => x.id === id);
    const seen = new Set<string>();
    while (l && l.type !== "depot" && l.type !== "station" && !seen.has(l.id)) { seen.add(l.id); l = rawData?.locs.find((x) => x.id === l?.parent_id); }
    return l?.id ?? null;
  };
  const data = rawData && (!depot ? rawData : {
    ...rawData,
    insp: rawData.insp.filter((x) => depotOf(x.location_id) === depot),
    pen: rawData.pen.filter((x) => depotOf(x.location_id) === depot),
    comp: rawData.comp.filter((x) => depotOf(x.location_id) === depot),
    ec: rawData.ec.filter((x) => depotOf(x.location_id) === depot),
  });
  // Trust score per depot: 60% first-pass rate, 25% complaint-free, 15% penalty-free (last 300 records)
  const trust = (data?.locs ?? []).filter((l) => l.type === "depot" && (!depot || l.id === depot)).map((d) => {
    const ec = data!.ec.filter((x) => depotOf(x.location_id) === d.id);
    const fp = ec.length ? ec.filter((x) => x.first_pass).length / ec.length : 1;
    const comp = data!.comp.filter((c) => depotOf(c.location_id) === d.id && c.status !== "closed").length;
    const pen = data!.pen.filter((p) => depotOf(p.location_id) === d.id && p.status !== "waived").length;
    const score = Math.round(fp * 60 + Math.max(0, 25 - comp * 5) + Math.max(0, 15 - pen * 1.5));
    return { depot: d.name, score, firstPass: Math.round(fp * 100), complaints: comp, penalties: pen, reviewed: ec.length };
  }).sort((a, b) => b.score - a.score);

  const due = (data?.coaches ?? []).map((c) => {
    const days = c.last_intensive_on ? Math.floor((Date.now() - new Date(c.last_intensive_on).getTime()) / 864e5) : 9999;
    return { ...c, days };
  }).filter((c) => c.days >= interval - 3);

  async function addComplaint() {
    const sla = new Date(Date.now() + 4 * 3600e3).toISOString();
    const { error } = await db.from("rail_complaints").insert({ ...newC, sla_due: sla });
    if (error) return toast.error(error.message);
    toast.success("Complaint logged"); setNewC({ ref_no: "", coach_number: "", description: "" }); inv();
  }

  const totals = {
    pen: (data?.pen ?? []).filter((p) => p.status === "confirmed").reduce((s, p) => s + Number(p.amount), 0),
    open: (data?.comp ?? []).filter((c) => c.status === "open" || c.status === "assigned").length,
    breached: (data?.comp ?? []).filter((c) => (c.status === "open" || c.status === "assigned") && c.sla_due && new Date(c.sla_due) < new Date()).length,
  };

  return (
    <div className="space-y-5">
      <RailTopbarSlot><select aria-label="Depot" value={depot} onChange={(e) => setDepot(e.target.value)} className="h-10 min-w-44 max-w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground"><option value="">All depots</option>{rawData?.locs.filter((l) => l.type === "depot" || l.type === "station").map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></RailTopbarSlot>
      <PageHeader title="Quality" description="Cleaning photos, inspections, penalties and complaints." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Checks" value={data?.insp.length ?? 0} hint={`${data?.insp.filter((i) => i.result === "fail").length ?? 0} failed`} tone="brand" />
        <Kpi label="Fines" value={inr(totals.pen)} tone={totals.pen ? "bad" : "default"} />
        <Kpi label="Open complaints" value={totals.open} hint={`${totals.breached} past time limit`} tone={totals.breached ? "bad" : "default"} />
        <Kpi label="Open alerts" value={data?.alerts.filter((a) => a.status === "open").length ?? 0} tone="warn" />
        <Kpi label="Deep clean due" value={due.length} tone={due.length ? "warn" : "good"} />
      </div>

      <Tabs defaultValue="photos">
        <TabsList className="w-full min-w-0 flex-nowrap justify-start overflow-x-auto whitespace-nowrap [&>button]:shrink-0 [&>button]:whitespace-nowrap">
          <TabsTrigger value="photos">Cleaning photos</TabsTrigger>
          <TabsTrigger value="penalties">Penalties</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="intensive">Deep clean due</TabsTrigger>
          <TabsTrigger value="trust">Trust score</TabsTrigger>
        </TabsList>

        <TabsContent value="photos"><RailEvidenceReview depot={depot} depotOf={depotOf} /></TabsContent>

        <TabsContent value="penalties" className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">Proposed → review → confirm or waive. Confirmed amounts reduce the railway bill, not a worker's salary. <Link to="/admin/rail/billing" className="text-brand underline">Open billing</Link></p><Button variant="outline" size="sm" onClick={() => downloadCsv(`penalty-statement-${today()}`, data?.pen ?? [])}>Export penalty statement</Button></div>
          {!data?.pen.length ? <Empty title="No penalties" hint="Penalties are raised automatically on rejected coaches, late releases and staff shortfalls." /> :
            <div className="divide-y rounded-2xl border bg-card">{data.pen.map((p) => (
              <div key={p.id} className="flex flex-wrap items-start justify-between gap-3 p-3 text-sm">
                <div className="min-w-0"><div className="font-medium">{p.rule_code.replace(/_/g, " ")} · {inr(p.amount)}</div><div className="text-xs text-muted-foreground">{p.penalty_date} · {locName(p.location_id)} · {p.reason}</div><div className="mt-1 text-xs text-muted-foreground">{p.status === "confirmed" ? "Railway bill deduction · visible in Finance" : p.status === "proposed" ? "Awaiting review · do not issue bill yet" : p.status === "waived" ? "No deduction" : "Under review"}</div></div>
                <div className="flex flex-wrap items-center gap-2"><StatusPill s={p.status} />
                  {p.status === "proposed" && <><Button size="sm" variant="outline" onClick={async () => { if (await confirmAction({ title: "Confirm railway fine?", description: `${inr(p.amount)} will reduce the railway bill for this month. This does not change worker pay.`, confirmText: "Confirm fine" })) { if (await setField("rail_penalties", p.id, { status: "confirmed" }, "Fine confirmed")) { inv(); qc.invalidateQueries({ queryKey: ["rail-finance"] }); } } }}>Confirm</Button>
                  <Button size="sm" variant="ghost" onClick={async () => { if (await confirmAction({ title: "Waive this fine?", description: "This fine will no longer count towards the railway bill.", confirmText: "Waive fine" })) { if (await setField("rail_penalties", p.id, { status: "waived" }, "Fine waived")) { inv(); qc.invalidateQueries({ queryKey: ["rail-finance"] }); } } }}>Waive</Button></>}
                </div>
              </div>))}</div>}
        </TabsContent>

        <TabsContent value="inspections">
          {!data?.insp.length ? <Empty title="No inspections yet" /> :
            <div className="divide-y rounded-2xl border bg-card">{data.insp.map((i) => (
              <div key={i.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium capitalize">{i.result}</div><div className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()} · {locName(i.location_id)} · {i.inspector_role} {i.remarks && `· ${i.remarks}`}</div></div><StatusPill s={i.result === "pass" ? "approved" : "rejected"} /></div>))}</div>}
        </TabsContent>

        <TabsContent value="complaints" className="space-y-3">
          <div className="grid gap-2 rounded-2xl border bg-card p-3 md:grid-cols-[1fr_1fr_2fr_auto]">
            <Input placeholder="Rail Madad ref." value={newC.ref_no} onChange={(e) => setNewC({ ...newC, ref_no: e.target.value })} />
            <Input placeholder="Coach no." value={newC.coach_number} onChange={(e) => setNewC({ ...newC, coach_number: e.target.value })} />
            <Input placeholder="What was reported" value={newC.description} onChange={(e) => setNewC({ ...newC, description: e.target.value })} />
            <Button onClick={addComplaint} disabled={!newC.description}><Plus className="mr-1 h-4 w-4" />Log</Button>
          </div>
          {!data?.comp.length ? <Empty title="No complaints" /> :
            <div className="divide-y rounded-2xl border bg-card">{data.comp.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 text-sm">
                <div><div className="font-medium">{c.ref_no || "Complaint"} · coach {c.coach_number || "—"}</div><div className="text-xs text-muted-foreground">{c.description} {c.sla_due && `· due ${new Date(c.sla_due).toLocaleString()}`}</div></div>
                <div className="flex items-center gap-2"><StatusPill s={c.status} />{c.status !== "resolved" && c.status !== "closed" && <Button size="sm" variant="outline" onClick={async () => (await setField("rail_complaints", c.id, { status: "resolved", resolved_at: new Date().toISOString() }, "Resolved")) && inv()}>Resolve</Button>}</div>
              </div>))}</div>}
        </TabsContent>

        <TabsContent value="alerts">
          {!data?.alerts.length ? <Empty title="No alerts" hint="Alerts appear for chemical over-use, leaks, late releases and SLA breaches." /> :
            <div className="divide-y rounded-2xl border bg-card">{data.alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{a.message}</div><div className="text-xs text-muted-foreground">{a.rule_code} · {new Date(a.created_at).toLocaleString()}</div></div>
                <div className="flex items-center gap-2"><StatusPill s={a.status} />{a.status === "open" && <Button size="sm" variant="outline" onClick={async () => (await setField("rail_alerts", a.id, { status: "acknowledged", ack_at: new Date().toISOString() }, "Acknowledged")) && inv()}>Acknowledge</Button>}</div></div>))}</div>}
        </TabsContent>

        <TabsContent value="intensive">
          {!due.length ? <Empty title="No coaches due for deep cleaning" /> :
            <div className="divide-y rounded-2xl border bg-card">{due.slice(0, 200).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 text-sm"><div className="font-medium">{c.coach_number} · {c.rail_coach_types?.code}</div>
                 <div className="flex items-center gap-3"><span className={c.days > interval ? "text-destructive" : "text-warning"}>{c.days === 9999 ? "Never deep-cleaned" : `${c.days} days since last`}</span>
                  <Button size="sm" variant="outline" onClick={async () => (await setField("rail_coaches", c.id, { last_intensive_on: today() }, "Marked deep-cleaned today")) && inv()}>Done today</Button></div></div>))}</div>}
        </TabsContent>

        <TabsContent value="trust">
          <div className="divide-y rounded-2xl border bg-card">{trust.map((t, i) => (
            <div key={t.depot} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{i + 1}. {t.depot}</div><div className="text-xs text-muted-foreground">First-pass {t.firstPass}% of {t.reviewed} reviewed · {t.complaints} open complaints · {t.penalties} penalties</div></div>
              <div className="text-2xl font-semibold tabular-nums">{t.score}</div></div>))}</div>
          <p className="mt-2 text-xs text-muted-foreground">Trust score = 60 × first-pass rate + up to 25 for no open complaints + up to 15 for no penalties.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
