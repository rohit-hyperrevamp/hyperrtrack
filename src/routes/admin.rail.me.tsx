import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CloudOff, LogIn, LogOut, RefreshCw, ScanEye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { db, Empty, enqueueTask, flushQueue, Kpi, num, railHead, readQueue, rows, today, useRailRoles } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail/me")({
  head: () => railHead("My Day", "Your cleaning tasks for today, attendance, quality score and pay — works offline."),
  component: MePage,
});

type Task = { id: string; task_name: string; status: string; event_coach_id: string;
  rail_event_coaches: { position: number; rail_coaches: { coach_number: string } | null; rail_coach_types: { code: string } | null; rail_events: { event_date: string; rail_trains: { number: string } | null } | null } | null };
type Person = { id: string; full_name: string; home_location_id: string | null; daily_wage: number | null; skill: string };
const CACHE = (uid: string) => `rail.me.tasks.v2.${uid}`;

function MePage() {
  const qc = useQueryClient();
  const { data: roles, isLoading: rolesLoading } = useRailRoles();
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOnline(navigator.onLine); setQueued(readQueue().length);
    const on = async () => { setOnline(true); const n = await flushQueue(); if (n) { toast.success(`${n} offline task(s) synced`); qc.invalidateQueries({ queryKey: ["rail-me-tasks"] }); } setQueued(readQueue().length); };
    const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    void on();
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [qc]);

  const { data: me } = useQuery({
    queryKey: ["rail-me-person"],
    queryFn: async () => {
      const { data: mob } = await db.rpc("rail_my_mobile");
      if (!mob) return null;
      const [p] = await rows<Person>(db.from("rail_people").select("id,full_name,home_location_id,daily_wage,skill").eq("mobile", mob));
      return p ?? null;
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["rail-me-tasks", me?.id],
    enabled: !!me && !!roles?.some((r) => r.role_key === "cleaner") && !roles?.some((r) => r.role_key === "super_admin"),
    queryFn: async () => {
      try {
        const { data: auth } = await db.auth.getUser();
        const uid = auth?.user?.id;
        if (!uid) return [];
        const t = await rows<Task>(db.from("rail_event_tasks")
          .select("id,task_name,status,event_coach_id,rail_event_coaches!inner(position,rail_coaches(coach_number),rail_coach_types(code),rail_events!inner(event_date,rail_trains(number)))")
          .eq("assigned_to", uid).eq("rail_event_coaches.rail_events.event_date", today()).in("status", ["pending", "in_progress"]).limit(200));
        localStorage.setItem(CACHE(uid), JSON.stringify(t));
        return t;
      } catch {
        const { data: auth } = await db.auth.getUser();
        const uid = auth?.user?.id;
        if (!uid) return [];
        try { return JSON.parse(localStorage.getItem(CACHE(uid)) ?? "[]") as Task[]; } catch { return []; }
      }
    },
  });

  const { data: att } = useQuery({
    queryKey: ["rail-me-att", me?.id],
    enabled: !!me,
    queryFn: async () => (await rows<{ id: string; check_in: string | null; check_out: string | null }>(db.from("rail_attendance").select("id,check_in,check_out").eq("person_id", me!.id).eq("work_date", today())))[0] ?? null,
  });

  const { data: stats } = useQuery({
    queryKey: ["rail-me-stats"],
    queryFn: async () => {
      const { data: u } = await db.auth.getUser();
      const uid = u?.user?.id;
      const mine = await rows<{ status: string; event_coach_id: string }>(db.from("rail_event_tasks").select("status,event_coach_id").eq("completed_by", uid).gte("completed_at", new Date(Date.now() - 30 * 864e5).toISOString()));
      return { tasks30: mine.length };
    },
  });

  function markDone(t: Task) {
    const label = `${t.rail_event_coaches?.rail_events?.rail_trains?.number} coach ${t.rail_event_coaches?.position} · ${t.task_name}`;
    enqueueTask({ task_id: t.id, label });
    setDone((s) => new Set(s).add(t.id));
    setQueued(readQueue().length);
    if (navigator.onLine) void flushQueue().then((n) => { setQueued(readQueue().length); if (n) qc.invalidateQueries({ queryKey: ["rail-me-tasks"] }); });
    else toast("Saved on phone — will sync when online");
  }

  async function accept(t: Task) {
    const { error } = await db.rpc("rail_accept_task", { _task: t.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Task accepted");
    void qc.invalidateQueries({ queryKey: ["rail-me-tasks"] });
  }

  async function punch(kind: "in" | "out") {
    if (!me) return;
    if (kind === "in") {
      const { error } = await db.from("rail_attendance").insert({ person_id: me.id, location_id: me.home_location_id, work_date: today(), check_in: new Date().toISOString() });
      if (error) toast.error(error.message); else toast.success("Checked in");
    } else if (att) {
      const { error } = await db.from("rail_attendance").update({ check_out: new Date().toISOString() }).eq("id", att.id);
      if (error) toast.error(error.message); else toast.success("Checked out");
    }
    qc.invalidateQueries({ queryKey: ["rail-me-att"] });
  }

  const open = tasks.filter((t) => !done.has(t.id));
  if (rolesLoading) return <div className="p-6 text-sm text-muted-foreground">Loading your work…</div>;
  if (!roles?.some((r) => r.role_key === "cleaner") || roles.some((r) => r.role_key === "super_admin")) return <Empty title="No cleaning shift for this role" hint="Use Operations to assign work to cleaners." />;
  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div><div className="text-xs text-muted-foreground">My Day · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</div><h1 className="mt-1 font-heading text-xl font-semibold">{me?.full_name ?? "Today's work"}</h1></div>
        <div className="flex items-center gap-2 text-xs">
          {online ? <span className="text-success">Online</span> : <span className="flex items-center gap-1 text-warning"><CloudOff className="h-3 w-3" />Offline — work is saved on this phone</span>}
          {queued > 0 && <span className="rounded-md bg-warning/10 px-2 py-0.5 text-warning">{queued} waiting to sync</span>}
          {queued > 0 && online && <Button size="sm" variant="ghost" onClick={async () => { await flushQueue(); setQueued(readQueue().length); qc.invalidateQueries({ queryKey: ["rail-me-tasks"] }); }}><RefreshCw className="h-3 w-3" /></Button>}
        </div>
      </div>

      {me && (
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" className="h-14" disabled={!!att?.check_in} onClick={() => punch("in")}><LogIn className="mr-2 h-5 w-5" />{att?.check_in ? `In ${new Date(att.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Check in"}</Button>
          <Button size="lg" variant="outline" className="h-14" disabled={!att?.check_in || !!att?.check_out} onClick={() => punch("out")}><LogOut className="mr-2 h-5 w-5" />{att?.check_out ? "Done for today" : "Check out"}</Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Tasks left" value={open.length} />
        <Kpi label="Tasks (30 days)" value={num(stats?.tasks30)} />
        <Kpi label="Day wage" value={me?.daily_wage ? `₹${me.daily_wage}` : "—"} />
      </div>

      <Link to="/admin/rail/ai-check"><Button variant="outline" className="w-full h-12"><ScanEye className="mr-2 h-5 w-5" />Check cleanliness with camera</Button></Link>

      <div className="space-y-2">
        <div className="text-sm font-medium">Today's tasks</div>
        {!open.length ? <Empty title="No tasks waiting" hint="Your supervisor's assignments appear here." /> : open.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4">
            <div>
              <div className="font-medium">{t.task_name}</div>
              <div className="text-xs text-muted-foreground">Train {t.rail_event_coaches?.rail_events?.rail_trains?.number} · Coach {t.rail_event_coaches?.position} {t.rail_event_coaches?.rail_coach_types?.code} {t.rail_event_coaches?.rail_coaches?.coach_number}</div>
            </div>
            <Button size="lg" onClick={() => t.status === "pending" ? void accept(t) : markDone(t)}>{t.status === "pending" ? "Accept" : <><CheckCircle2 className="mr-2 h-5 w-5" />Done</>}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
