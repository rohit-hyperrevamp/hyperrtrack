import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Bell, ClipboardCheck, Download, FileText, History, MapPin, Pencil, Plus, Search, Settings2, TrainFront, Trash2, Upload, Wallet, Warehouse, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { downloadCsv } from "@/lib/csv-export";
import { RAIL_MASTERS, type MasterDef, type MasterField } from "@/lib/rail-masters";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/rail/settings")({
  head: () => ({
    meta: [
      { title: "Rail Settings — HyperTrack" },
      { name: "description", content: "Configure depots, trains, coaches, checklists, contracts and rates for railway cleaning." },
      { property: "og:title", content: "Rail Settings — HyperTrack" },
      { property: "og:description", content: "Configure every railway cleaning master without code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RailSettingsPage,
});

type Row = Record<string, unknown> & { id: string };
const groupIcons: Record<MasterDef["group"], LucideIcon> = {
  "Places & trains": TrainFront,
  Cleaning: ClipboardCheck,
  Contracts: FileText,
  "Supplies & resources": Warehouse,
  "Billing & wages": Wallet,
  System: Settings2,
};
const masterIcons: Record<string, LucideIcon> = {
  rail_locations: MapPin, rail_trains: TrainFront, rail_coaches: TrainFront,
  rail_alert_rules: Bell, rail_checklist_items: ClipboardCheck,
};
const groupTones: Record<MasterDef["group"], string> = {
  "Places & trains": "bg-brand text-primary-foreground",
  Cleaning: "bg-good text-primary-foreground",
  Contracts: "bg-foreground text-background",
  "Supplies & resources": "bg-caution text-background",
  "Billing & wages": "bg-brand text-primary-foreground",
  System: "bg-foreground text-background",
};
// Dynamic table access: the registry decides which rail_ table is used.
const db = supabase as unknown as { from: (t: string) => any };

function RailSettingsPage() {
  const [active, setActive] = useState<MasterDef | null>(null);
  const groups = useMemo(() => {
    const m = new Map<string, MasterDef[]>();
    for (const d of RAIL_MASTERS) m.set(d.group, [...(m.get(d.group) ?? []), d]);
    return [...m.entries()];
  }, []);

  if (active) return <MasterTable def={active} onBack={() => setActive(null)} />;

  return (
    <div className="space-y-7">
      <PageHeader title="Rail Settings" />
      {groups.map(([group, defs]) => (
        <section key={group} className="space-y-3" aria-label={group}>
          <div className="flex items-center gap-2.5 border-b border-border/70 pb-3">
            {(() => { const Icon = groupIcons[group]; return <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", groupTones[group])}><Icon className="h-4 w-4" /></span>; })()}
            <h2 className="font-heading text-base font-semibold text-foreground">{group}</h2>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">{defs.length}</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {defs.map((d) => (
              <MasterCard key={d.table} def={d} onOpen={() => setActive(d)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MasterCard({ def, onOpen }: { def: MasterDef; onOpen: () => void }) {
  const Icon = masterIcons[def.table] ?? groupIcons[def.group];
  const { data: count } = useQuery({
    queryKey: ["rail-count", def.table],
    queryFn: async () => {
      const { count, error } = await db.from(def.table).select("id", { count: "exact", head: true }).is("deleted_at", null);
      if (error) throw error;
      return count ?? 0;
    },
  });
  return (
    <Button
      type="button"
       variant="outline"
      onClick={onOpen}
       className="group h-auto min-h-24 w-full items-start justify-start rounded-lg border-border/70 bg-card p-4 text-left shadow-none transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-card hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex w-full min-w-0 items-start gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", groupTones[def.group])}><Icon className="h-5 w-5" strokeWidth={1.9} /></span>
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block truncate text-sm font-semibold text-foreground">{def.label}</span>
          <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">{def.description}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-muted-foreground"><span>{count ?? "–"}</span><ArrowUpRight className="h-3.5 w-3.5 text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
      </span>
    </Button>
  );
}

function useRefOptions(fields: MasterField[]) {
  const refTables = [...new Set(fields.filter((f) => f.ref).map((f) => `${f.ref!.table}|${f.ref!.label}`))];
  return useQuery({
    queryKey: ["rail-refs", refTables],
    queryFn: async () => {
      const out: Record<string, { id: string; label: string }[]> = {};
      for (const key of refTables) {
        const [table, label] = key.split("|") as [string, string];
        let q = db.from(table).select(`id,${label}`);
        if (table.startsWith("rail_")) q = q.is("deleted_at", null);
        const { data, error } = await q.order(label).limit(1000);
        if (error) throw error;
        out[key] = (data ?? []).map((r: Record<string, unknown>) => ({ id: String(r.id), label: String(r[label] ?? "") }));
      }
      return out;
    },
  });
}

function display(f: MasterField, v: unknown, refs: Record<string, { id: string; label: string }[]> | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  if (f.type === "bool") return v ? "Yes" : "No";
  if (f.ref) return refs?.[`${f.ref.table}|${f.ref.label}`]?.find((o) => o.id === v)?.label ?? "—";
  return String(v);
}

function MasterTable({ def, onBack }: { def: MasterDef; onBack: () => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [importRows, setImportRows] = useState<Record<string, string>[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: refs } = useRefOptions(def.fields);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["rail-master", def.table],
    queryFn: async () => {
      const { data, error } = await db.from(def.table).select("*").is("deleted_at", null).order(def.orderBy).limit(5000);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => def.fields.some((f) => display(f, r[f.key], refs).toLowerCase().includes(s)));
  }, [rows, q, def.fields, refs]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["rail-master", def.table] });
    qc.invalidateQueries({ queryKey: ["rail-count", def.table] });
    qc.invalidateQueries({ queryKey: ["rail-refs"] });
  };

  const remove = useMutation({
    mutationFn: async (r: Row) => {
      const { error } = await db.from(def.table).update({ deleted_at: new Date().toISOString() }).eq("id", r.id);
      if (error) throw error;
      await logActivity({ module: "Rail Clean Settings", action: "delete", entityType: def.table, entityId: r.id, before: r });
    },
    onSuccess: () => { toast.success("Removed"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const tableFields = def.fields.filter((f) => !f.hideInTable);

  function onFile(file: File) {
    file.text().then((text) => {
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const head = lines[0]?.split(",").map((h) => h.trim().replace(/^"|"$/g, "")) ?? [];
      const parsed = lines.slice(1).map((l) => {
        const cells = l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        return Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ""]));
      });
      setImportRows(parsed);
    });
  }

  const importErrors = useMemo(() => {
    if (!importRows) return [];
    const errs: string[] = [];
    importRows.forEach((r, i) => {
      for (const f of def.fields) {
        if (f.required && !f.ref && !r[f.key]) errs.push(`Row ${i + 2}: ${f.label} is missing`);
        if (f.type === "number" && r[f.key] && Number.isNaN(Number(r[f.key]))) errs.push(`Row ${i + 2}: ${f.label} must be a number`);
      }
    });
    return errs;
  }, [importRows, def.fields]);

  const doImport = useMutation({
    mutationFn: async () => {
      const payload = (importRows ?? []).map((r) => {
        const o: Record<string, unknown> = {};
        for (const f of def.fields) {
          const v = r[f.key];
          if (v === undefined || v === "") continue;
          o[f.key] = f.type === "number" ? Number(v) : f.type === "bool" ? /^(1|true|yes)$/i.test(v) : v;
        }
        return o;
      });
      const { error } = await db.from(def.table).insert(payload);
      if (error) throw error;
      await logActivity({ module: "Rail Clean Settings", action: "import", entityType: def.table, details: { rows: payload.length } });
      return payload.length;
    },
    onSuccess: (n) => { toast.success(`Imported ${n} rows`); setImportRows(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" />All settings</Button>
      <PageHeader title={def.label} description={def.description} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="pl-9" aria-label="Search" />
        </div>
        <Button variant="outline" onClick={() => downloadCsv(def.table, filtered.map((r) => Object.fromEntries(def.fields.map((f) => [f.label, display(f, r[f.key], refs)]))))}>
          <Download className="mr-1 h-4 w-4" />Export
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" />Import</Button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        <Button onClick={() => setEditing("new")}><Plus className="mr-1 h-4 w-4" />Add</Button>
      </div>

      {importRows && (
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          <p className="font-medium">Import preview: {importRows.length} rows</p>
          <p className="text-sm text-muted-foreground">Column headers must match: {def.fields.map((f) => f.key).join(", ")}</p>
          {importErrors.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-destructive">{importErrors.slice(0, 10).map((e) => <li key={e}>{e}</li>)}</ul>
          ) : (
            <p className="text-sm">All rows look valid.</p>
          )}
          <div className="flex gap-2">
            <Button disabled={importErrors.length > 0 || doImport.isPending} onClick={() => doImport.mutate()}>Save {importRows.length} rows</Button>
            <Button variant="ghost" onClick={() => setImportRows(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {tableFields.map((f) => <th key={f.key} className="px-3 py-2 font-medium">{f.label}</th>)}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={tableFields.length + 1} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={tableFields.length + 1} className="px-3 py-8 text-center text-muted-foreground">Nothing here yet. Use Add or Import to start.</td></tr>
            )}
            {filtered.slice(0, 500).map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                {tableFields.map((f) => (
                  <td key={f.key} className={`px-3 py-2 ${f.type === "number" || /number|code/.test(f.key) ? "font-mono tabular-nums" : ""}`}>{display(f, r[f.key], refs)}</td>
                ))}
                <td className="whitespace-nowrap px-3 py-2 text-right">
                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => remove.mutate(r)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 500 && <p className="p-3 text-sm text-muted-foreground">Showing first 500 of {filtered.length}. Use search to narrow down.</p>}
      </div>

      <EditSheet def={def} row={editing} refs={refs} onClose={() => setEditing(null)} onSaved={invalidate} />
    </div>
  );
}

function EditSheet({ def, row, refs, onClose, onSaved }: {
  def: MasterDef; row: Row | "new" | null;
  refs: Record<string, { id: string; label: string }[]> | undefined;
  onClose: () => void; onSaved: () => void;
}) {
  const isNew = row === "new";
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loadedFor, setLoadedFor] = useState<unknown>(null);
  if (row !== loadedFor) {
    setLoadedFor(row);
    setForm(row && row !== "new" ? { ...row } : Object.fromEntries(def.fields.filter((f) => f.type === "bool").map((f) => [f.key, true])));
  }

  const { data: history = [] } = useQuery({
    queryKey: ["rail-audit", def.table, row && row !== "new" ? row.id : null],
    enabled: !!row && row !== "new",
    queryFn: async () => {
      const { data } = await db.from("rail_audit_trail").select("id,action,at,new_data").eq("table_name", def.table).eq("record_id", (row as Row).id).order("at", { ascending: false }).limit(50);
      return (data ?? []) as { id: number; action: string; at: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      for (const f of def.fields) {
        let v = form[f.key];
        if (v === "" || v === undefined) v = null;
        if (f.type === "number" && v !== null) v = Number(v);
        if (f.required && v === null) throw new Error(`${f.label} is required`);
        payload[f.key] = v;
      }
      if (isNew) {
        const { error } = await db.from(def.table).insert(payload);
        if (error) throw error;
        await logActivity({ module: "Rail Clean Settings", action: "create", entityType: def.table, after: payload });
      } else if (def.versioned) {
        // Dated values are never overwritten: close the old row, add a new one.
        const old = row as Row;
        const from = String(payload.effective_from ?? new Date().toISOString().slice(0, 10));
        if (from <= String(old.effective_from)) throw new Error("New 'Valid from' must be after the current version's start date");
        const prevDay = new Date(new Date(from).getTime() - 86400000).toISOString().slice(0, 10);
        const { error: e1 } = await db.from(def.table).update({ effective_to: prevDay }).eq("id", old.id);
        if (e1) throw e1;
        const { error: e2 } = await db.from(def.table).insert({ ...payload, effective_from: from });
        if (e2) throw e2;
        await logActivity({ module: "Rail Clean Settings", action: "new_version", entityType: def.table, entityId: old.id, before: old, after: payload });
      } else {
        const old = row as Row;
        const { error } = await db.from(def.table).update(payload).eq("id", old.id);
        if (error) throw error;
        await logActivity({ module: "Rail Clean Settings", action: "update", entityType: def.table, entityId: old.id, before: old, after: payload });
      }
    },
    onSuccess: () => { toast.success("Saved"); onSaved(); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isNew ? `Add ${def.label.toLowerCase()}` : `Edit ${def.label.toLowerCase()}`}</SheetTitle>
          <SheetDescription>{def.versioned && !isNew ? "Saving creates a new dated version; the old one is kept." : def.description}</SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            {!isNew && <TabsTrigger value="history"><History className="mr-1 h-4 w-4" />History</TabsTrigger>}
          </TabsList>
          <TabsContent value="details" className="space-y-3 pt-2">
            {def.fields.map((f) => (
              <FieldInput key={f.key} f={f} value={form[f.key]} refs={refs} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
            ))}
          </TabsContent>
          <TabsContent value="history" className="space-y-2 pt-2">
            {history.length === 0 && <p className="text-sm text-muted-foreground">No changes recorded yet.</p>}
            {history.map((h) => (
              <div key={h.id} className="rounded-lg border border-border p-2 text-sm">
                <span className="font-medium capitalize">{h.action}</span>
                <span className="ml-2 text-muted-foreground">{new Date(h.at).toLocaleString()}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        <SheetFooter className="mt-6">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function FieldInput({ f, value, refs, onChange }: {
  f: MasterField; value: unknown;
  refs: Record<string, { id: string; label: string }[]> | undefined;
  onChange: (v: unknown) => void;
}) {
  const id = `fld-${f.key}`;
  if (f.type === "bool") {
    return (
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{f.label}</Label>
        <Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }
  const options = f.ref ? refs?.[`${f.ref.table}|${f.ref.label}`] ?? [] : (f.options ?? []).map((o) => ({ id: o, label: o.replace(/_/g, " ") }));
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{f.label}{f.required ? " *" : ""}</Label>
      {f.type === "select" || f.type === "ref" ? (
        <Select value={value ? String(value) : "__none"} onValueChange={(v) => onChange(v === "__none" ? null : v)}>
          <SelectTrigger id={id}><SelectValue placeholder="Choose" /></SelectTrigger>
          <SelectContent>
            {!f.required && <SelectItem value="__none">None</SelectItem>}
            {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "time" ? "time" : "text"}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
