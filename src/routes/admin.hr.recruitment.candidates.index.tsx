import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Search, Users } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadCsv } from "@/lib/csv-export";
import { logActivity } from "@/lib/activity-log";
import {
  fetchCandidates, fetchOpenings, LOST, PAGE_SIZE, PIPELINE, QK, recDb, REC_MODULE, STAGES,
  stageLabel, stageTone, uploadResume, type RecCandidate,
} from "@/lib/recruitment";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { fetchMasters } from "@/lib/recruitment";

type Search = { stage?: string; q?: string };

export const Route = createFileRoute("/admin/hr/recruitment/candidates/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    stage: typeof s.stage === "string" ? s.stage : "",
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Recruitment Candidates — HyperTrack" },
      { name: "description", content: "Candidate records, applications and interview progress in HyperTrack." },
      { property: "og:title", content: "Recruitment Candidates — HyperTrack" },
      { property: "og:description", content: "Candidate records, applications and interview progress in HyperTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CandidatesPage,
});

function matchStage(c: RecCandidate, f: string) {
  if (!f) return c.stage !== "onboarded";
  if (f === "open") return ["new", "screening", "on_hold", "round_1", "round_2", "round_3", "hr_approved"].includes(c.stage);
  if (f === "pipeline") return PIPELINE.includes(c.stage);
  if (f === "lost") return LOST.includes(c.stage);
  return c.stage === f;
}

