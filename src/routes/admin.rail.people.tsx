import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logActivity } from "@/lib/activity-log";
import { downloadCsv } from "@/lib/csv-export";
import { db, Empty, railHead, rows, rpc, today } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail/people")({
  head: () => railHead("People & Logins", "Rail staff and railway checker logins with role, area of access, skill and wage; scorecards per cleaner and supervisor."),
  component: PeoplePage,
});

type P = { id: string; mobile: string; full_name: string; role_key: string; scope_type: string; scope_location_id: string | null; home_location_id: string | null; skill: string; daily_wage: number | null; enabled: boolean };
const blank = { mobile: "", name: "", role: "cleaner", scope: "depot", scope_location: "", home: "", skill: "unskilled", wage: "" };

function PeoplePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<typeof blank | null>(null);
  const [formStep, setFormStep] = useState(0);
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["rail-people"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const [people, roles, locs, tasks, insp, cons, auth] = await Promise.all([
        rows<P>(db.from("rail_people").select("*").order("full_name")),
        rows<{ key: string; name: string; is_external: boolean }>(db.from("rail_roles").select("key,name,is_external").order("sort_order")),
        rows<{ id: string; code: string; name: string; type: string }>(db.from("rail_locations").select("id,code,name,type").order("code")),
        rows<{ completed_by: string | null; event_coach_id: string; completed_at: string; standard_minutes: number }>(db.from("rail_event_tasks").select("completed_by,event_coach_id,completed_at,standard_minutes").eq("status", "done").gte("completed_at", since).limit(20000)),
        rows<{ event_coach_id: string; result: string; inspector_id: string | null }>(db.from("rail_inspections").select("event_coach_id,result,inspector_id").gte("created_at", since).limit(20000)),
        rows<{ event_coach_id: string; norm_qty: number; qty: number }>(db.from("rail_job_consumption").select("event_coach_id,norm_qty,qty").gte("created_at", since).limit(20000)),
        db.rpc("rail_people_users").then((r: { data: { mobile: string; user_id: string }[] | null }) => r.data ?? []),
      ]);
      const candidateIds = people.map((p) => p.mobile);
      const portraits = candidateIds.length ? await rows<{ mobile: string; photo_url: string | null }>(db.from("candidates").select("mobile,photo_url").in("mobile", candidateIds)) : [];
      return { people, roles, locs, tasks, insp, cons, auth, portraits };
    },
  });

  async function save() {
    if (!form) return;
    const id = await rpc<string>("rail_save_person", { _mobile: form.mobile, _name: form.name, _role: form.role, _scope: form.scope, _scope_location: form.scope_location || null, _home: form.home || null, _skill: form.skill, _wage: form.wage ? Number(form.wage) : null }, "Saved — they can now sign in with this mobile");
    if (id) { void logActivity({ module: "Rail People", action: "save_person", entityType: "rail_people", entityId: id, entityLabel: form.name, details: { role: form.role } }); setForm(null); qc.invalidateQueries({ queryKey: ["rail-people"] }); }
  }
  async function toggle(p: P) {
    const { error } = await db.from("rail_people").update({ enabled: !p.enabled }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.enabled ? "Login disabled" : "Login enabled");
    void logActivity({ module: "Rail People", action: p.enabled ? "disable" : "enable", entityType: "rail_people", entityId: p.id });
    qc.invalidateQueries({ queryKey: ["rail-people"] });
  }

  const roleName = (k: string) => data?.roles.find((r) => r.key === k)?.name ?? k;
  const locName = (id: string | null) => data?.locs.find((l) => l.id === id)?.name ?? "All places";
  const photoOf = (mobile: string) => data?.portraits.find((c) => c.mobile === mobile)?.photo_url;
  const list = (data?.people ?? []).filter((p) => !q || `${p.full_name} ${p.mobile} ${p.role_key}`.toLowerCase().includes(q.toLowerCase()));

  // Scorecards (last 30 days) — needs the person's sign-in id
  const uidOf = (mobile: string) => data?.auth.find((a: { mobile: string; user_id: string }) => a.mobile === mobile)?.user_id;
  const score = (p: P) => {
    const uid = uidOf(p.mobile);
    const t = uid ? data!.tasks.filter((x) => x.completed_by === uid) : [];
    const coaches = new Set(t.map((x) => x.event_coach_id));
    const ins = data!.insp.filter((i) => coaches.has(i.event_coach_id));
    const fp = ins.length ? Math.round((ins.filter((i) => i.result === "pass").length / ins.length) * 100) : null;
    const rework = ins.filter((i) => i.result === "fail").length;
    const c = data!.cons.filter((x) => coaches.has(x.event_coach_id));
    const norm = c.reduce((s, x) => s + Number(x.norm_qty), 0), act = c.reduce((s, x) => s + Number(x.qty), 0);
    const reviewed = uid ? data!.insp.filter((i) => i.inspector_id === uid).length : 0;
    return { tasks: t.length, coaches: coaches.size, fp, rework, variance: norm ? Math.round((act / norm - 1) * 100) : null, reviewed };
  };

  return (
    <div className="space-y-5">
      <RailTopbarSlot><Input className="min-w-44 max-w-60" aria-label="Search people" placeholder="Search people" value={q} onChange={(e) => setQ(e.target.value)} /><Button variant="outline" onClick={() => downloadCsv(`rail-people-${today()}`, list.map((p) => ({ name: p.full_name, mobile: p.mobile, role: roleName(p.role_key), area: locName(p.scope_location_id), skill: p.skill, daily_wage: p.daily_wage, enabled: p.enabled })))}>Export</Button><Button onClick={() => { setFormStep(0); setForm({ ...blank }); }}><UserPlus className="mr-2 h-4 w-4" />Add person</Button></RailTopbarSlot>
      <PageHeader title="People & Logins" description="Everyone signs in with their mobile number. Railway checkers get their own read-mostly login." />
      <Tabs defaultValue="people">
        <TabsList><TabsTrigger value="people">People</TabsTrigger><TabsTrigger value="scores">Scorecards</TabsTrigger></TabsList>
        <TabsContent value="people" className="space-y-3">
           {!list.length ? <Empty title="No people yet" hint="Add supervisors, cleaners and railway checkers so they can sign in." action={<Button onClick={() => { setFormStep(0); setForm({ ...blank }); }}>Add person</Button>} /> :
            <div className="divide-y rounded-2xl border bg-card">{list.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand/10 text-sm font-semibold text-brand">{photoOf(p.mobile) ? <img src={photoOf(p.mobile)!} alt={`${p.full_name} portrait`} className="h-full w-full object-cover" /> : p.full_name.split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase()}</span><div className="min-w-0"><div className="font-medium">{p.full_name} {!p.enabled && <span className="text-xs text-muted-foreground">(disabled)</span>}</div><div className="text-xs text-muted-foreground">{p.mobile} · {roleName(p.role_key)} · {p.scope_type === "all" ? "All places" : locName(p.scope_location_id)} · {p.skill.replace("_", "-")}{p.daily_wage ? ` · ₹${p.daily_wage}/day` : ""}</div></div></div>
                 <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setFormStep(0); setForm({ mobile: p.mobile, name: p.full_name, role: p.role_key, scope: p.scope_type, scope_location: p.scope_location_id ?? "", home: p.home_location_id ?? "", skill: p.skill, wage: p.daily_wage ? String(p.daily_wage) : "" }); }}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(p)}>{p.enabled ? "Disable" : "Enable"}</Button></div>
              </div>))}</div>}
        </TabsContent>
        <TabsContent value="scores">
          <div className="overflow-x-auto rounded-2xl border bg-card"><table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr className="border-b"><th className="p-3">Person</th><th>Tasks</th><th>Coaches</th><th>First-pass</th><th>Rework</th><th>Chemical vs norm</th><th>Coaches reviewed</th></tr></thead>
            <tbody>{(data?.people ?? []).filter((p) => ["cleaner", "shift_supervisor"].includes(p.role_key)).map((p) => { const s = score(p);
              return <tr key={p.id} className="border-b last:border-0"><td className="p-3 font-medium">{p.full_name}<div className="text-xs text-muted-foreground">{roleName(p.role_key)}</div></td><td>{s.tasks}</td><td>{s.coaches}</td><td>{s.fp === null ? "—" : `${s.fp}%`}</td><td className={s.rework ? "text-destructive" : ""}>{s.rework}</td><td className={s.variance !== null && s.variance > 25 ? "text-destructive" : ""}>{s.variance === null ? "—" : `${s.variance > 0 ? "+" : ""}${s.variance}%`}</td><td>{s.reviewed}</td></tr>; })}</tbody></table></div>
          <p className="mt-2 text-xs text-muted-foreground">Last 30 days. Scores appear after a person has signed in at least once.</p>
        </TabsContent>
      </Tabs>

      <Sheet open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <SheetContent className="overflow-y-auto">
           <SheetHeader><SheetTitle>{form?.name ? `Edit ${form.name}` : "Add person"}</SheetTitle></SheetHeader>
          {form && (
            <div className="mt-4 space-y-3">
               <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><span className={formStep === 0 ? "text-brand" : ""}>01 · Identity</span><span>→</span><span className={formStep === 1 ? "text-brand" : ""}>02 · Access & work</span></div>
               {formStep === 0 ? <>
              <div><Label>Mobile (10 digits)</Label><Input inputMode="numeric" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} /></div>
              <div><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
               <Button className="w-full" disabled={form.mobile.length !== 10 || !form.name.trim()} onClick={() => setFormStep(1)}>Continue</Button>
               </> : <>
              <div><Label>Role</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{data?.roles.filter((r) => r.key !== "super_admin").map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}</select></div>
              <div><Label>Can see</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>{[["all", "All places"], ["zone", "One zone"], ["division", "One division"], ["depot", "One depot"], ["line", "One pit line"], ["own", "Only own work"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
              {form.scope !== "all" && form.scope !== "own" && <div><Label>Which place</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.scope_location} onChange={(e) => setForm({ ...form, scope_location: e.target.value })}><option value="">Choose…</option>{data?.locs.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.type.replace("_", " ")})</option>)}</select></div>}
              <div><Label>Works at</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })}><option value="">—</option>{data?.locs.filter((l) => l.type === "depot" || l.type === "station").map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Skill</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })}>{["unskilled", "semi_skilled", "skilled", "highly_skilled"].map((s) => <option key={s} value={s}>{s.replace("_", "-")}</option>)}</select></div>
                <div><Label>Daily wage (₹)</Label><Input type="number" value={form.wage} onChange={(e) => setForm({ ...form, wage: e.target.value })} /></div>
              </div>
              <p className="text-xs text-muted-foreground">Sign-in: mobile number, then the last four digits as the code (test mode).</p>
               <div className="flex gap-2"><Button variant="outline" onClick={() => setFormStep(0)}>Back</Button><Button className="flex-1" onClick={save} disabled={form.mobile.length !== 10 || !form.name}>Save</Button></div>
               </>}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
