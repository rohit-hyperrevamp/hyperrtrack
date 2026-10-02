import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileDown, FileSpreadsheet, Play } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logActivity } from "@/lib/activity-log";
import { downloadCsv } from "@/lib/csv-export";
import { db, Empty, inr, Kpi, monthStart, railHead, rows, rpc, StatusPill } from "@/lib/rail-ui";
import { buildAnnexure } from "./admin.rail.checker";

export const Route = createFileRoute("/admin/rail/billing")({
  head: () => railHead("Railway Billing", "Monthly railway bills from approved coaches, penalties and GST, with compliance gate, checker e-sign and wage checks."),
  component: BillingPage,
});

type Bill = { id: string; bill_no: string; bill_month: string; status: string; gross: number; penalty_total: number; credit_total: number; gst_amount: number; net_total: number; annexure_sha256: string | null; contract_id: string };
const DOCS = [["bank_transfer", "Bank transfer proof"], ["epf_ecr", "EPF ECR"], ["esic_challan", "ESIC challan"], ["attendance_register", "Attendance register"]] as const;

function BillingPage() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(monthStart().slice(0, 7));
  const [contract, setContract] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const m0 = `${month}-01`;

  const { data } = useQuery({
    queryKey: ["rail-bill", month],
    queryFn: async () => {
      const [contracts, bills, docs, people, wages, att] = await Promise.all([
        rows<{ id: string; loa_number: string; title: string | null; gst_percent: number; partial_clean_rule: string }>(db.from("rail_contracts").select("id,loa_number,title,gst_percent,partial_clean_rule")),
        rows<Bill>(db.from("rail_bills").select("*").order("bill_month", { ascending: false })),
        rows<{ id: string; contract_id: string; doc_type: string; reference: string | null; status: string }>(db.from("rail_compliance_docs").select("id,contract_id,doc_type,reference,status").eq("month", m0)),
        rows<{ id: string; full_name: string; role_key: string; skill: string; daily_wage: number | null; home_location_id: string | null }>(db.from("rail_people").select("id,full_name,role_key,skill,daily_wage,home_location_id").eq("enabled", true)),
        rows<{ area_class: string; skill: string; basic_per_day: number; vda_per_day: number; total_per_day: number; effective_from: string; effective_to: string | null }>(db.from("rail_wage_rules").select("area_class,skill,basic_per_day,vda_per_day,total_per_day,effective_from,effective_to").order("effective_from", { ascending: false })),
        rows<{ person_id: string; hours: number | null; work_date: string }>(db.from("rail_attendance").select("person_id,hours,work_date").gte("work_date", m0)),
      ]);
      return { contracts, bills, docs, people, wages, att };
    },
  });
  const cId = contract || data?.contracts[0]?.id || "";
  const { data: lines = [] } = useQuery({
    queryKey: ["rail-bill-lines", open],
    enabled: !!open,
    queryFn: () => rows<{ id: string; description: string; billing_unit: string; qty: number; rate: number; amount: number }>(db.from("rail_bill_lines").select("id,description,billing_unit,qty,rate,amount").eq("bill_id", open).is("deleted_at", null).order("description")),
  });
  const { data: minWages = {} } = useQuery({
    queryKey: ["rail-min-wages", data?.people.length],
    enabled: !!data?.people.length,
    queryFn: async () => {
      const out: Record<string, number | null> = {};
      for (const p of data!.people.filter((x) => x.home_location_id)) out[p.id] = (await db.rpc("rail_min_wage", { _location: p.home_location_id, _skill: p.skill })).data;
      return out;
    },
  });
  const { data: taskCounts = {} } = useQuery({
    queryKey: ["rail-task-counts", month],
    queryFn: async () => {
      const t = await rows<{ completed_by: string }>(db.from("rail_event_tasks").select("completed_by").eq("status", "done").gte("completed_at", m0).limit(20000));
      return t.reduce<Record<string, number>>((m, x) => ((m[x.completed_by] = (m[x.completed_by] ?? 0) + 1), m), {});
    },
  });
  const inv = () => { qc.invalidateQueries({ queryKey: ["rail-bill"] }); qc.invalidateQueries({ queryKey: ["rail-bill-lines"] }); };

  async function generate() {
    const id = await rpc<string>("rail_generate_bill", { _contract: cId, _month: m0 }, "Bill generated");
    if (id) { void logActivity({ module: "Rail Billing", action: "generate_bill", entityType: "rail_bills", entityId: id, entityLabel: month }); setOpen(id); inv(); }
  }
  async function advance(b: Bill, to: string) {
    const ref = to === "paid" ? window.prompt("Payment reference (UTR)?") ?? undefined : undefined;
    const r = await rpc("rail_bill_advance", { _bill: b.id, _to: to, _ref: ref }, `Bill ${to.replace("_", " ")}`);
    if (r !== null) { void logActivity({ module: "Rail Billing", action: `bill_${to}`, entityType: "rail_bills", entityId: b.id }); inv(); }
  }
  async function annexure(b: Bill, kind: "csv" | "pdf") {
    const a = await buildAnnexure(b.id);
    if (kind === "csv") return downloadCsv(`${b.bill_no}-annexure`, a);
    const w = window.open("", "_blank"); if (!w) return toast.error("Allow pop-ups to open the annexure");
    w.document.write(`<html><head><title>${b.bill_no} annexure</title><style>body{font-family:system-ui;padding:24px;font-size:12px}td,th{padding:4px 6px;border-bottom:1px solid #ddd;text-align:left}</style></head><body><h2>Coach-wise annexure · ${b.bill_no}</h2>
      <p>Month ${b.bill_month.slice(0, 7)} · Gross ${inr(b.gross)} · Penalties ${inr(b.penalty_total)} · Credit ${inr(b.credit_total)} · GST ${inr(b.gst_amount)} · <b>Net ${inr(b.net_total)}</b></p>
      ${b.annexure_sha256 ? `<p>Checker-signed fingerprint (SHA-256): <code>${b.annexure_sha256}</code></p>` : ""}
      <table><tr><th>Line</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Tasks</th><th>Inspection</th></tr>${a.map((r) => `<tr><td>${r.line}</td><td>${r.qty}</td><td>${r.rate}</td><td>${r.amount}</td><td>${r.tasks}</td><td>${r.inspection}</td></tr>`).join("")}</table><script>window.print()</script></body></html>`);
  }
  async function addDoc(type: string) {
    const ref = window.prompt("Reference / file name for this document?"); if (!ref) return;
    const { error } = await db.from("rail_compliance_docs").insert({ contract_id: cId, month: m0, doc_type: type, reference: ref });
    if (error) return toast.error(error.message);
    toast.success("Document recorded"); void logActivity({ module: "Rail Billing", action: "compliance_doc", entityType: "rail_compliance_docs", entityLabel: type }); inv();
  }
  async function credit(b: Bill) {
    const amt = window.prompt("Credit note amount (₹)?"); const reason = amt && window.prompt("Reason?"); if (!amt || !reason) return;
    const { error } = await db.from("rail_credit_notes").insert({ bill_id: b.id, amount: Number(amt), reason });
    if (error) return toast.error(error.message);
    toast.success("Credit note added"); inv();
  }

  const bills = (data?.bills ?? []).filter((b) => b.contract_id === cId);
  const docs = (data?.docs ?? []).filter((d) => d.contract_id === cId);
  const below = (data?.people ?? []).filter((p) => p.daily_wage != null && minWages[p.id] != null && p.daily_wage < (minWages[p.id] as number));

  return (
    <div className="space-y-5">
      <PageHeader title="Railway Billing" description="Bills come only from approved coaches. Submission needs the month's compliance pack." actions={
        <div className="flex flex-wrap gap-2">
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={cId} onChange={(e) => setContract(e.target.value)} aria-label="Contract">{data?.contracts.map((c) => <option key={c.id} value={c.id}>{c.loa_number}</option>)}</select>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" aria-label="Month" />
          <Button onClick={generate} disabled={!cId}><Play className="mr-2 h-4 w-4" />Generate bill</Button>
        </div>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Bills" value={bills.length} />
        <Kpi label="Compliance pack" value={`${DOCS.filter(([t]) => docs.some((d) => d.doc_type === t && d.status !== "rejected")).length}/4`} tone={docs.length >= 4 ? "good" : "warn"} />
        <Kpi label="Below minimum wage" value={below.length} tone={below.length ? "bad" : "good"} />
        <Kpi label="Net this month" value={inr(bills.find((b) => b.bill_month === m0 && b.status !== "cancelled")?.net_total)} />
      </div>

      <Tabs defaultValue="bills">
        <TabsList><TabsTrigger value="bills">Bills</TabsTrigger><TabsTrigger value="compliance">Compliance pack</TabsTrigger><TabsTrigger value="wages">Wage compliance</TabsTrigger></TabsList>
        <TabsContent value="bills" className="space-y-3">
          {!bills.length ? <Empty title="No bills for this contract yet" hint="Generate a bill once coaches are approved for the month." action={<Button onClick={generate}>Generate bill</Button>} /> : bills.map((b) => (
            <div key={b.id} className="rounded-2xl border bg-card">
              <button className="flex w-full items-center justify-between p-4 text-left" onClick={() => setOpen(open === b.id ? null : b.id)}>
                <div><div className="font-medium">{b.bill_no}</div><div className="text-xs text-muted-foreground">Gross {inr(b.gross)} − penalties {inr(b.penalty_total)} − credit {inr(b.credit_total)} + GST {inr(b.gst_amount)}</div></div>
                <div className="flex items-center gap-3"><div className="text-lg font-semibold tabular-nums">{inr(b.net_total)}</div><StatusPill s={b.status} /></div>
              </button>
              {open === b.id && (
                <div className="space-y-3 border-t p-4">
                  <div className="flex flex-wrap gap-2">
                    {b.status === "draft" && <><Button size="sm" variant="outline" onClick={generate}>Regenerate</Button><Button size="sm" onClick={() => advance(b, "submitted")}>Submit to railway</Button></>}
                    {b.status === "checker_verified" && <Button size="sm" onClick={() => advance(b, "certified")}>Mark certified</Button>}
                    {b.status === "certified" && <Button size="sm" onClick={() => advance(b, "paid")}>Mark paid</Button>}
                    {(b.status === "draft" || b.status === "submitted") && <Button size="sm" variant="ghost" onClick={() => advance(b, "cancelled")}>Cancel</Button>}
                    <Button size="sm" variant="outline" onClick={() => annexure(b, "pdf")}><FileDown className="mr-1 h-4 w-4" />Annexure PDF</Button>
                    <Button size="sm" variant="outline" onClick={() => annexure(b, "csv")}><FileSpreadsheet className="mr-1 h-4 w-4" />Annexure Excel</Button>
                    {b.status !== "draft" && b.status !== "cancelled" && <Button size="sm" variant="ghost" onClick={() => credit(b)}>Add credit note</Button>}
                  </div>
                  {b.status === "submitted" && <div className="text-sm text-muted-foreground">Waiting for the Railway Checker to sign with OTP.</div>}
                  {b.annexure_sha256 && <div className="break-all text-xs text-muted-foreground">Signed fingerprint: {b.annexure_sha256}</div>}
                  {!lines.length ? <Empty title="No bill lines" hint="Only approved coaches are billed." /> : (
                    <div className="max-h-96 overflow-auto rounded-xl border"><table className="w-full text-sm"><thead className="sticky top-0 bg-card text-left text-xs text-muted-foreground"><tr><th className="p-2">Line</th><th>Qty</th><th>Rate</th><th className="text-right pr-2">Amount</th></tr></thead>
                      <tbody>{lines.map((l) => <tr key={l.id} className="border-t"><td className="p-2">{l.description}</td><td>{l.qty}</td><td>{inr(l.rate)}</td><td className="text-right pr-2 tabular-nums">{inr(l.amount)}</td></tr>)}</tbody></table></div>)}
                </div>)}
            </div>))}
        </TabsContent>
        <TabsContent value="compliance">
          <div className="divide-y rounded-2xl border bg-card">{DOCS.map(([t, label]) => { const d = docs.find((x) => x.doc_type === t && x.status !== "rejected");
            return <div key={t} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{label}</div><div className="text-xs text-muted-foreground">{d ? d.reference : "Missing — bill cannot be submitted"}</div></div>{d ? <StatusPill s="received" /> : <Button size="sm" variant="outline" onClick={() => addDoc(t)}>Add</Button>}</div>; })}</div>
        </TabsContent>
        <TabsContent value="wages" className="space-y-3">
          <div className="text-sm font-medium">Minimum wage rules (sweeping & cleaning)</div>
          <div className="divide-y rounded-2xl border bg-card">{data?.wages.map((w, i) => <div key={i} className="flex justify-between p-3 text-sm"><span>Area {w.area_class} · {w.skill.replace("_", "-")} · from {w.effective_from}{w.effective_to ? ` to ${w.effective_to}` : ""}</span><span className="tabular-nums">₹{w.basic_per_day} + ₹{w.vda_per_day} = <b>₹{w.total_per_day}</b>/day</span></div>)}</div>
          <p className="text-xs text-muted-foreground">The 1 October 2026 VDA revision is not entered yet — add it in Settings → Wage rules. Wages below the minimum are blocked when saving a worker.</p>
          <div className="text-sm font-medium">Workers: tasks done vs hours present ({month})</div>
          <div className="divide-y rounded-2xl border bg-card">{data?.people.filter((p) => ["cleaner", "shift_supervisor", "store_keeper"].includes(p.role_key)).map((p) => {
            const hrs = data.att.filter((a) => a.person_id === p.id).reduce((s, a) => s + Number(a.hours ?? 0), 0); const mn = minWages[p.id];
            return <div key={p.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{p.full_name}</div><div className="text-xs text-muted-foreground">{p.role_key.replace("_", " ")} · {p.skill.replace("_", "-")}</div></div>
              <div className="text-right"><div className={p.daily_wage != null && mn != null && p.daily_wage < mn ? "text-destructive font-medium" : ""}>₹{p.daily_wage ?? "—"}/day {mn != null && <span className="text-xs text-muted-foreground">(min ₹{mn})</span>}</div><div className="text-xs text-muted-foreground">{hrs.toFixed(1)} h present</div></div></div>; })}</div>
          {Object.keys(taskCounts).length > 0 && <p className="text-xs text-muted-foreground">{Object.values(taskCounts).reduce((a, b) => a + b, 0)} tasks completed this month across all workers.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
