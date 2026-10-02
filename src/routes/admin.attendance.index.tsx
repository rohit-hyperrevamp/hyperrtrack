import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogIn, LogOut, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RailDateStepper, RailTopbarSlot } from "@/components/RailTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db, Empty, Kpi, railHead, rows, today } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/attendance/")({
  head: () => railHead("Attendance", "Rail cleaner and supervisor check-ins, active shifts and attendance history."),
  component: RailAttendance,
});

type Shift = { id: string; person_id: string; location_id: string | null; work_date: string; check_in: string | null; check_out: string | null; hours: number | null; rail_people: { full_name: string; role_key: string } | null; rail_locations: { name: string; code: string } | null };
const stamp = (s: string | null) => s ? new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

function RailAttendance() {
  const [date, setDate] = useState(today());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "on" | "out">("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["rail-attendance", date],
    queryFn: async () => {
      const [shifts, required] = await Promise.all([
        rows<Shift>(db.from("rail_attendance").select("id,person_id,location_id,work_date,check_in,check_out,hours,rail_people(full_name,role_key),rail_locations(name,code)").eq("work_date", date).is("deleted_at", null).order("check_in", { ascending: false }).limit(1000)),
        db.rpc("rail_required_staff", { _location: null }).then((r: { data: number | null }) => Number(r.data ?? 0)),
      ]);
      return { shifts, required };
    },
    refetchInterval: date === today() ? 60_000 : false,
  });
  const shifts = data?.shifts ?? [];
  const on = shifts.filter((s) => s.check_in && !s.check_out).length;
  const left = shifts.filter((s) => s.check_out).length;
  const visible = shifts.filter((s) => {
    if (filter === "on" && (!s.check_in || s.check_out)) return false;
    if (filter === "out" && !s.check_out) return false;
    return `${s.rail_people?.full_name ?? ""} ${s.rail_people?.role_key ?? ""} ${s.rail_locations?.name ?? ""}`.toLowerCase().includes(query.toLowerCase().trim());
  });
  return <div className="min-w-0 space-y-5">
    <RailTopbarSlot>
      <RailDateStepper value={date} onChange={setDate} />
      <Input className="min-w-36 max-w-52" aria-label="Search attendance" placeholder="Search people or places" value={query} onChange={(e) => setQuery(e.target.value)} />
      <select aria-label="Shift status" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 min-w-28 rounded-lg border border-border bg-card px-3 text-sm text-foreground"><option value="all">All shifts</option><option value="on">On duty</option><option value="out">Checked out</option></select>
    </RailTopbarSlot>
    <PageHeader title="Attendance" description="Rail shifts and check-ins" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Kpi label="Required" value={data?.required ?? "—"} />
      <Kpi label="On duty" value={on} tone="good" />
      <Kpi label="Checked out" value={left} />
      <Kpi label="Shortfall" value={Math.max(0, (data?.required ?? 0) - on)} tone={data && data.required > on ? "bad" : "default"} />
    </div>
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3"><h2 className="font-heading text-base font-semibold">{date === today() ? "Today's shifts" : date}</h2><Button asChild size="sm" variant="outline"><Link to="/admin/attendance/employee"><Search className="mr-2 h-4 w-4" />Employee lookup</Link></Button></div>
    {isLoading ? <p className="text-sm text-muted-foreground">Loading attendance…</p> : error ? <p role="alert" className="text-sm text-destructive">Could not load attendance: {error instanceof Error ? error.message : "Please try again"}</p> : !visible.length ? <Empty title="No shifts match" hint="Check-ins appear here as staff start their shifts." /> :
      <div className="divide-y divide-border border-y border-border">{visible.map((s) => <div key={s.id} className="flex flex-wrap items-center gap-3 py-4">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${s.check_out ? "bg-muted text-muted-foreground" : "bg-brand text-primary-foreground"}`}>{s.check_out ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}</span>
        <div className="min-w-0 flex-1"><div className="font-medium">{s.rail_people?.full_name ?? "Staff member"}</div><div className="text-xs text-muted-foreground">{s.rail_people?.role_key.replaceAll("_", " ") ?? "Rail staff"} · {s.rail_locations?.name ?? "Place not recorded"}</div></div>
        <div className="text-right text-xs tabular-nums"><div className="font-medium">{stamp(s.check_in)} – {stamp(s.check_out)}</div><div className={s.check_out ? "text-muted-foreground" : "text-brand"}>{s.check_out ? `${Number(s.hours ?? 0).toFixed(1)} hours` : "On duty"}</div></div>
      </div>)}</div>}
  </div>;
}
