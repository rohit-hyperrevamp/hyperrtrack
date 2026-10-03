import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db, Empty, inr, rows } from "@/lib/rail-ui";
import { logActivity } from "@/lib/activity-log";
import { checkFormula, computeSalary, pickComponents, SALARY_FUNCTIONS, SALARY_VARIABLES, type SalaryComponent } from "@/lib/rail-salary";

type Structure = { id: string; role_key: string; label: string; skill: string; is_placeholder: boolean };
const today = () => new Date().toISOString().slice(0, 10);
const kinds = [["earning", "Earnings"], ["deduction", "Employee deductions"], ["employer", "Employer contribution"]] as const;
const blank = { code: "", label: "", kind: "earning" as SalaryComponent["kind"], formula: "", area_class: "", sort_order: "100", from: today() };

/** Role tiles → per-role formula lines (earnings, deductions, employer) with a live sample payslip. */
export function RailSalaryBuilder({ onBack }: { onBack: () => void }) {
  const [sel, setSel] = useState<Structure | null>(null);
  const { data: list = [] } = useQuery({ queryKey: ["rail-pay-structures-roles"], queryFn: () => rows<Structure>(db.from("rail_pay_structures").select("id,role_key,label,skill,is_placeholder").is("deleted_at", null).is("effective_to", null).order("label")) });
  if (sel) return <StructureEditor s={sel} onBack={() => setSel(null)} />;
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back to Masters & rules</Button>
      <div><h2 className="text-lg font-semibold">Salary structures</h2><p className="text-sm text-muted-foreground">Pick a role to see and edit every pay line and its formula.</p></div>
      {!list.length ? <Empty title="No roles yet" hint="Add a role structure first." /> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => <button key={s.id} type="button" onClick={() => setSel(s)} className="rail-config-card flex items-start gap-3 rounded-lg border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"><Wallet className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block font-semibold">{s.label}</span><span className="block text-xs capitalize text-muted-foreground">{s.skill.replace(/_/g, " ")}{s.is_placeholder ? " · draft values" : ""}</span></span>
          </button>)}
        </div>)}
    </div>
  );
}