function CandidatesPage() {
  const { stage = "", q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/hr/recruitment/candidates/" });
  const cq = useQuery({ queryKey: QK.candidates, queryFn: fetchCandidates });
  const oq = useQuery({ queryKey: QK.openings, queryFn: fetchOpenings });
  const rolesQ = useQuery({ queryKey: ["rail", "recruitment-roles"], queryFn: async () => { const { data, error } = await supabase.from("rail_roles").select("key,name").order("name"); if (error) throw error; return data ?? []; } });
  const mastersQ = useQuery({ queryKey: QK.masters, queryFn: fetchMasters });
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);
  const openingTitle = new Map((oq.data ?? []).map((o) => [o.id, o.title]));

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (cq.data ?? []).filter((c) => matchStage(c, stage) && (!t || `${c.full_name} ${c.code} ${c.mobile} ${c.email}`.toLowerCase().includes(t)));
  }, [cq.data, stage, q]);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const setSearch = (patch: Search) => { setPage(0); navigate({ search: (p: Search) => ({ ...p, ...patch }) }); };

  return (
    <div className="space-y-4">
      <RailTopbarSlot>
        <Input className="h-10 w-56 shrink-0" aria-label="Search candidates" placeholder="Search candidates" value={q} onChange={(e) => setSearch({ q: e.target.value })} />
        <Select value={stage || "all"} onValueChange={(v) => setSearch({ stage: v === "all" ? "" : v })}>
          <SelectTrigger className="h-10 w-44 shrink-0" aria-label="Candidate status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All candidates</SelectItem><SelectItem value="open">In progress</SelectItem><SelectItem value="pending_onboarding">Awaiting approval</SelectItem><SelectItem value="lost">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-10 shrink-0" size="sm" onClick={() => downloadCsv("recruitment-candidates", rows.map((c) => ({
          code: c.code, name: c.full_name, mobile: c.mobile, email: c.email, position: c.offer?.operational_role_key ?? (c.opening_id ? openingTitle.get(c.opening_id) ?? "" : ""),
          stage: stageLabel(c.stage), source: c.source, experience: c.experience_years,
          current_ctc: c.current_ctc, expected_ctc: c.expected_ctc, notice_days: c.notice_days, added: c.created_at.slice(0, 10),
        })))}><Download className="mr-1 h-4 w-4" />CSV</Button>
        <Button className="h-10 shrink-0" size="sm" onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />Add candidate</Button>
      </RailTopbarSlot>
      <PageHeader
        eyebrow="Recruitment"
        title="Candidates"
        description={`${rows.length} candidate${rows.length === 1 ? "" : "s"}`}
        icon={Users}
      />


      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr><th className="p-3">Candidate</th><th className="p-3">Position</th><th className="p-3">Progress</th><th className="p-3">Location</th><th className="p-3">Added</th><th className="p-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cq.isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!cq.isLoading && pageRows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No candidates.</td></tr>}
            {pageRows.map((c) => (
              <tr key={c.id} role="link" tabIndex={0} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate({ to: "/admin/hr/recruitment/candidates/$recId", params: { recId: c.id } })} onKeyDown={(e) => { if (e.key === "Enter") navigate({ to: "/admin/hr/recruitment/candidates/$recId", params: { recId: c.id } }); }}>
                <td className="p-3">
                  <Link to="/admin/hr/recruitment/candidates/$recId" params={{ recId: c.id }} className="font-medium hover:text-accent">{c.full_name}</Link>
                  <div className="text-xs text-muted-foreground">{c.code} · {c.mobile}</div>
                </td>
                <td className="p-3 capitalize">{c.offer?.operational_role_key?.replaceAll("_", " ") ?? (c.opening_id ? openingTitle.get(c.opening_id) ?? "—" : "—")}</td>
                <td className="p-3"><span className={cn("rounded-full px-2 py-0.5 text-xs", stageTone(c.stage))}>{c.stage === "pending_onboarding" ? "Awaiting approval" : c.stage === "onboarded" ? "Onboarded" : ["rejected", "withdrawn"].includes(c.stage) ? stageLabel(c.stage) : "In progress"}</span></td>
                <td className="p-3">{c.current_location || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                <td className="p-3 text-right"><Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}><Link to="/admin/hr/recruitment/candidates/$recId" params={{ recId: c.id }}>View</Link></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 text-sm">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-muted-foreground">Page {page + 1} of {pages}</span>
        <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      <AddCandidateDialog open={adding} onOpenChange={setAdding} roles={rolesQ.data ?? []} designations={mastersQ.data?.designations ?? []} />
    </div>
  );
}

const candidateSchema = z.object({
  first_name: z.string().trim().min(1, "Enter a first name").max(80),
  last_name: z.string().trim().min(1, "Enter a last name").max(80),
  mobile: z.string().regex(/^[0-9]{10}$/, "Enter a 10-digit mobile number"),
  email: z.union([z.literal(""), z.string().email("Enter a valid email").max(255)]),
  current_location: z.string().trim().max(120),
  role_key: z.string().min(1, "Select a position"),
  designation_id: z.string().min(1, "Select a designation"),
  joining_date: z.string(),
});

function AddCandidateDialog({ open, onOpenChange, roles, designations }: { open: boolean; onOpenChange: (v: boolean) => void; roles: { key: string; name: string }[]; designations: { id: string; name: string }[] }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const blank = { first_name: "", last_name: "", mobile: "", email: "", current_location: "", role_key: "", designation_id: "", joining_date: "" };
  const [f, setF] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function save() {
    const checked = candidateSchema.safeParse(f);
    if (!checked.success) return toast.error(checked.error.issues[0]?.message ?? "Check candidate details");
    if (file && (file.size > 10 * 1024 * 1024 || !/\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name))) return toast.error("Upload a PDF, document or image under 10 MB");
    setBusy(true);
    try {
      const { data, error } = await recDb.from("rec_candidates").insert({
        full_name: `${checked.data.first_name} ${checked.data.last_name}`, mobile: checked.data.mobile, email: checked.data.email,
        current_location: checked.data.current_location, total_rounds: 1,
        offer: { operational_role_key: checked.data.role_key, designation_id: checked.data.designation_id, joining_date: checked.data.joining_date },
      }).select("id,code").single();
      if (error) throw error;
      if (file) await uploadResume(data.id, file);
      void logActivity({ module: REC_MODULE, action: "create", entityType: "rec_candidates", entityId: data.id, entityLabel: data.code });
      await qc.invalidateQueries({ queryKey: ["rec"] });
      toast.success(`${data.code} added`);
      setF(blank); setFile(null); onOpenChange(false);
      navigate({ to: "/admin/hr/recruitment/candidates/$recId", params: { recId: data.id } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Add candidate</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="First name *"><Input autoComplete="given-name" maxLength={80} value={f.first_name} onChange={set("first_name")} /></F>
          <F label="Last name *"><Input autoComplete="family-name" maxLength={80} value={f.last_name} onChange={set("last_name")} /></F>
          <F label="Mobile *"><Input autoComplete="tel" inputMode="numeric" maxLength={10} value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, "") })} /></F>
          <F label="Email"><Input autoComplete="email" type="email" maxLength={255} value={f.email} onChange={set("email")} /></F>
          <F label="City / current location"><Input maxLength={120} value={f.current_location} onChange={set("current_location")} /></F>
          <F label="Position *"><Select value={f.role_key} onValueChange={(v) => setF({ ...f, role_key: v })}><SelectTrigger><SelectValue placeholder="Cleaner, supervisor…" /></SelectTrigger><SelectContent>{roles.map((r) => <SelectItem key={r.key} value={r.key}>{r.name}</SelectItem>)}</SelectContent></Select></F>
          <F label="Designation *"><Select value={f.designation_id} onValueChange={(v) => setF({ ...f, designation_id: v })}><SelectTrigger><SelectValue placeholder="Choose designation" /></SelectTrigger><SelectContent>{designations.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></F>
          <F label="Expected joining date"><Input type="date" value={f.joining_date} onChange={set("joining_date")} /></F>
          <p className="sm:col-span-2 text-xs text-muted-foreground">Aadhaar, PAN and photo are completed in the private employee record. Never enter identity numbers in notes or a resume.</p>
          <div className="sm:col-span-2"><F label="Resume (optional)"><Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></F></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={busy} onClick={save}>{busy ? "Saving…" : "Add candidate"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
