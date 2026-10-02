import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, CheckCircle2, CloudOff, Loader2, LogIn, LogOut, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { db, Empty, enqueueTask, flushQueue, Kpi, num, railHead, readQueue, rows, today, useRailRoles } from "@/lib/rail-ui";
import { capturePhoto } from "@/lib/native-camera";
import { checkCoachCleanliness } from "@/lib/rail-ai-clean.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/rail/me")({
  head: () => railHead("My Day", "Your cleaning tasks for today, attendance, quality score and pay — works offline."),
  component: MePage,
});

type Task = { id: string; task_name: string; status: string; event_coach_id: string;
  rail_event_coaches: { position: number; rail_coaches: { coach_number: string } | null; rail_coach_types: { code: string } | null; rail_events: { event_date: string; rail_trains: { number: string } | null } | null } | null };
type Person = { id: string; full_name: string; home_location_id: string | null; daily_wage: number | null; skill: string };
const CACHE = (uid: string) => `rail.me.tasks.v2.${uid}`;

// Shrink camera photos to ~1024px JPEG before sending (keeps upload ~150-250 KB).
async function shrink(dataUrl: string): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  const context = c.getContext("2d");
  if (!context) throw new Error("Could not prepare the photo. Please try again.");
  context.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.75);
}

function MePage() {
  const qc = useQueryClient();
  const { data: roles, isLoading: rolesLoading } = useRailRoles();
  const runAi = useServerFn(checkCoachCleanliness);
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<{ task: Task; photo: string; score: number | null; verdict: string; summary: string; issues: string[] } | null>(null);

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

  async function markDone(t: Task) {
    const label = `${t.rail_event_coaches?.rail_events?.rail_trains?.number} coach ${t.rail_event_coaches?.position} · ${t.task_name}`;
    
    // 1. Capture photo
    const raw = await capturePhoto({ title: `After photo: ${t.task_name}` });
    if (!raw) return;

    setBusy(t.id);
    try {
      const photo = await shrink(raw);
      let aiScore: number | null = null;
      let verdict = "offline";
      let summary = "Photo saved on this phone. Scoring will require a connection.";
      let issues: string[] = [];

      // 2. AI Scoring (only if online, else queue for later)
      if (online) {
        try {
          const area = t.task_name.toLowerCase().includes("toilet") ? "toilet" : "floor";
          const res = await runAi({ data: { imageDataUrl: photo, area, eventCoachId: t.event_coach_id } });
          aiScore = res.score;
          verdict = res.verdict;
          summary = res.summary;
          issues = res.issues;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Photo scoring unavailable");
          return;
        }
      }

      setEvidence({ task: t, photo, score: aiScore, verdict, summary, issues });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to complete task");
    } finally {
      setBusy(null);
    }
  }

  async function confirmDone() {
    if (!evidence || evidence.verdict === "dirty") return;
    const { task, photo, score } = evidence;
    const label = `${task.rail_event_coaches?.rail_events?.rail_trains?.number ?? "Train"} coach ${task.rail_event_coaches?.position} · ${task.task_name}`;
    enqueueTask({ task_id: task.id, label, photo_data: photo, ai_score: score ?? undefined });
    setEvidence(null);
    setDone((s) => new Set(s).add(task.id));
    setQueued(readQueue().length);
    if (!online) { toast("Saved on this phone — waiting to sync and score when online"); return; }
    const n = await flushQueue();
    setQueued(readQueue().length);
    if (n) { toast.success("Task completed. Supervisor can review it."); void qc.invalidateQueries({ queryKey: ["rail-me-tasks"] }); }
    else toast.error("Photo could not be stored. Completion is waiting on this phone; keep the app data.");
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

      <div className="space-y-2">
        <div className="text-sm font-medium">Today's tasks</div>
        {!open.length ? <Empty title="No tasks waiting" hint="Your supervisor's assignments appear here." /> : open.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4">
            <div>
              <div className="font-medium">{t.task_name}</div>
              <div className="text-xs text-muted-foreground">Train {t.rail_event_coaches?.rail_events?.rail_trains?.number} · Coach {t.rail_event_coaches?.position} {t.rail_event_coaches?.rail_coach_types?.code} {t.rail_event_coaches?.rail_coaches?.coach_number}</div>
            </div>
            <Button 
              size="lg" 
              disabled={busy === t.id}
              onClick={() => t.status === "pending" ? void accept(t) : markDone(t)}
            >
              {busy === t.id ? <Loader2 className="h-5 w-5 animate-spin" /> : 
               t.status === "pending" ? "Start task" : 
               <><Camera className="mr-2 h-5 w-5" />Complete</>}
            </Button>
          </div>
        ))}
      </div>
      <Dialog open={!!evidence} onOpenChange={(v) => !v && setEvidence(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader><DialogTitle>Review after-cleaning photo</DialogTitle></DialogHeader>
          {evidence && <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{evidence.task.task_name} · Coach {evidence.task.rail_event_coaches?.position}</p>
            <img src={evidence.photo} alt="After-cleaning evidence" className="max-h-56 w-full rounded-lg object-contain" />
            <div role="status" className="text-sm"><strong>{evidence.score === null ? "Not scored yet" : `${evidence.score}/10 · ${evidence.verdict === "clean" ? "Clean" : evidence.verdict === "dirty" ? "Clean again" : "Needs attention"}`}</strong><p className="mt-1 text-muted-foreground">{evidence.summary}</p>{evidence.issues.length > 0 && <p className="mt-1 text-muted-foreground">{evidence.issues.join(" · ")}</p>}</div>
            <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => { const t = evidence.task; setEvidence(null); void markDone(t); }}><RotateCcw className="mr-2 h-4 w-4" />Retake photo</Button><Button disabled={evidence.verdict === "dirty" || evidence.verdict === "offline"} onClick={() => void confirmDone()}><CheckCircle2 className="mr-2 h-4 w-4" />Complete task</Button></div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
