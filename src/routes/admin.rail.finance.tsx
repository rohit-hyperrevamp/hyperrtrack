import { RailPayStructures } from "@/components/RailPayStructures";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db, Empty, inr, Kpi, monthStart, num, railHead, rows } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail/finance")({
  head: () => railHead("Finance & Payroll", "Profit by depot, role pay structures, payslip estimates and links to payroll and invoices."),
  component: Finance,
});

type Row = { location_id: string; location_name: string; staff: number; man_days: number; wage_cost: number; penalties: number };

function Finance() {
  const [month, setMonth] = useState(monthStart().slice(0, 7));
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
  if (!data) return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  const billed = data.bills.reduce((s, b) => s + Number(b.net_total ?? 0) - Number(b.gst_amount ?? 0), 0);
  const wages = data.depots.reduce((s, d) => s + Number(d.wage_cost), 0);
  const pen = data.depots.reduce((s, d) => s + Number(d.penalties), 0);
  const margin = billed - wages;
  const manDays = data.depots.reduce((s, d) => s + Number(d.man_days), 0);
  return (
    <div className="space-y-5">
      <PageHeader title="Finance & Payroll" description="Billed (before GST) minus wages. Penalties are already taken off the bill." actions={<Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" aria-label="Month" />} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Billed" value={inr(billed)} to="/admin/rail/billing" />
        <Kpi label="Wage cost" value={inr(wages)} />
        <Kpi label="Penalties" value={inr(pen)} tone={pen ? "bad" : "default"} />
        <Kpi label="Margin" value={inr(margin)} hint={billed ? `${Math.round((margin / billed) * 100)}% of billed` : undefined} tone={margin < 0 ? "bad" : "good"} />
      </div>
      {!data.depots.length ? <Empty title="No depots yet" /> : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-3">Depot</th><th className="p-3 text-right">Staff</th><th className="p-3 text-right">Man-days</th><th className="p-3 text-right">Wage cost</th><th className="p-3 text-right">Penalties</th><th className="p-3 text-right">Share of bill</th></tr></thead>
            <tbody className="divide-y">{data.depots.map((d) => {
              const share = manDays ? (billed * Number(d.man_days)) / manDays : 0;
              return <tr key={d.location_id}><td data-label="Depot" className="p-3 font-medium">{d.location_name}</td><td data-label="Staff" className="p-3 text-right tabular-nums">{num(d.staff)}</td><td data-label="Man-days" className="p-3 text-right tabular-nums">{num(d.man_days)}</td><td data-label="Wage cost" className="p-3 text-right tabular-nums">{inr(d.wage_cost)}</td><td data-label="Penalties" className="p-3 text-right tabular-nums text-destructive">{inr(d.penalties)}</td><td data-label="Share of bill" className="p-3 text-right tabular-nums">{inr(share)}</td></tr>;
            })}</tbody>
          </table>
        </div>)}
      <RailPayStructures />
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link to="/admin/deduction-type-manager">Deductions</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/payroll">Payroll register</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/invoice">Invoices</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/allowance-manager">Salary parts</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/employer-contributions">Employer contributions</Link></Button>
      </div>
    </div>
  );
}
