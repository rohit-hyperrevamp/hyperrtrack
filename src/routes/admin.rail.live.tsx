import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, CheckCircle2, ChevronRight, CircleCheck, Clock3, MapPin, Play, Send, ShieldCheck, TrainFront, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RailDateStepper, RailTopbarSlot } from "@/components/RailTopbar";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { logActivity } from "@/lib/activity-log";
import { db, Empty, railHead, rows, rpc, StatusPill, today, useRailRoles, hasRole } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail/live")({
  head: () => railHead("Operations", "Today's cleaning jobs by pit line: place rakes, track coaches and tasks, approve and release."),
  validateSearch: (search: Record<string, unknown>): { depot?: string; date?: string } => ({
    depot: typeof search.depot === "string" ? search.depot : undefined,
    date: typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date) ? search.date : undefined,
  }),
  component: LiveBoard,
});

type Loc = { id: string; name: string; code: string; type: string; parent_id: string | null };
type Ev = {
  id: string; event_date: string; status: string; planned_start: string; planned_end: string; wash_method: string; location_id: string;
  rail_trains: { number: string; name: string } | null; rail_locations: { code: string; name: string } | null; rail_service_types: { code: string; name: string } | null;
};
type Coach = { id: string; position: number; status: string; rework_count: number; rate_fraction: number; rail_coaches: { coach_number: string } | null; rail_coach_types: { code: string } | null };
type Task = { id: string; event_coach_id: string; task_name: string; status: string; assigned_to: string | null; accepted_at: string | null; completed_offline: boolean };

function shiftDate(d: string, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); }

