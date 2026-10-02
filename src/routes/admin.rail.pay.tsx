import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { db, Empty, inr, Kpi, monthStart, num, railHead, rows } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail/pay")({
  head: () => railHead("My Pay", "Your own profile, days worked and monthly pay."),
  component: MyPay,
});

type Pay = { full_name: string; role_key: string; skill: string | null; mobile: string; daily_wage: number; days: number; hours: number; gross: number };
type Slip = { id: string; gross: number; total_deductions: number; net_pay: number; paid_days: number; earnings: { name: string; amount: number }[] | null; deductions: { name: string; amount: number }[] | null; created_at: string };

function MyPay() {
  const [month, setMonth] = useState(monthStart().slice(0, 7));
  const { data, isLoading } = useQuery({
    queryKey: ["rail-my-pay", month],
    queryFn: async () => {
      const [me] = await rows<Pay>(db.rpc("rail_my_pay", { _month: `${month}-01` }));
      // Formal payslips from the payroll register (own rows only, enforced by access rules).
      const cand = await db.rpc("current_user_candidate_id");
      const slips = cand.data
        ? await rows<Slip>(db.from("payroll_run_snapshots").select("id,gross,total_deductions,net_pay,paid_days,earnings,deductions,created_at").eq("candidate_id", cand.data).order("created_at", { ascending: false }).limit(6))
        : [];
      return { me, slips };
    },
  });
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  const me = data?.me;
  return (
    <div className="space-y-5">
      <PageHeader title="My Pay" description="Only your own details are shown here." actions={<Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" aria-label="Month" />} />
      {!me ? <Empty title="Your worker profile isn't linked yet" hint="Ask your supervisor to add your phone number in Team." /> : (<>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-lg font-semibold">{me.full_name}</div>
          <div className="text-sm capitalize text-muted-foreground">{me.role_key.replace(/_/g, " ")}{me.skill ? ` · ${me.skill}` : ""} · {me.mobile}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Days worked" value={num(me.days)} />
          <Kpi label="Hours" value={num(me.hours, 1)} />
          <Kpi label="Daily wage" value={inr(me.daily_wage)} />
          <Kpi label="Earned this month" value={inr(me.gross)} tone="good" />
        </div>
      </>)}
      <div>
        <div className="mb-2 text-sm font-semibold">Payslips</div>
        {!data?.slips.length ? <Empty title="No payslips yet" hint="Payslips appear here after payroll is approved." /> : (
          <div className="space-y-3">{data.slips.map((s) => (
            <details key={s.id} className="rounded-lg border bg-card p-4">
              <summary className="flex cursor-pointer items-center justify-between text-sm"><span>{s.created_at.slice(0, 7)} · {num(s.paid_days)} days</span><b className="tabular-nums">{inr(s.net_pay)}</b></summary>
              <div className="mt-3 grid gap-4 text-sm md:grid-cols-2">
                <div><div className="mb-1 font-medium">Earnings</div>{(s.earnings ?? []).map((e) => <div key={e.name} className="flex justify-between"><span>{e.name}</span><span className="tabular-nums">{inr(e.amount)}</span></div>)}<div className="mt-1 flex justify-between border-t pt-1 font-medium"><span>Gross</span><span>{inr(s.gross)}</span></div></div>
                <div><div className="mb-1 font-medium">Deductions</div>{(s.deductions ?? []).map((e) => <div key={e.name} className="flex justify-between"><span>{e.name}</span><span className="tabular-nums">{inr(e.amount)}</span></div>)}<div className="mt-1 flex justify-between border-t pt-1 font-medium"><span>Total</span><span>{inr(s.total_deductions)}</span></div></div>
              </div>
            </details>))}</div>)}
      </div>
    </div>
  );
}
