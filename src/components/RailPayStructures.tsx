import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, inr, monthStart, num, rows } from "@/lib/rail-ui";
import { computeSalary, pickComponents, type SalaryComponent } from "@/lib/rail-salary";

type Inputs = { name: string; structure_id: string | null; structure: string | null; area: string; days: number; rate: number; ed_hours: number; days_in_month: number; is_mgr: boolean; placeholder: boolean };

/** Per-worker payslip built from the role's salary formula lines (edited in Configuration Hub). */
export function RailPayStructures() {
  const [person, setPerson] = useState("");
  const [month, setMonth] = useState(monthStart().slice(0, 7));
  const monthDate = `${month}-01`;
  const { data: people = [] } = useQuery({ queryKey: ["rail-people-pay"], queryFn: () => rows<{ id: string; full_name: string }>(db.from("rail_people").select("id,full_name").is("deleted_at", null).eq("enabled", true).order("full_name")) });
  const { data: inp, isFetching, error } = useQuery({ queryKey: ["rail-pay-inputs", person, monthDate], enabled: !!person, queryFn: async () => { const { data, error } = await db.rpc("rail_pay_inputs", { _person: person, _month: monthDate }); if (error) throw error; return data as Inputs | null; } });
  const { data: comps = [] } = useQuery({ queryKey: ["rail-salary-components", inp?.structure_id], enabled: !!inp?.structure_id, queryFn: () => rows<SalaryComponent>(db.from("rail_salary_components").select("*").eq("structure_id", inp!.structure_id).is("deleted_at", null)) });
  const res = useMemo(() => inp ? computeSalary(pickComponents(comps, inp.area, monthDate), inp) : null, [inp, comps, monthDate]);
  const block = (kind: SalaryComponent["kind"], title: string, totalLabel: string, total: number, strong?: boolean) => (
    <div><div className="mb-1 font-medium">{title}</div>
      {res!.lines.filter((l) => l.kind === kind && (l.amount !== 0 || l.code === "basic_da")).map((l) => <div key={l.id} className="flex justify-between gap-3 py-1"><span>{l.label}<span className="block font-mono text-[11px] text-muted-foreground">{l.formula}</span></span><span className="tabular-nums">{l.error ? "Error" : inr(l.amount)}</span></div>)}
      <div className="flex justify-between border-t pt-1 font-semibold"><span>{totalLabel}</span><span className={strong ? "text-brand" : ""}>{inr(total)}</span></div></div>);
  return (
    <section className="space-y-3">
      <div className="text-sm font-medium">Payslip breakdown</div>
      <p className="text-xs text-muted-foreground">Formulas come from Configuration Hub → Masters &amp; rules → Billing &amp; wages → Salary structures.</p>
      <div className="flex flex-col gap-2 sm:flex-row"><Select value={person || "none"} onValueChange={(v) => setPerson(v === "none" ? "" : v)}><SelectTrigger aria-label="Worker" className="w-full max-w-sm"><SelectValue placeholder="Choose a worker" /></SelectTrigger><SelectContent><SelectItem value="none">Choose a worker</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select><input type="month" aria-label="Payslip month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 w-full max-w-40 rounded-lg border border-border bg-card px-3 text-sm text-foreground" /></div>
      {isFetching && <p className="text-sm text-muted-foreground">Calculating…</p>}
      {error && <p role="alert" className="text-sm text-destructive">Could not calculate this payslip. Check your access.</p>}
      {inp && !inp.structure_id && <p className="text-sm text-destructive">This worker's role has no salary structure yet.</p>}
      {inp && inp.days === 0 && <p className="text-sm text-muted-foreground">No check-ins this month, so pay is ₹0.</p>}
      {inp && inp.rate === 0 && <p className="text-sm text-destructive">No wage rate for this role and area. Add it under Wage rules.</p>}
      {inp && <p className="text-xs text-muted-foreground">{inp.structure} · Area {inp.area} · {num(inp.days)} days × {inr(inp.rate)} · ED {num(inp.ed_hours, 2)} h{inp.placeholder ? " · draft values" : ""}</p>}
      {res && <div className="mt-2 grid gap-6 text-sm md:grid-cols-3">
        {block("earning", "Earnings", "Gross", res.gross)}
        {block("deduction", "Deductions", "Take-home", res.net, true)}
        {inp?.is_mgr && block("employer", "Employer contribution", "CTC", res.ctc)}
      </div>}
    </section>
  );
}