function LiveBoard() {
  const qc = useQueryClient();
  const search = Route.useSearch();
  const { data: roles } = useRailRoles();
  const [date, setDate] = useState(search.date ?? today());
  const [depot, setDepot] = useState(search.depot ?? "");
  const [openId, setOpenId] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["rail-events", date],
    queryFn: () => rows<Ev>(db.from("rail_events").select("id,event_date,status,planned_start,planned_end,wash_method,location_id,rail_trains(number,name),rail_locations(code,name),rail_service_types(code,name)").eq("event_date", date).is("deleted_at", null).order("planned_start")),
  });
  const { data: locations = [] } = useQuery({
    queryKey: ["rail-live-locations"],
    queryFn: () => rows<Loc>(db.from("rail_locations").select("id,name,code,type,parent_id").is("deleted_at", null)),
  });
  useEffect(() => { if (search.depot) setDepot(search.depot); }, [search.depot]);
  useEffect(() => { if (search.date) setDate(search.date); }, [search.date]);
  const depots = locations.filter((l) => l.type === "depot" || l.type === "station").sort((a, b) => a.name.localeCompare(b.name));
  const selectedDepot = depots.find((l) => l.id === depot);
  const scopedLocationIds = useMemo(() => {
    if (!depot) return null;
    const ids = new Set([depot]);
    for (let i = 0; i < locations.length; i++) {
      for (const l of locations) if (l.parent_id && ids.has(l.parent_id)) ids.add(l.id);
    }
    return ids;
  }, [depot, locations]);
  const scopedEvents = useMemo(() => (events ?? []).filter((e) => !scopedLocationIds || scopedLocationIds.has(e.location_id)), [events, scopedLocationIds]);

  // Keyboard: ← / → change day, P plans the day, Esc closes
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select")) return;
      if (e.key === "ArrowLeft") setDate((d) => shiftDate(d, -1));
      if (e.key === "ArrowRight") setDate((d) => shiftDate(d, 1));
      if (e.key.toLowerCase() === "p" && !e.metaKey && !e.ctrlKey) void plan();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function plan() {
    setPlanning(true);
    const n = await rpc<number>("rail_plan_day", { _date: date });
    setPlanning(false);
    if (n !== null) {
      toast.success(n ? `${n} cleaning job(s) created` : "Day already planned");
      void logActivity({ module: "Rail Live Board", action: "plan_day", entityType: "rail_events", entityLabel: date, details: { created: n } });
      qc.invalidateQueries({ queryKey: ["rail-events", date] });
    }
  }

  const byLine = useMemo(() => {
    const m = new Map<string, Ev[]>();
    for (const e of scopedEvents) {
      if (statusFilter && e.status !== statusFilter) continue;
      const k = e.rail_locations?.code ?? "—";
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [scopedEvents, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of scopedEvents) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, [scopedEvents]);

  const canPlan = hasRole(roles, "project_head", "depot_manager", "shift_supervisor");
  const statuses = [
    { key: "planned", label: "Planned", icon: Clock3 },
    { key: "placed", label: "Placed", icon: MapPin },
    { key: "in_progress", label: "In progress", icon: Play },
    { key: "completed", label: "Completed", icon: CircleCheck },
    { key: "approved", label: "Approved", icon: ShieldCheck },
    { key: "released", label: "Released", icon: Send },
  ];
  const time = (value: string) => new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-5">
      <RailTopbarSlot>
        <RailDateStepper value={date} onChange={setDate} />
        {canPlan && <Button type="button" onClick={plan} disabled={planning} className="rail-topbar-tab is-active shrink-0 gap-1.5"><CalendarPlus className="h-4 w-4" />Plan day</Button>}
      </RailTopbarSlot>
       <PageHeader title="Operations" description={selectedDepot ? `${selectedDepot.name} · cleaning jobs` : "Every cleaning job for the day, by pit line."} />
       <div className="flex flex-wrap items-center gap-3"><label htmlFor="rail-live-depot" className="text-sm font-medium">Depot</label><select id="rail-live-depot" className="h-10 min-w-48 max-w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground" value={depot} onChange={(e) => { setDepot(e.target.value); setStatusFilter(null); }}><option value="">All depots</option>{depots.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>

       <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" aria-label="Filter cleaning jobs by status">
         {statuses.map(({ key, label, icon: Icon }) => (
           <Button key={key} type="button" variant="ghost" aria-pressed={statusFilter === key} onClick={() => setStatusFilter((current) => current === key ? null : key)}
             className="rail-live-summary flex h-auto min-h-24 min-w-0 items-center justify-start gap-3 whitespace-normal px-3 py-3 text-left shadow-none sm:min-h-28 sm:px-4" data-status={key}>
             <span className="rail-live-summary-icon grid h-10 w-10 shrink-0 place-items-center rounded-full"><Icon className="h-5 w-5" /></span>
             <span className="min-w-0"><span className="block text-xl font-semibold tabular-nums sm:text-2xl">{counts[key] ?? 0}</span><span className="block text-xs font-medium sm:text-sm">{label}</span></span>
           </Button>
         ))}
      </div>

       {isLoading ? <Skeleton className="h-64 w-full rounded-lg" /> : !scopedEvents.length ? (
         <Empty title={selectedDepot ? `No cleaning jobs at ${selectedDepot.name}` : "No cleaning jobs for this day"} hint={selectedDepot ? "Try a different day or depot." : "Plan the day to create jobs from train schedules, coach lists and task templates."} action={selectedDepot ? <Button variant="outline" onClick={() => setDepot("")}>All depots</Button> : canPlan ? <Button onClick={plan}><CalendarPlus className="mr-2 h-4 w-4" />Plan day</Button> : undefined} />
      ) : (
         <section className="min-w-0" aria-label="Cleaning jobs">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">Cleaning jobs <span className="ml-1 text-sm font-normal text-muted-foreground">{statusFilter ? `${counts[statusFilter] ?? 0} ${statusFilter.replace("_", " ")}` : `${scopedEvents.length} total`}</span></h2>
             {statusFilter && <Button variant="ghost" size="sm" onClick={() => setStatusFilter(null)}>Show all</Button>}
           </div>
           {byLine.length === 0 ? <Empty title="No jobs in this status" hint="Choose another status or show all cleaning jobs." action={<Button variant="outline" onClick={() => setStatusFilter(null)}>Show all</Button>} /> : <div className="space-y-5">
            {byLine.map(([line, evs]) => (
               <div key={line} className="overflow-hidden rounded-lg border border-border bg-card">
                 <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold"><MapPin className="h-4 w-4 text-brand" />{evs[0]?.rail_locations?.name ?? line}<span className="ml-auto text-xs font-medium text-muted-foreground">{evs.length} {evs.length === 1 ? "job" : "jobs"}</span></div>
                 <div>
                   {evs.map((e) => {
                     const Icon = statuses.find((s) => s.key === e.status)?.icon ?? Clock3;
                     return <Button key={e.id} variant="ghost" data-status={e.status} onClick={() => setOpenId(e.id)}
                        className="rail-live-row flex h-auto min-h-[76px] w-full items-center justify-start gap-3 rounded-none px-4 py-3 text-left last:border-b-0 sm:gap-4">
                       <span className="rail-live-row-icon grid h-10 w-10 shrink-0 place-items-center rounded-full"><Icon className="h-5 w-5" /></span>
                       <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground sm:text-base">{e.rail_trains?.number ?? "Train"} <span className="font-normal text-muted-foreground">{e.rail_trains?.name}</span></span><span className="block truncate text-xs text-muted-foreground">{e.rail_service_types?.name ?? e.rail_service_types?.code ?? "Cleaning"}</span></span>
                       <span className="hidden shrink-0 text-sm tabular-nums text-foreground sm:block">{time(e.planned_start)} – {time(e.planned_end)}</span>
                        <span className="rail-live-row-status shrink-0 rounded-md px-2 py-1 text-xs font-semibold capitalize sm:min-w-24 sm:text-center">{e.status.replace("_", " ")}</span>
                       <ChevronRight className="h-4 w-4 shrink-0 text-brand" />
                     </Button>;
                   })}
                </div>
              </div>
            ))}
           </div>}
         </section>
      )}

      <EventSheet id={openId} onClose={() => setOpenId(null)} date={date} />
    </div>
  );
}

function EventSheet({ id, onClose, date }: { id: string | null; onClose: () => void; date: string }) {
  const qc = useQueryClient();
  const { data: roles } = useRailRoles();
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const { data: workers = [] } = useQuery({
    queryKey: ["rail-assignable-cleaners"], enabled: !!id,
    queryFn: async () => {
      const [people, users] = await Promise.all([
        rows<{ mobile: string; full_name: string; scope_type: string; scope_location_id: string | null; enabled: boolean }>(db.from("rail_people").select("mobile,full_name,scope_type,scope_location_id,enabled").eq("role_key", "cleaner").eq("enabled", true)),
        rows<{ mobile: string; user_id: string }>(db.rpc("rail_people_users")),
      ]);
      return people.flatMap((person) => { const user = users.find((u) => u.mobile === person.mobile); return user ? [{ ...person, user_id: user.user_id }] : []; });
    },
  });

  const { data } = useQuery({
    queryKey: ["rail-event", id],
    enabled: !!id,
    queryFn: async () => {
      const [ev] = await rows<Ev>(db.from("rail_events").select("id,event_date,status,planned_start,planned_end,wash_method,location_id,rail_trains(number,name),rail_locations(code,name),rail_service_types(code,name)").eq("id", id));
      const coaches = await rows<Coach>(db.from("rail_event_coaches").select("id,position,status,rework_count,rate_fraction,rail_coaches(coach_number),rail_coach_types(code)").eq("event_id", id).order("position"));
      const tasks = await rows<Task>(db.from("rail_event_tasks").select("id,event_coach_id,task_name,status,assigned_to,accepted_at,completed_offline").eq("event_id", id));
      return { ev, coaches, tasks };
    },
  });
  useEffect(() => { setRemoved(new Set()); setSelected(null); setRejecting(false); setRejectionReason(""); }, [id]);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["rail-event", id] }); qc.invalidateQueries({ queryKey: ["rail-events", date] }); };
  const ev = data?.ev;
  const canInspect = hasRole(roles, "project_head", "depot_manager", "shift_supervisor", "railway_checker");
  const canRelease = hasRole(roles, "project_head", "depot_manager", "shift_supervisor");
  const canAssign = hasRole(roles, "super_admin", "project_head", "depot_manager", "shift_supervisor");
  async function assign(t: Task, uid: string) {
    if (!uid) return;
    const { error } = await db.rpc("rail_assign_task", { _task: t.id, _assignee: uid });
    if (error) { toast.error(error.message); return; }
    toast.success("Work assigned");
    void logActivity({ module: "Rail Operations", action: "assign_task", entityType: "rail_event_tasks", entityId: t.id });
    refresh();
  }
  async function autoAssign(t: Task) {
    const { data: picks, error } = await db.rpc("rail_suggest_cleaners", { _task: t.id });
    if (error) { toast.error(error.message); return; }
    const best = (picks ?? [])[0] as { user_id: string; full_name: string; present: boolean; open_tasks: number } | undefined;
    if (!best) { toast.error("No signed-in cleaner is available for this depot"); return; }
    if (!window.confirm(`Assign to ${best.full_name}? ${best.present ? "On duty" : "Not checked in"} · ${best.open_tasks} open tasks`)) return;
    await assign(t, best.user_id);
  }

  async function place() {
    const r = await rpc("rail_place_rake", { _event: id, _removed: [...removed], _reason: "Not in rake on arrival" }, "Rake placed");
    if (r !== null) { void logActivity({ module: "Rail Live Board", action: "place_rake", entityType: "rail_events", entityId: id ?? undefined, details: { removed: removed.size } }); refresh(); }
  }
  async function setMethod(m: string) {
    const { error } = await db.from("rail_events").update({ wash_method: m }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Wash method updated"); refresh(); }
  }
  async function complete(t: Task) {
    const r = await rpc("rail_complete_task", { _task: t.id });
    if (r !== null) refresh();
  }
  async function review(coachId: string, pass: boolean) {
    const remarks = pass ? null : rejectionReason.trim();
    if (!pass && !remarks) { toast.error("Enter a reason for rework"); return; }
    const r = await rpc("rail_review_coach", { _coach: coachId, _pass: pass, _remarks: remarks }, pass ? "Coach approved" : "Coach sent back for rework");
    if (r !== null) { setRejecting(false); setRejectionReason(""); void logActivity({ module: "Rail Live Board", action: pass ? "approve_coach" : "reject_coach", entityType: "rail_event_coaches", entityId: coachId }); refresh(); }
  }
  async function release() {
    const r = await rpc("rail_release_event", { _event: id }, "Rake released");
    if (r !== null) { void logActivity({ module: "Rail Live Board", action: "release", entityType: "rail_events", entityId: id ?? undefined }); refresh(); }
  }

  const coachTasks = (cid: string) => data?.tasks.filter((t) => t.event_coach_id === cid) ?? [];

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent aria-describedby={undefined} className="rail-event-dialog w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-primary-foreground"><TrainFront className="h-4 w-4" /></span><span className="truncate">{ev?.rail_trains?.number} {ev?.rail_trains?.name}</span></SheetTitle>
        </SheetHeader>
        {ev && data && (
          <div className="mt-5 space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-sm leading-relaxed">
              <StatusPill s={ev.status} />
              <span className="text-muted-foreground">{ev.rail_service_types?.name} · {ev.rail_locations?.name}</span>
              <span className="text-muted-foreground">{new Date(ev.planned_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{new Date(ev.planned_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold">Wash method</div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Wash method">
                {["manual", "acwp", "none"].map((m) => (
                  <Button key={m} size="sm" aria-pressed={ev.wash_method === m} variant={ev.wash_method === m ? "default" : "outline"} onClick={() => setMethod(m)}>{m === "acwp" ? "Auto wash plant" : m === "none" ? "No wash" : "Manual"}</Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div><h3 className="text-sm font-semibold">Coaches <span className="font-normal text-muted-foreground">· {data.coaches.length}</span></h3><p className="text-xs text-muted-foreground">{ev.status === "planned" ? "Select coaches missing from the rake before placing it." : "Select a coach to see its tasks and review."}</p></div>
              <div className="rail-coach-grid grid max-h-52 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {data.coaches.map((c) => (
                  <Button key={c.id} type="button" variant="outline"
                    aria-pressed={ev.status === "planned" ? removed.has(c.id) : selected === c.id}
                    onClick={() => { if (ev.status === "planned") { setRemoved((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }); } else { setSelected(c.id); setRejecting(false); setRejectionReason(""); } }}
                    data-status={removed.has(c.id) ? "removed" : c.status}
                    className="rail-coach-option h-auto min-h-16 w-full flex-col items-start justify-center gap-0.5 rounded-lg border px-3 py-2 text-left text-xs">
                    <span className="w-full truncate font-semibold">{c.position}. {c.rail_coach_types?.code} · {c.rail_coaches?.coach_number ?? "—"}</span>
                    <span className="text-xs font-normal capitalize opacity-75">{removed.has(c.id) ? "Missing" : c.status.replace(/_/g, " ")}</span>
                  </Button>
                ))}
              </div>
              {ev.status === "planned" && <Button onClick={place} className="w-full sm:w-auto">Place rake{removed.size ? ` · ${removed.size} missing` : ""}</Button>}
            </div>

            {selected && (() => {
              const c = data.coaches.find((x) => x.id === selected);
              if (!c) return null;
              return (
                <div className="space-y-4 border-t border-border pt-5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Coach {c.position} · {c.rail_coach_types?.code} {c.rail_coaches?.coach_number}</div>
                    <div className="flex shrink-0 items-center gap-2"><StatusPill s={c.status} />{c.rework_count > 0 && <span className="text-xs text-destructive">Rework ×{c.rework_count}</span>}</div>
                  </div>
                  <ul className="divide-y divide-border border-y border-border">
                    {coachTasks(c.id).map((t) => (
                      <li key={t.id} className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="min-w-0 font-medium">{t.task_name}{t.completed_offline && <span className="ml-2 text-xs text-muted-foreground">(synced offline)</span>}</span>
                        {t.status === "done" ? <CheckCircle2 className="h-4 w-4 text-brand" /> : t.status === "skipped" ? <span className="text-xs text-muted-foreground">skipped</span> :
                          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                            {canAssign && <select aria-label={`Assign ${t.task_name}`} className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-2 text-sm sm:w-44" value={t.assigned_to ?? ""} onChange={(e) => void assign(t, e.target.value)}>
                              <option value="">Assign cleaner…</option>
                              {workers.filter((w) => w.scope_type === "all" || w.scope_location_id === ev.location_id || w.user_id === t.assigned_to).map((w) => <option key={w.user_id} value={w.user_id}>{w.full_name}</option>)}
                            </select>}
                            {canAssign && !t.assigned_to && <Button size="sm" variant="outline" onClick={() => void autoAssign(t)}>Best match</Button>}
                            <span className="text-xs text-muted-foreground">{t.accepted_at ? "Accepted" : t.assigned_to ? "Awaiting acceptance" : "Unassigned"}</span>
                          </div>}
                      </li>
                    ))}
                  </ul>
                  {canInspect && c.status === "done" && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => review(c.id, true)}><CheckCircle2 className="mr-1 h-4 w-4" />Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => setRejecting((v) => !v)}><XCircle className="mr-1 h-4 w-4" />Request rework</Button>
                    </div>
                  )}
                  {canInspect && c.status === "done" && rejecting && <div className="space-y-2"><Label htmlFor="rail-rework-reason">Reason for rework</Label><Textarea id="rail-rework-reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="What needs another clean?" /><Button size="sm" disabled={!rejectionReason.trim()} onClick={() => review(c.id, false)}>Send for rework</Button></div>}
                </div>
              );
            })()}

            {canRelease && ev.status === "approved" && <Button onClick={release}><Send className="mr-2 h-4 w-4" />Release rake</Button>}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
