import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db, Empty, railHead, rows, today } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/attendance/employee")({
  head: () => railHead("Employee attendance", "Look up rail staff and their check-in history."),
  component: EmployeeAttendanceLookupPage,
});

type Person = { id: string; full_name: string; role_key: string; employee_code: string | null; home_location_id: string | null };
type Shift = { id: string; work_date: string; check_in: string | null; check_out: string | null; hours: number | null; rail_locations: { name: string } | null };
const time = (value: string | null) => value ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

function EmployeeAttendanceLookupPage() {
  const [query, setQuery] = useState("");
  const [person, setPerson] = useState<Person | null>(null);
  const [month, setMonth] = useState(today().slice(0, 7));
  const search = query.trim();
  const { data: people, isLoading: searching, error: searchError } = useQuery({
    queryKey: ["rail-attendance-people", search], enabled: search.length >= 2,
    queryFn: () => rows<Person>(db.from("rail_people").select("id,full_name,role_key,employee_code,home_location_id").ilike("full_name", `%${search.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`).eq("enabled", true).is("deleted_at", null).order("full_name").limit(30)),
  });
  const { data: shifts, isLoading: loadingShifts, error: shiftError } = useQuery({
    queryKey: ["rail-attendance-person", person?.id, month], enabled: !!person,
    queryFn: () => rows<Shift>(db.from("rail_attendance").select("id,work_date,check_in,check_out,hours,rail_locations(name)").eq("person_id", person!.id).gte("work_date", `${month}-01`).lte("work_date", `${month}-31`).is("deleted_at", null).order("work_date", { ascending: false }).limit(100)),
  });
  return <div className="min-w-0 space-y-5">
    <RailTopbarSlot><Input aria-label="Search rail staff" className="min-w-48 max-w-72" placeholder="Search rail staff by name" value={query} onChange={(e) => { setQuery(e.target.value); setPerson(null); }} /><Input aria-label="Attendance month" className="w-44" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></RailTopbarSlot>
    <PageHeader title="Employee attendance" description="Check-ins and shift history for rail staff." />
    <Button asChild size="sm" variant="ghost"><Link to="/admin/attendance"><ArrowLeft className="mr-2 h-4 w-4" />All shifts</Link></Button>
    {search.length < 2 ? <Empty title="Search for a team member" hint="Enter at least two letters of their name." /> : searching ? <p className="text-sm text-muted-foreground">Searching…</p> : searchError ? <p role="alert" className="text-sm text-destructive">Could not search people: {String(searchError)}</p> :
      <div className="divide-y divide-border border-y border-border">{!people?.length ? <Empty title="No matching rail staff" /> : people.map((p) => <button type="button" key={p.id} onClick={() => setPerson(p)} className={`flex w-full items-center justify-between gap-3 px-2 py-3 text-left hover:bg-muted/50 ${person?.id === p.id ? "bg-brand/10" : ""}`}><span><span className="font-medium">{p.full_name}</span><span className="ml-2 text-xs text-muted-foreground">{p.role_key.replaceAll("_", " ")}{p.employee_code ? ` · ${p.employee_code}` : ""}</span></span><Search className="h-4 w-4 text-muted-foreground" /></button>)}</div>}
    {person && <section className="space-y-3"><h2 className="font-heading text-lg font-semibold">{person.full_name} · {month}</h2>
      {loadingShifts ? <p className="text-sm text-muted-foreground">Loading shifts…</p> : shiftError ? <p role="alert" className="text-sm text-destructive">Could not load shifts: {String(shiftError)}</p> : !shifts?.length ? <Empty title="No shifts recorded this month" /> : <div className="divide-y divide-border border-y border-border">{shifts.map((s) => <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div className="font-medium">{new Date(`${s.work_date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}<div className="text-xs font-normal text-muted-foreground">{s.rail_locations?.name ?? "Location not recorded"}</div></div><div className="text-right tabular-nums">{time(s.check_in)} – {time(s.check_out)}<div className="text-xs text-muted-foreground">{s.check_out ? `${Number(s.hours ?? 0).toFixed(1)} hours` : "On duty"}</div></div></div>)}</div>}
    </section>}
  </div>;
}
