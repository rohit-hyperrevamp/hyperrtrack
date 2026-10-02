import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, Empty, inr, monthStart, num, rows } from "@/lib/rail-ui";

type S = { id: string; label: string; skill: string; hra_pct: number; bonus_pct: number; uniform_pct: number; leave_pct: number; pf_emp_pct: number; pf_er_pct: number; esic_emp_pct: number; esic_er_pct: number; pt_monthly: number; lwf_monthly: number; is_placeholder: boolean };
type Slip = Record<string, number | string | boolean | null>;

/** Role pay structures and a per-worker payslip estimate (attendance × wage rule × structure). */
export function RailPayStructures() {
  const [person, setPerson] = useState("");
  const [month, setMonth] = useState(monthStart().slice(0, 7));
  const monthDate = `${month}-01`;
  const { data: list = [] } = useQuery({ queryKey: ["rail-pay-structures"], queryFn: () => rows<S>(db.from("rail_pay_structures").select("*").is("deleted_at", null).order("effective_from", { ascending: false })) });
  const { data: people = [] } = useQuery({ queryKey: ["rail-people-pay"], queryFn: () => rows<{ id: string; full_name: string }>(db.from("rail_people").select("id,full_name").is("deleted_at", null).eq("enabled", true).order("full_name")) });
  const { data: slip, isFetching: slipLoading, error: slipError } = useQuery({ queryKey: ["rail-payslip", person, monthDate], enabled: !!person, queryFn: async () => { const { data, error } = await db.rpc("rail_payslip_preview", { _person: person, _month: monthDate }); if (error) throw error; return data as Slip | null; } });
  const [showStructures, setShowStructures] = useState(false);
  const line = (k: string, l: string) => <div className="flex justify-between py-1"><span>{l}</span><span className="tabular-nums">{inr(Number(slip?.[k] ?? 0))}</span></div>;
  return (
    <section className="space-y-3">
      <button type="button" onClick={() => setShowStructures((v) => !v)} aria-expanded={showStructures} className="flex w-full items-center justify-between border-b border-border py-2 text-left font-heading text-base font-semibold">Pay structure by role <ChevronDown className={`h-4 w-4 transition-transform ${showStructures ? "rotate-180" : ""}`} /></button>
      {showStructures && <>
      {list.some((s) => s.is_placeholder) && <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">Placeholder values — replace minimum wages with the official notification before running payroll.</p>}
      {!list.length ? <Empty title="No pay structures" hint="Add one per role." /> : (
        <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-3 text-left">Role</th><th className="p-3 text-left">Skill</th><th className="p-3 text-right">HRA</th><th className="p-3 text-right">Bonus</th><th className="p-3 text-right">Uniform</th><th className="p-3 text-right">Leave</th><th className="p-3 text-right">PF (you / firm)</th><th className="p-3 text-right">ESIC (you / firm)</th><th className="p-3 text-right">PT + LWF</th></tr></thead>
          <tbody className="divide-y">{list.map((s) => <tr key={s.id}><td data-label="Role" className="p-3 font-medium">{s.label}</td><td data-label="Skill" className="p-3 capitalize">{s.skill.replace(/_/g, " ")}</td><td data-label="HRA" className="p-3 text-right">{num(s.hra_pct, 2)}%</td><td data-label="Bonus" className="p-3 text-right">{num(s.bonus_pct, 2)}%</td><td data-label="Uniform" className="p-3 text-right">{num(s.uniform_pct, 2)}%</td><td data-label="Leave" className="p-3 text-right">{num(s.leave_pct, 2)}%</td><td data-label="PF" className="p-3 text-right">{num(s.pf_emp_pct, 2)}% / {num(s.pf_er_pct, 2)}%</td><td data-label="ESIC" className="p-3 text-right">{num(s.esic_emp_pct, 2)}% / {num(s.esic_er_pct, 2)}%</td><td data-label="PT + LWF" className="p-3 text-right">{inr(s.pt_monthly)} + {inr(s.lwf_monthly)}</td></tr>)}</tbody>
        </table></div>)}
      </>}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="text-sm font-medium">Payslip estimate this month</div>
        <div className="flex flex-col gap-2 sm:flex-row"><Select value={person || "none"} onValueChange={(value) => setPerson(value === "none" ? "" : value)}><SelectTrigger aria-label="Worker" className="w-full max-w-sm"><SelectValue placeholder="Choose a worker" /></SelectTrigger><SelectContent><SelectItem value="none">Choose a worker</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select><input type="month" aria-label="Payslip month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 w-full max-w-40 rounded-lg border border-border bg-card px-3 text-sm text-foreground" /></div>
        {slipLoading && <p className="text-sm text-muted-foreground">Calculating estimate…</p>}
        {slipError && <p role="alert" className="text-sm text-destructive">Could not calculate this estimate. Try again or check your access.</p>}
        {person && !slipLoading && !slipError && !slip && <p className="text-sm text-muted-foreground">No payslip estimate is available for this worker.</p>}
        {slip && Number(slip.days ?? 0) === 0 && <p className="text-sm text-muted-foreground">No check-ins recorded for this worker in the selected month. Pay stays at ₹0 until attendance is recorded. Choose another month to see earlier work.</p>}
        {slip && Number(slip.day_rate ?? 0) === 0 && <p className="text-sm text-destructive">No wage rate is assigned to this role and location. Set the wage rule before relying on this estimate.</p>}
        {slip && <div className="mt-4 grid gap-6 text-sm md:grid-cols-3">
          <div><div className="mb-1 font-medium">Earnings · {num(Number(slip.days))} days × {inr(Number(slip.day_rate))}</div>{line("basic_da", "Basic + DA")}{line("hra", "HRA")}{line("bonus", "Bonus")}{line("uniform", "Uniform")}{line("leave", "Leave wages")}<div className="flex justify-between border-t pt-1 font-semibold"><span>Gross</span><span>{inr(Number(slip.gross))}</span></div></div>
          <div><div className="mb-1 font-medium">Deductions</div>{line("pf", "PF")}{line("esic", "ESIC")}{line("pt", "Professional tax")}{line("lwf", "Labour welfare")}<div className="flex justify-between border-t pt-1 font-semibold"><span>Take-home</span><span className="text-brand">{inr(Number(slip.net))}</span></div></div>
          {slip.ctc != null && <div><div className="mb-1 font-medium">Firm cost</div>{line("employer_pf", "Employer PF")}{line("employer_esic", "Employer ESIC")}<div className="flex justify-between border-t pt-1 font-semibold"><span>CTC</span><span>{inr(Number(slip.ctc))}</span></div></div>}
        </div>}
      </div>
    </section>
  );
}
