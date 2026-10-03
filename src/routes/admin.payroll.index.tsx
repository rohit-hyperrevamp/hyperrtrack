import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { RailPayStructures } from "@/components/RailPayStructures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db, Empty, Kpi, monthStart, num, railHead, rows } from "@/lib/rail-ui";

const searchSchema = z.object({ window: z.string().optional(), month: z.coerce.number().optional(), year: z.coerce.number().optional(), status: z.string().optional() });

export const Route = createFileRoute("/admin/payroll/")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => railHead("Payroll", "Monthly payroll for railway cleaning staff, by depot and role."),
  component: PayrollPage,
});

type Person = { id: string; full_name: string; role_key: string | null; home_location_id: string | null };

function PayrollPage() {
  const [month, setMonth] = useState(monthStart().slice(0, 7));
  const [q, setQ] = useState("");
  const m0 = `${month}-01`;
  const { data: people = [] } = useQuery({ queryKey: ["payroll-people"], queryFn: () => rows<Person>(db.from("rail_people").select("id,full_name,role_key,home_location_id").is("deleted_at", null).eq("enabled", true).order("full_name")) });
  const { data: depots = [] } = useQuery({ queryKey: ["payroll-depots"], queryFn: () => rows<{ id: string; name: string }>(db.from("rail_locations").select("id,name").is("deleted_at", null)) });
  const { data: att = [] } = useQuery({ queryKey: ["payroll-att", m0], queryFn: () => rows<{ person_id: string }>(db.from("rail_attendance").select("person_id").is("deleted_at", null).not("check_in", "is", null).gte("work_date", m0).lt("work_date", new Date(new Date(m0).setMonth(new Date(m0).getMonth() + 1)).toISOString().slice(0, 10))) });
  const depotName = useMemo(() => new Map(depots.map((d) => [d.id, d.name])), [depots]);
  const days = useMemo(() => { const m = new Map<string, number>(); for (const a of att) m.set(a.person_id, (m.get(a.person_id) ?? 0) + 1); return m; }, [att]);
  const shown = people.filter((p) => `${p.full_name} ${p.role_key ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  const label = (r: string | null) => (r ?? "—").replace(/_/g, " ");

  return (
    <div className="space-y-5">
      <RailTopbarSlot><Input type="month" aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 w-40" /><Input aria-label="Search staff" placeholder="Search staff or role" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-56" /></RailTopbarSlot>
      <Button asChild variant="ghost" size="sm"><Link to="/admin/rail/finance"><ArrowLeft className="h-4 w-4" /> Back to Finance & Payroll</Link></Button>
      <PageHeader title="Payroll" description="Days worked come from check-ins; pay follows each role's salary structure." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kpi label="Staff" value={num(people.length)} tone="brand" />
        <Kpi label="Worked this month" value={num(days.size)} />
        <Kpi label="Total man-days" value={num(att.length)} />
      </div>
      {!shown.length ? <Empty title="No staff found" hint="Try another search." /> : (
        <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Depot</th><th className="p-3 text-right">Days</th></tr></thead>
          <tbody className="divide-y">{shown.map((p) => <tr key={p.id}><td data-label="Name" className="p-3 font-medium">{p.full_name}</td><td data-label="Role" className="p-3 capitalize">{label(p.role_key)}</td><td data-label="Depot" className="p-3">{(p.home_location_id && depotName.get(p.home_location_id)) || "—"}</td><td data-label="Days" className="p-3 text-right tabular-nums">{num(days.get(p.id) ?? 0)}</td></tr>)}</tbody>
        </table></div>)}
      <div className="rounded-lg border bg-card p-4"><RailPayStructures /></div>
    </div>
  );
}
