import { confirmAction } from "@/components/ConfirmProvider";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Bell, Building2, ClipboardCheck, Download, FileText, History, MapPin, Pencil, Plus, Search, Settings2, ShieldCheck, TrainFront, Trash2, Upload, UsersRound, Wallet, Warehouse, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { downloadCsv } from "@/lib/csv-export";
import { RAIL_MASTERS, type MasterDef, type MasterField } from "@/lib/rail-masters";
import { PageHeader } from "@/components/PageHeader";
import { RailItemTypes, RailOrgSetup } from "@/components/RailOrgSetup";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCurrentPermissions } from "@/lib/rbac";

export const Route = createFileRoute("/admin/rail/settings")({
  head: () => ({
    meta: [
      { title: "Configuration Hub — HyperTrack" },
      { name: "description", content: "Configure depots, trains, coaches, checklists, contracts and rates for railway cleaning." },
      { property: "og:title", content: "Configuration Hub — HyperTrack" },
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
  "Supplies & inventory": Warehouse,
  "Billing & wages": Wallet,
  System: Settings2,
};
const masterIcons: Record<string, LucideIcon> = {
  rail_locations: MapPin, rail_trains: TrainFront, rail_coaches: TrainFront,
  rail_alert_rules: Bell, rail_checklist_items: ClipboardCheck,
};
const groupTones: Record<MasterDef["group"], string> = {
  "Places & trains": "bg-brand text-primary-foreground",
  Cleaning: "bg-brand text-primary-foreground",
  Contracts: "bg-foreground text-background",
  "Supplies & inventory": "bg-destructive text-destructive-foreground",
  "Billing & wages": "bg-brand text-primary-foreground",
  System: "bg-foreground text-background",
};
// Dynamic table access: the registry decides which rail_ table is used.
const db = supabase as unknown as { from: (t: string) => any };

function RailSettingsPage() {
  const [active, setActive] = useState<MasterDef | null>(null);
  const [section, setSection] = useState<"catalog" | "org" | "roles">("org");
  const [catalogQuery, setCatalogQuery] = useState("");
  const { isSuperAdmin } = useCurrentPermissions();
  const groups = useMemo(() => {
    const m = new Map<MasterDef["group"], MasterDef[]>();
    for (const d of RAIL_MASTERS) m.set(d.group, [...(m.get(d.group) ?? []), d]);
    return [...m.entries()];
  }, []);

  if (active) return <MasterTable def={active} onBack={() => setActive(null)} />;

  return (
    <div className="rail-config space-y-6">
      {section === "catalog" && <RailTopbarSlot><Input aria-label="Find a collection" placeholder="Find a collection" value={catalogQuery} onChange={(e) => setCatalogQuery(e.target.value)} className="w-56" /></RailTopbarSlot>}
      <PageHeader title="Configuration Hub" />
      <div className="rail-config-tabs flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Button variant="ghost" aria-pressed={section === "catalog"} className={cn("rounded-md", section === "catalog" && "bg-brand text-primary-foreground hover:bg-brand hover:text-primary-foreground")} onClick={() => setSection("catalog")}><Settings2 className="h-4 w-4" /> Masters & rules</Button>
        <Button variant="ghost" aria-pressed={section === "org"} className={cn("rounded-md", section === "org" && "bg-brand text-primary-foreground hover:bg-brand hover:text-primary-foreground")} onClick={() => setSection("org")}><Building2 className="h-4 w-4" /> Organization</Button>
        {isSuperAdmin && <Button variant="ghost" aria-pressed={section === "roles"} className={cn("rounded-md", section === "roles" && "bg-brand text-primary-foreground hover:bg-brand hover:text-primary-foreground")} onClick={() => setSection("roles")}><ShieldCheck className="h-4 w-4" /> Roles & access</Button>}
        {section === "catalog" && <span className="ml-auto text-xs tabular-nums text-muted-foreground">{RAIL_MASTERS.length} collections</span>}
      </div>
      {section === "org" ? <RailOrgSetup /> : section === "roles" && isSuperAdmin ? <RolesAccess /> : <><RailItemTypes />{groups.map(([group, entries]) => {
        const defs = entries.filter((d) => `${d.label} ${d.description}`.toLowerCase().includes(catalogQuery.toLowerCase()));
        return defs.length ? (
        <section key={group} className="space-y-3" aria-label={group}>
          <div className="flex items-center gap-3 pb-1">
            {(() => { const Icon = groupIcons[group]; return <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", groupTones[group])}><Icon className="h-4 w-4" /></span>; })()}
            <h2 className="text-base font-semibold text-foreground">{group}</h2>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">{defs.length}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {defs.map((d) => <MasterCard key={d.table} def={d} onOpen={() => setActive(d)} />)}
          </div>
        </section>
      ) : null; })}</>}
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
        className="rail-config-card group h-auto min-h-32 w-full items-start justify-start gap-0 whitespace-normal rounded-lg border-border bg-card p-5 text-left shadow-none transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:bg-card hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex w-full min-w-0 items-start gap-3">
         <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", groupTones[def.group])}><Icon className="h-5 w-5" strokeWidth={1.9} /></span>
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block truncate text-sm font-semibold text-foreground">{def.label}</span>
          <span className="mt-1 block line-clamp-2 text-xs font-normal leading-relaxed text-muted-foreground">{def.description}</span>
        </span>
         <span className="flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-muted-foreground"><span>{count ?? "–"}</span><ArrowRight className="h-3.5 w-3.5 text-brand transition-transform group-hover:translate-x-1" /></span>
      </span>
    </Button>
  );
}

type RailRoleRow = { id: string; key: string; name: string; description: string | null; is_external: boolean; hide_costs: boolean };
type RailPermissionRow = { id: string; role_key: string; module_key: string; action: string };
const railModules = [
  ["rail_access", "People & access"], ["rail_settings", "Masters & rules"], ["rail_ops", "Live operations"],
  ["rail_quality", "Quality & inspections"], ["rail_contracts", "Contracts"], ["rail_supplies", "Supplies & equipment"],
  ["rail_sustainability", "Sustainability"], ["rail_billing", "Railway billing"], ["rail_wages", "Wages & compliance"],
] as const;
const railActions = ["view", "create", "edit", "delete", "approve", "export", "configure", "inspect", "sign"] as const;

function RolesAccess() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Set<string> | null>(null);
  const [roleForm, setRoleForm] = useState<{ name: string; description: string; is_external: boolean; hide_costs: boolean } | null>(null);
  const [roleStep, setRoleStep] = useState(0);
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["rail-access-roles"],
    queryFn: async () => {
      const { data, error } = await db.from("rail_roles").select("id,key,name,description,is_external,hide_costs").is("deleted_at", null).order("sort_order");
      if (error) throw error;
      return (data ?? []) as RailRoleRow[];
    },
  });
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["rail-access-permissions", selected], enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await db.from("rail_permissions").select("id,role_key,module_key,action").eq("role_key", selected).is("deleted_at", null);
      if (error) throw error;
      return (data ?? []) as RailPermissionRow[];
    },
  });
  const activeRole = roles.find((r) => r.key === selected);
  const original = new Set(permissions.map((p) => `${p.module_key}:${p.action}`));
  const current = draft ?? original;
  const changed = draft !== null && (draft.size !== original.size || [...draft].some((key) => !original.has(key)));
  const protectedRole = selected === "super_admin";

  const createRole = useMutation({
    mutationFn: async (form: NonNullable<typeof roleForm>) => {
      const name = form.name.trim();
      if (!name) throw new Error("Enter a role name");
      const key = `custom_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
      if (key === "custom_") throw new Error("Use letters or numbers in the role name");
      const { data, error } = await db.from("rail_roles").insert({ key, name, description: form.description.trim() || null, is_external: form.is_external, hide_costs: form.hide_costs }).select("id").single();
      if (error) throw error;
      await logActivity({ module: "Configuration Hub", action: "create", entityType: "rail_roles", entityId: data.id, entityLabel: name });
      return key;
    },
    onSuccess: (key) => { toast.success("Role created"); setRoleForm(null); qc.invalidateQueries({ queryKey: ["rail-access-roles"] }); qc.invalidateQueries({ queryKey: ["rail-people"] }); setSelected(key); },
    onError: (e: Error) => toast.error(e.message),
  });
  const savePermissions = useMutation({
    mutationFn: async () => {
      if (!selected || !draft || protectedRole) return;
      const additions = [...draft].filter((key) => !original.has(key));
      const removals = permissions.filter((p) => !draft.has(`${p.module_key}:${p.action}`));
      if (additions.length) {
        const payload = additions.map((key) => { const [module_key, action] = key.split(":"); return { role_key: selected, module_key, action }; });
        const { error } = await db.from("rail_permissions").upsert(payload.map((p) => ({ ...p, deleted_at: null })), { onConflict: "role_key,module_key,action" });
        if (error) throw error;
      }
      if (removals.length) {
        const { error } = await db.from("rail_permissions").update({ deleted_at: new Date().toISOString() }).in("id", removals.map((p) => p.id));
        if (error) throw error;
      }
      await logActivity({ module: "Configuration Hub", action: "update", entityType: "rail_permissions", entityLabel: selected, details: { granted: additions, revoked: removals.map((p) => `${p.module_key}:${p.action}`) } });
    },
    onSuccess: () => { toast.success("Permissions saved"); setDraft(null); qc.invalidateQueries({ queryKey: ["rail-access-permissions", selected] }); qc.invalidateQueries({ queryKey: ["rail-page-access"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeRole = useMutation({
    mutationFn: async (role: RailRoleRow) => {
      const { count, error: countError } = await db.from("rail_people").select("id", { count: "exact", head: true }).eq("role_key", role.key).eq("enabled", true).is("deleted_at", null);
      if (countError) throw countError;
      if (count) throw new Error("Reassign active people before removing this role");
      const { count: assignments, error: assignmentError } = await db.from("rail_user_roles").select("id", { count: "exact", head: true }).eq("role_key", role.key).is("deleted_at", null).or(`valid_to.is.null,valid_to.gt.${new Date().toISOString()}`);
      if (assignmentError) throw assignmentError;
      if (assignments) throw new Error("Remove active role assignments before removing this role");
      const { error: revokeError } = await db.from("rail_permissions").update({ deleted_at: new Date().toISOString() }).eq("role_key", role.key).is("deleted_at", null);
      if (revokeError) throw revokeError;
      const { error } = await db.from("rail_roles").update({ deleted_at: new Date().toISOString() }).eq("id", role.id);
      if (error) throw error;
        await logActivity({ module: "Configuration Hub", action: "delete", entityType: "rail_roles", entityId: role.id, entityLabel: role.name });
    },
    onSuccess: () => { toast.success("Role removed"); setSelected(null); setDraft(null); qc.invalidateQueries({ queryKey: ["rail-access-roles"] }); qc.invalidateQueries({ queryKey: ["rail-page-access"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = (module: string, action: string) => {
    const next = new Set(current);
    const key = `${module}:${action}`;
    if (next.has(key)) {
      next.delete(key);
      if (action === "view") railActions.forEach((a) => next.delete(`${module}:${a}`));
    } else {
      next.add(key);
      if (action !== "view") next.add(`${module}:view`);
    }
    setDraft(next);
  };

  return <div className="grid min-w-0 gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
    <aside className="min-w-0 space-y-3">
       <div className="flex items-center justify-between gap-2"><h2 className="text-base font-semibold">Roles</h2><Button size="icon" aria-label="Add role" title="Add role" className="rounded-full active:scale-95" onClick={() => { setRoleStep(0); setRoleForm({ name: "", description: "", is_external: false, hide_costs: false }); }}><Plus /></Button></div>
      <div className="space-y-2">{rolesLoading ? <p className="text-sm text-muted-foreground">Loading roles…</p> : roles.map((role) =>
        <Button key={role.id} variant="outline" onClick={() => { setSelected(role.key); setDraft(null); }} className={cn("group h-auto min-h-16 w-full justify-start gap-3 rounded-lg p-3 text-left active:scale-[0.98]", selected === role.key && "border-brand bg-brand/5")}>
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", selected === role.key ? "bg-brand text-primary-foreground" : "bg-muted text-foreground")}><UsersRound className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{role.name}</span><span className="block truncate text-xs font-normal text-muted-foreground">{role.description || (role.is_external ? "External" : "Team")}</span></span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Button>)}
      </div>
    </aside>
    <section className="min-w-0">
      {!activeRole ? <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-card text-sm text-muted-foreground">Select a role to manage access</div> : <>
        <div className="mb-4 flex flex-wrap items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-primary-foreground"><ShieldCheck className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="font-semibold">{activeRole.name}</h2><p className="text-xs text-muted-foreground">Access to pages and actions</p></div>
          {activeRole.key.startsWith("custom_") && <Button size="icon" variant="ghost" className="rounded-full" title="Remove role" aria-label="Remove role" disabled={removeRole.isPending} onClick={async () => { if (await confirmAction({ title: `Remove ${activeRole.name}?`, description: "People with this role lose its access.", confirmText: "Remove", destructive: true })) removeRole.mutate(activeRole); }}><Trash2 /></Button>}
          <Button onClick={() => savePermissions.mutate()} disabled={!changed || savePermissions.isPending || permissionsLoading || protectedRole} className="active:scale-95">{savePermissions.isPending ? "Saving…" : "Save access"}</Button>
        </div>
        {protectedRole && <p className="mb-3 text-xs text-muted-foreground">Super Admin access is protected and cannot be changed here.</p>}
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[760px] border-collapse text-sm"><thead><tr className="border-b border-border bg-muted/50 text-left"><th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 font-semibold">Area</th>{railActions.map((action) => <th key={action} className="px-2 py-3 text-center text-xs font-medium capitalize">{action}</th>)}</tr></thead>
            <tbody>{railModules.map(([key, label]) => <tr key={key} className="border-b border-border/70 last:border-0 hover:bg-muted/30"><th className="sticky left-0 bg-card px-4 py-3 text-left font-medium">{label}</th>{railActions.map((action) => <td key={action} className="px-2 py-2 text-center"><Switch aria-label={`${label}: ${action}`} checked={current.has(`${key}:${action}`)} disabled={permissionsLoading || protectedRole} onCheckedChange={() => toggle(key, action)} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      </>}
    </section>
     <Sheet open={roleForm !== null} onOpenChange={(open) => !open && setRoleForm(null)}><SheetContent className="w-full sm:max-w-md"><SheetHeader><SheetTitle>Create role</SheetTitle><SheetDescription>Set the role up, then choose its page permissions.</SheetDescription></SheetHeader>{roleForm && <div className="mt-6 space-y-4"><div className="text-xs font-medium text-muted-foreground"><span className={roleStep === 0 ? "text-brand" : ""}>01 · Identity</span><span className="mx-2">→</span><span className={roleStep === 1 ? "text-brand" : ""}>02 · Visibility</span></div>{roleStep === 0 ? <><div className="space-y-1.5"><Label htmlFor="rail-role-name">Role name</Label><Input id="rail-role-name" autoFocus value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} /></div><div className="space-y-1.5"><Label htmlFor="rail-role-description">Description</Label><Input id="rail-role-description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} /></div><Button className="w-full" disabled={!roleForm.name.trim()} onClick={() => setRoleStep(1)}>Continue</Button></> : <><div className="flex items-center justify-between gap-3"><Label htmlFor="rail-external">External team</Label><Switch id="rail-external" checked={roleForm.is_external} onCheckedChange={(checked) => setRoleForm({ ...roleForm, is_external: checked })} /></div><div className="flex items-center justify-between gap-3"><Label htmlFor="rail-hide-costs">Hide costs</Label><Switch id="rail-hide-costs" checked={roleForm.hide_costs} onCheckedChange={(checked) => setRoleForm({ ...roleForm, hide_costs: checked })} /></div><div className="flex gap-2"><Button variant="outline" onClick={() => setRoleStep(0)}>Back</Button><Button className="flex-1 active:scale-[0.98]" disabled={createRole.isPending} onClick={() => createRole.mutate(roleForm)}>Create role</Button></div></>}</div>}</SheetContent></Sheet>
  </div>;
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
       await logActivity({ module: "Configuration Hub", action: "delete", entityType: def.table, entityId: r.id, before: r });
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
       await logActivity({ module: "Configuration Hub", action: "import", entityType: def.table, details: { rows: payload.length } });
      return payload.length;
    },
    onSuccess: (n) => { toast.success(`Imported ${n} rows`); setImportRows(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <RailTopbarSlot>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${def.label}`} className="w-48" aria-label="Search" />
        <Button variant="outline" onClick={() => downloadCsv(def.table, filtered.map((r) => Object.fromEntries(def.fields.map((f) => [f.label, display(f, r[f.key], refs)]))))}><Download className="mr-1 h-4 w-4" />Export</Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" />Import</Button>
        <Button onClick={() => setEditing("new")}><Plus className="mr-1 h-4 w-4" />Add</Button>
      </RailTopbarSlot>
       <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" />Configuration Hub</Button>
      <PageHeader title={def.label} description={def.description} />
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />

      {importRows && (
       <div className="space-y-2 rounded-lg border border-border bg-card p-4">
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

       <div className="rail-master-table overflow-x-auto rounded-lg border border-border bg-card">
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
                  <td key={f.key} data-label={f.label} className={`px-3 py-2 ${f.type === "number" || /number|code/.test(f.key) ? "font-mono tabular-nums" : ""}`}>{display(f, r[f.key], refs)}</td>
                ))}
                <td data-label="Actions" className="whitespace-nowrap px-3 py-2 text-right">
                   <Button size="icon" variant="ghost" className="rounded-full" aria-label="Edit" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
                   <Button size="icon" variant="ghost" className="rounded-full" aria-label="Remove" onClick={() => remove.mutate(r)}><Trash2 className="h-4 w-4" /></Button>
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
  const [formStep, setFormStep] = useState(0);
  const [loadedFor, setLoadedFor] = useState<unknown>(null);
  if (row !== loadedFor) {
    setLoadedFor(row);
    setFormStep(0);
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
         await logActivity({ module: "Configuration Hub", action: "create", entityType: def.table, after: payload });
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
         await logActivity({ module: "Configuration Hub", action: "new_version", entityType: def.table, entityId: old.id, before: old, after: payload });
      } else {
        const old = row as Row;
        const { error } = await db.from(def.table).update(payload).eq("id", old.id);
        if (error) throw error;
         await logActivity({ module: "Configuration Hub", action: "update", entityType: def.table, entityId: old.id, before: old, after: payload });
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
             {def.fields.length > 5 && <div className="text-xs font-medium text-muted-foreground">{formStep === 0 ? "01 · Main details" : "02 · More details"} <span className="ml-2 text-brand">{formStep + 1} / 2</span></div>}
             {(def.fields.length > 5 ? def.fields.slice(formStep === 0 ? 0 : Math.ceil(def.fields.length / 2), formStep === 0 ? Math.ceil(def.fields.length / 2) : undefined) : def.fields).map((f) => (
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
           <Button variant="outline" onClick={formStep === 1 ? () => setFormStep(0) : onClose}>{formStep === 1 ? "Back" : "Cancel"}</Button>
           {def.fields.length > 5 && formStep === 0 ? <Button onClick={() => setFormStep(1)}>Continue</Button> : <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>}
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