function StructureEditor({ s, onBack }: { s: Structure; onBack: () => void }) {
  const qc = useQueryClient();
  const key = ["rail-salary-components", s.id];
  const { data: all = [] } = useQuery({ queryKey: key, queryFn: () => rows<SalaryComponent>(db.from("rail_salary_components").select("*").eq("structure_id", s.id).is("deleted_at", null).order("sort_order")) });
  const [area, setArea] = useState("A");
  const [sample, setSample] = useState({ days: "26", rate: "850", ed_hours: "0" });
  const [edit, setEdit] = useState<{ row: SalaryComponent | null; v: typeof blank } | null>(null);
  const current = useMemo(() => pickComponents(all, area, today()), [all, area]);
  const result = useMemo(() => computeSalary(current, { days: Number(sample.days) || 0, rate: Number(sample.rate) || 0, ed_hours: Number(sample.ed_hours) || 0, days_in_month: 30 }), [current, sample]);
  const upcoming = all.filter((c) => c.effective_from > today());

  async function save() {
    if (!edit) return;
    const v = edit.v;
    const code = v.code.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!code || !v.label.trim() || !v.formula.trim()) return toast.error("Fill in code, name and formula");
    const chk = checkFormula(v.formula);
    if (!chk.ok) return toast.error(`Formula problem: ${chk.error}`);
    if (edit.row) {
      if (edit.row.effective_from >= v.from) {
        const { error } = await db.from("rail_salary_components").update({ deleted_at: new Date().toISOString() }).eq("id", edit.row.id);
        if (error) return toast.error(error.message);
      } else {
        const d = new Date(v.from); d.setDate(d.getDate() - 1);
        const { error } = await db.from("rail_salary_components").update({ effective_to: d.toISOString().slice(0, 10) }).eq("id", edit.row.id);
        if (error) return toast.error(error.message);
      }
    }
    const { data, error } = await db.from("rail_salary_components").insert({ structure_id: s.id, code, label: v.label.trim(), kind: v.kind, formula: v.formula.trim(), area_class: v.area_class || null, sort_order: Number(v.sort_order) || 100, effective_from: v.from }).select("id").single();
    if (error) return toast.error(error.message);
    void logActivity({ module: "Salary structures", action: edit.row ? "update" : "create", entityType: "rail_salary_components", entityId: data?.id, entityLabel: `${s.label} · ${v.label}` });
    toast.success(edit.row ? "Saved as a new version" : "Line added");
    setEdit(null); void qc.invalidateQueries({ queryKey: key });
  }
  async function toggle(c: SalaryComponent) {
    const { error } = await db.from("rail_salary_components").update({ enabled: !c.enabled }).eq("id", c.id);
    if (error) return toast.error(error.message);
    void logActivity({ module: "Salary structures", action: c.enabled ? "disable" : "enable", entityType: "rail_salary_components", entityId: c.id, entityLabel: `${s.label} · ${c.label}` });
    void qc.invalidateQueries({ queryKey: key });
  }

  const shown = all.filter((c) => c.effective_from <= today() && (!c.effective_to || c.effective_to >= today()) && (!c.area_class || c.area_class === area));
  const amount = (id: string) => result.lines.find((l) => l.id === id);
  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> All roles</Button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-lg font-semibold">{s.label}</h2><p className="text-sm text-muted-foreground">Each line is a formula. Change a number (e.g. 12 → 13) and choose the date it starts — old payslips keep the old rule.</p></div>
        <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Area</span><select aria-label="Area class" value={area} onChange={(e) => setArea(e.target.value)} className="h-9 rounded-md border border-border bg-card px-3">{["A", "B", "C"].map((a) => <option key={a}>{a}</option>)}</select>
          <Button onClick={() => setEdit({ row: null, v: { ...blank } })}><Plus className="h-4 w-4" /> Add line</Button></div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
        <div className="mb-1 font-medium text-foreground">Try with sample numbers</div>
        <div className="flex flex-wrap gap-3">
          {(["days", "rate", "ed_hours"] as const).map((k) => <label key={k} className="flex items-center gap-2">{k === "days" ? "Days" : k === "rate" ? "Day rate ₹" : "ED hours"}<Input type="number" className="h-8 w-24" value={sample[k]} onChange={(e) => setSample({ ...sample, [k]: e.target.value })} /></label>)}
        </div>
      </div>

      {kinds.map(([k, title]) => {
        const lines = shown.filter((c) => c.kind === k);
        return <section key={k} className="space-y-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {!lines.length ? <p className="text-xs text-muted-foreground">No lines.</p> : <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-3 text-left">Line</th><th className="p-3 text-left">Formula</th><th className="p-3 text-left">Area</th><th className="p-3 text-left">From</th><th className="p-3 text-right">Sample</th><th className="p-3" /></tr></thead>
            <tbody className="divide-y">{lines.map((c) => { const a = amount(c.id); return <tr key={c.id} className={c.enabled ? "" : "opacity-50"}>
              <td data-label="Line" className="p-3"><div className="font-medium">{c.label}</div><div className="font-mono text-xs text-muted-foreground">{c.code}</div></td>
              <td data-label="Formula" className="p-3 font-mono text-xs">{c.formula}</td>
              <td data-label="Area" className="p-3">{c.area_class ?? "All"}</td>
              <td data-label="From" className="p-3 tabular-nums">{c.effective_from}</td>
              <td data-label="Sample" className="p-3 text-right tabular-nums">{a?.error ? <span className="text-destructive">Error</span> : c.enabled ? inr(a?.amount ?? 0) : "Off"}</td>
              <td className="p-3 text-right whitespace-nowrap"><Button size="sm" variant="outline" onClick={() => setEdit({ row: c, v: { code: c.code, label: c.label, kind: c.kind, formula: c.formula, area_class: c.area_class ?? "", sort_order: String(c.sort_order), from: today() } })}>Edit</Button> <Button size="sm" variant="ghost" onClick={() => void toggle(c)}>{c.enabled ? "Turn off" : "Turn on"}</Button></td>
            </tr>; })}</tbody></table></div>}
        </section>;
      })}

      <div className="grid gap-3 rounded-lg border bg-card p-4 text-sm sm:grid-cols-4">
        <div><div className="text-xs text-muted-foreground">Gross</div><div className="font-semibold tabular-nums">{inr(result.gross)}</div></div>
        <div><div className="text-xs text-muted-foreground">Deductions</div><div className="font-semibold tabular-nums">{inr(result.deductions)}</div></div>
        <div><div className="text-xs text-muted-foreground">Take-home</div><div className="font-semibold tabular-nums text-brand">{inr(result.net)}</div></div>
        <div><div className="text-xs text-muted-foreground">Firm cost (CTC)</div><div className="font-semibold tabular-nums">{inr(result.ctc)}</div></div>
      </div>
      {upcoming.length > 0 && <p className="text-xs text-muted-foreground">Upcoming changes: {upcoming.map((c) => `${c.label} from ${c.effective_from}`).join(", ")}</p>}

      {edit && <div role="dialog" aria-label="Edit pay line" className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" onClick={() => setEdit(null)}>
        <div className="w-full max-w-lg space-y-3 rounded-xl border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-semibold">{edit.row ? `Edit ${edit.row.label}` : "Add pay line"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">Name<Input value={edit.v.label} onChange={(e) => setEdit({ ...edit, v: { ...edit.v, label: e.target.value } })} /></label>
            <label className="text-xs">Code (used in other formulas)<Input value={edit.v.code} disabled={!!edit.row} onChange={(e) => setEdit({ ...edit, v: { ...edit.v, code: e.target.value } })} /></label>
            <label className="text-xs">Type<select value={edit.v.kind} disabled={!!edit.row} onChange={(e) => setEdit({ ...edit, v: { ...edit.v, kind: e.target.value as SalaryComponent["kind"] } })} className="mt-1 h-10 w-full rounded-md border border-border bg-card px-3 text-sm">{kinds.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
            <label className="text-xs">Applies to area<select value={edit.v.area_class} onChange={(e) => setEdit({ ...edit, v: { ...edit.v, area_class: e.target.value } })} className="mt-1 h-10 w-full rounded-md border border-border bg-card px-3 text-sm"><option value="">All areas</option>{["A", "B", "C"].map((a) => <option key={a}>{a}</option>)}</select></label>
            <label className="text-xs">Order<Input type="number" value={edit.v.sort_order} onChange={(e) => setEdit({ ...edit, v: { ...edit.v, sort_order: e.target.value } })} /></label>
            <label className="text-xs">Starts from<Input type="date" value={edit.v.from} onChange={(e) => setEdit({ ...edit, v: { ...edit.v, from: e.target.value } })} /></label>
          </div>
          <label className="block text-xs">Formula<Input className="font-mono" value={edit.v.formula} onChange={(e) => setEdit({ ...edit, v: { ...edit.v, formula: e.target.value } })} placeholder="basic_da * 5 / 100" /></label>
          {edit.v.formula && (() => { const c = checkFormula(edit.v.formula); return c.ok ? <p className="text-xs text-success">Formula looks good.</p> : <p className="text-xs text-destructive">{c.error}</p>; })()}
          <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
            <div><b>Values:</b> {SALARY_VARIABLES.map(([k, d]) => <span key={k} title={d} className="mr-2 font-mono">{k}</span>)}{current.map((c) => <span key={c.id} className="mr-2 font-mono">{c.code}</span>)}</div>
            <div className="mt-1"><b>Functions:</b> {SALARY_FUNCTIONS}</div>
            <div className="mt-1">Example: <span className="font-mono">if(lte(gross, 21000), ceil(gross * 0.75 / 100), 0)</span></div>
          </div>
          {edit.row && <p className="text-xs text-muted-foreground">An area choice other than the current row's adds an area-specific version; the all-areas line stays for other areas.</p>}
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={() => void save()}>Save</Button></div>
        </div>
      </div>}
    </div>
  );
}
