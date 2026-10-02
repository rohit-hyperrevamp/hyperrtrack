import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, CheckCircle2, ChevronLeft, ChevronRight, Send, TrainFront, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RailDateStepper, RailTopbarSlot } from "@/components/RailTopbar";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { logActivity } from "@/lib/activity-log";
import { db, Empty, Kpi, railHead, rows, rpc, StatusPill, today, useRailRoles, hasRole } from "@/lib/rail-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/rail/live")({
  head: () => railHead("Live Board", "Today's cleaning jobs by pit line: place rakes, track coaches and tasks, approve and release."),
  component: LiveBoard,
});

type Ev = {
  id: string; event_date: string; status: string; planned_start: string; planned_end: string; wash_method: string; location_id: string;
  rail_trains: { number: string; name: string } | null; rail_locations: { code: string; name: string } | null; rail_service_types: { code: string; name: string } | null;
};
type Coach = { id: string; position: number; status: string; rework_count: number; rate_fraction: number; rail_coaches: { coach_number: string } | null; rail_coach_types: { code: string } | null };
type Task = { id: string; event_coach_id: string; task_name: string; status: string; assigned_to: string | null; completed_offline: boolean };

function shiftDate(d: string, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); }

function LiveBoard() {
  const qc = useQueryClient();
  const { data: roles } = useRailRoles();
  const [date, setDate] = useState(today());
  const [openId, setOpenId] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ["rail-events", date],
    queryFn: () => rows<Ev>(db.from("rail_events").select("id,event_date,status,planned_start,planned_end,wash_method,location_id,rail_trains(number,name),rail_locations(code,name),rail_service_types(code,name)").eq("event_date", date).is("deleted_at", null).order("planned_start")),
  });

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
    for (const e of events ?? []) {
      const k = e.rail_locations?.code ?? "—";
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of events ?? []) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, [events]);

  const canPlan = hasRole(roles, "project_head", "depot_manager", "shift_supervisor");

  return (
    <div className="space-y-5">
      <RailTopbarSlot>
        <RailDateStepper value={date} onChange={setDate} />
        {canPlan && <button type="button" onClick={plan} disabled={planning} className="rail-topbar-tab is-active shrink-0 gap-1.5"><CalendarPlus className="h-4 w-4" />Plan day</button>}
      </RailTopbarSlot>
      <PageHeader title="Live Board" description="Every cleaning job for the day, by pit line." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {["planned", "placed", "in_progress", "completed", "approved", "released"].map((s) => (
          <Kpi key={s} label={s.replace("_", " ")} value={counts[s] ?? 0} />
        ))}
      </div>

      {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : !events?.length ? (
        <Empty title="No cleaning jobs for this day" hint="Plan the day to create jobs from train schedules, coach lists and task templates." action={canPlan ? <Button onClick={plan}><CalendarPlus className="mr-2 h-4 w-4" />Plan day</Button> : undefined} />
      ) : (
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-2 grid grid-cols-[120px_1fr] text-xs text-muted-foreground">
            <div />
            <div className="flex justify-between">{Array.from({ length: 13 }, (_, i) => <span key={i}>{String(i * 2).padStart(2, "0")}:00</span>)}</div>
          </div>
          <div className="space-y-2">
            {byLine.map(([line, evs]) => (
              <div key={line} className="grid grid-cols-[120px_1fr] items-center">
                <div className="text-sm font-medium">{line}</div>
                <div className="relative h-12 rounded-lg bg-muted/40">
                  {evs.map((e) => {
                    const s = new Date(e.planned_start), en = new Date(e.planned_end);
                    const left = ((s.getHours() * 60 + s.getMinutes()) / 1440) * 100;
                    const width = Math.max(4, ((en.getTime() - s.getTime()) / 60000 / 1440) * 100);
                    return (
                      <button key={e.id} onClick={() => setOpenId(e.id)}
                        className={cn("absolute top-1 bottom-1 rounded-md border px-2 text-left text-xs overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring",
                           e.status === "released" ? "bg-success/15 text-foreground border-success/40" : e.status === "approved" ? "bg-success/10 border-success/30" :
                           e.status === "in_progress" ? "bg-warning/10 border-warning/30" : e.status === "completed" ? "bg-accent/10 border-accent/30" : "bg-background")}
                        style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}>
                        <div className="font-semibold truncate">{e.rail_trains?.number} · {e.rail_service_types?.code}</div>
                        <div className="truncate opacity-80">{e.status.replace("_", " ")}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
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

  const { data } = useQuery({
    queryKey: ["rail-event", id],
    enabled: !!id,
    queryFn: async () => {
      const [ev] = await rows<Ev>(db.from("rail_events").select("id,event_date,status,planned_start,planned_end,wash_method,location_id,rail_trains(number,name),rail_locations(code,name),rail_service_types(code,name)").eq("id", id));
      const coaches = await rows<Coach>(db.from("rail_event_coaches").select("id,position,status,rework_count,rate_fraction,rail_coaches(coach_number),rail_coach_types(code)").eq("event_id", id).order("position"));
      const tasks = await rows<Task>(db.from("rail_event_tasks").select("id,event_coach_id,task_name,status,assigned_to,completed_offline").eq("event_id", id));
      return { ev, coaches, tasks };
    },
  });
  useEffect(() => { setRemoved(new Set()); setSelected(null); }, [id]);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["rail-event", id] }); qc.invalidateQueries({ queryKey: ["rail-events", date] }); };
  const ev = data?.ev;
  const canInspect = hasRole(roles, "project_head", "depot_manager", "shift_supervisor", "railway_checker");
  const canRelease = hasRole(roles, "project_head", "depot_manager", "shift_supervisor");

  async function place() {
    const r = await rpc("rail_place_rake", { _event: id, _removed: [...removed], _reason: "Not in rake on arrival" }, "Rake placed");
    if (r !== null) { void logActivity({ module: "Rail Live Board", action: "place_rake", entityType: "rail_events", entityId: id!, details: { removed: removed.size } }); refresh(); }
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
    const remarks = pass ? null : window.prompt("Reason for rejection?") ?? "Not clean";
    const r = await rpc("rail_review_coach", { _coach: coachId, _pass: pass, _remarks: remarks }, pass ? "Coach approved" : "Coach sent back for rework");
    if (r !== null) { void logActivity({ module: "Rail Live Board", action: pass ? "approve_coach" : "reject_coach", entityType: "rail_event_coaches", entityId: coachId }); refresh(); }
  }
  async function release() {
    const r = await rpc("rail_release_event", { _event: id }, "Rake released");
    if (r !== null) { void logActivity({ module: "Rail Live Board", action: "release", entityType: "rail_events", entityId: id! }); refresh(); }
  }

  const coachTasks = (cid: string) => data?.tasks.filter((t) => t.event_coach_id === cid) ?? [];

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><TrainFront className="h-5 w-5" />{ev?.rail_trains?.number} {ev?.rail_trains?.name}</SheetTitle>
        </SheetHeader>
        {ev && data && (
          <div className="mt-4 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <StatusPill s={ev.status} />
              <span className="text-muted-foreground">{ev.rail_service_types?.name} · {ev.rail_locations?.name}</span>
              <span className="text-muted-foreground">{new Date(ev.planned_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{new Date(ev.planned_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm items-center">
              <span className="text-muted-foreground">Wash:</span>
              {["manual", "acwp", "none"].map((m) => (
                <Button key={m} size="sm" variant={ev.wash_method === m ? "default" : "outline"} onClick={() => setMethod(m)}>{m === "acwp" ? "Auto wash plant" : m}</Button>
              ))}
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">Coaches {ev.status === "planned" && <span className="text-muted-foreground font-normal">— tap a coach that is missing from the rake, then Place rake</span>}</div>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {data.coaches.map((c) => (
                  <button key={c.id}
                    onClick={() => ev.status === "planned" ? setRemoved((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }) : setSelected(c.id)}
                    className={cn("min-w-[64px] rounded-md border px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-ring",
                      removed.has(c.id) && "opacity-40 line-through",
                      selected === c.id && "ring-2 ring-primary",
                       c.status === "approved" ? "bg-success/10" : c.status === "rejected" ? "bg-destructive/10" : c.status === "done" ? "bg-accent/10" : c.status === "in_progress" ? "bg-warning/10" : c.status === "removed" ? "bg-muted line-through" : "bg-background")}>
                    <div className="font-semibold">{c.position}. {c.rail_coach_types?.code}</div>
                    <div className="opacity-70">{c.rail_coaches?.coach_number ?? "—"}</div>
                  </button>
                ))}
              </div>
              {ev.status === "planned" && <Button onClick={place}>Place rake{removed.size ? ` (${removed.size} removed)` : ""}</Button>}
            </div>

            {selected && (() => {
              const c = data.coaches.find((x) => x.id === selected)!;
              return (
                <div className="rounded-xl border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Coach {c.position} · {c.rail_coach_types?.code} {c.rail_coaches?.coach_number}</div>
                    <div className="flex items-center gap-2"><StatusPill s={c.status} />{c.rework_count > 0 && <span className="text-xs text-destructive">Rework ×{c.rework_count}</span>}</div>
                  </div>
                  <ul className="divide-y">
                    {coachTasks(c.id).map((t) => (
                      <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                        <span>{t.task_name}{t.completed_offline && <span className="ml-2 text-xs text-muted-foreground">(synced from offline)</span>}</span>
                         {t.status === "done" ? <CheckCircle2 className="h-4 w-4 text-success" /> : t.status === "skipped" ? <span className="text-xs text-muted-foreground">skipped</span> :
                          <Button size="sm" variant="outline" onClick={() => complete(t)}>Mark done</Button>}
                      </li>
                    ))}
                  </ul>
                  {canInspect && c.status === "done" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => review(c.id, true)}><CheckCircle2 className="mr-1 h-4 w-4" />Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => review(c.id, false)}><XCircle className="mr-1 h-4 w-4" />Reject</Button>
                    </div>
                  )}
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
