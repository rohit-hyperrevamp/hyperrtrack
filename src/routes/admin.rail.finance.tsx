import { RailPayStructures } from "@/components/RailPayStructures";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { db, Empty, inr, Kpi, monthStart, num, railHead, rows } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail/finance")({
  head: () => railHead("Finance & Payroll", "Profit by depot, role pay structures, payslip estimates and links to payroll and invoices."),
  component: Finance,
});

type Row = { location_id: string; location_name: string; staff: number; man_days: number; wage_cost: number; penalties: number };

function Finance() {
  const [month, setMonth] = useState(monthStart().slice(0, 7));
  const [section, setSection] = useState<"depots" | "pay" | "links" | null>(null);
  const m0 = `${month}-01`;
  const { data } = useQuery({
    queryKey: ["rail-finance", month],
    queryFn: async () => {
      const [depots, bills] = await Promise.all([
        rows<Row>(db.rpc("rail_finance_summary", { _month: m0 })),
        rows<{ net_total: number; gross: number; gst_amount: number }>(db.from("rail_bills").select("net_total,gross,gst_amount").eq("bill_month", m0).is("deleted_at", null)),
      ]);
      return { depots, bills };
    },
  });
  const topControls = <RailTopbarSlot><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 w-40 shrink-0" aria-label="Month" /></RailTopbarSlot>;
  if (!data) return <>{topControls}<div className="h-64 animate-pulse rounded-lg bg-muted" /></>;
  const billed = data.bills.reduce((s, b) => s + Number(b.net_total ?? 0) - Number(b.gst_amount ?? 0), 0);
  const wages = data.depots.reduce((s, d) => s + Number(d.wage_cost), 0);
  const pen = data.depots.reduce((s, d) => s + Number(d.penalties), 0);
  const margin = billed - wages;
  const manDays = data.depots.reduce((s, d) => s + Number(d.man_days), 0);
  return (
    <div className="space-y-5">
      {topControls}
      <PageHeader title="Finance & Payroll" description="Billed (before GST) minus wages. Penalties are already taken off the bill." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Billed" value={inr(billed)} to="/admin/rail/billing" />
        <Kpi label="Wage cost" value={inr(wages)} />
        <Kpi label="Penalties" value={inr(pen)} tone={pen ? "bad" : "default"} />
        <Kpi label="Margin" value={inr(margin)} hint={billed ? `${Math.round((margin / billed) * 100)}% of billed` : undefined} tone={margin < 0 ? "bad" : "good"} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden" aria-label="Finance sections">
        {([['depots','Depots'],['pay','Pay structures'],['links','More']] as const).map(([key,label]) => <Button key={key} size="sm" variant={section === key ? "default" : "outline"} className="shrink-0" onClick={() => setSection(section === key ? null : key)} aria-expanded={section === key}>{label}<ChevronDown className="h-4 w-4" /></Button>)}
      </div>
      <div className={section === "depots" ? "block" : "hidden sm:block"}>
      {!data.depots.length ? <Empty title="No depots yet" /> : (
        <><div className="space-y-2 sm:hidden">{data.depots.map((d) => <div key={d.location_id} className="rounded-xl border border-border bg-card p-3 text-sm"><div className="mb-2 truncate font-semibold" title={d.location_name}>{d.location_name}</div><div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground"><span>{num(d.staff)} staff</span><span>{num(d.man_days)} days</span><span>Wages {inr(d.wage_cost)}</span>{Number(d.penalties) > 0 && <span className="text-destructive">Fines {inr(d.penalties)}</span>}</div></div>)}</div>
        <div className="hidden overflow-x-auto rounded-lg border bg-card sm:block">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-3">Depot</th><th className="p-3 text-right">Staff</th><th className="p-3 text-right">Man-days</th><th className="p-3 text-right">Wage cost</th><th className="p-3 text-right">Penalties</th><th className="p-3 text-right">Share of bill</th></tr></thead>
            <tbody className="divide-y">{data.depots.map((d) => {
              const share = manDays ? (billed * Number(d.man_days)) / manDays : 0;
              return <tr key={d.location_id}><td data-label="Depot" className="p-3 font-medium">{d.location_name}</td><td data-label="Staff" className="p-3 text-right tabular-nums">{num(d.staff)}</td><td data-label="Man-days" className="p-3 text-right tabular-nums">{num(d.man_days)}</td><td data-label="Wage cost" className="p-3 text-right tabular-nums">{inr(d.wage_cost)}</td><td data-label="Penalties" className="p-3 text-right tabular-nums text-destructive">{inr(d.penalties)}</td><td data-label="Share of bill" className="p-3 text-right tabular-nums">{inr(share)}</td></tr>;
            })}</tbody>
          </table>
        </div></>)}
      </div>
      <div className={section === "pay" ? "block" : "hidden sm:block"}><RailPayStructures /></div>
      <div className={section === "links" ? "flex flex-wrap gap-2" : "hidden sm:flex sm:flex-wrap sm:gap-2"}>
        <Button asChild variant="outline"><Link to="/admin/deduction-type-manager">Deductions</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/payroll">Payroll register</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/invoice">Invoices</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/allowance-manager">Salary parts</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/employer-contributions">Employer contributions</Link></Button>
      </div>
    </div>
  );
}
