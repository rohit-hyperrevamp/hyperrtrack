import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Shield, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Unit = { unit_id: string; unit_code: string; unit_name: string };
type Post = { unit_id: string; candidate_id: string; is_reliever: boolean | null; candidates: { full_name: string | null; employee_code: string | null; role_key: string | null; status: string | null } | null };

const FO_PAGE = 10;

/** Field officer → units → guards tree for the units the viewer can see. */
export function FieldOfficerOrgChart({ units }: { units: Unit[] }) {
  const ids = useMemo(() => units.map((u) => u.unit_id).sort(), [units]);
  const [open, setOpen] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const q = useQuery({
    queryKey: ["fo-org-chart", ids.length, ids[0] ?? "", ids[ids.length - 1] ?? ""],
    enabled: ids.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const out: Post[] = [];
      for (let i = 0; i < ids.length; i += 100) {
        const { data, error } = await supabase
          .from("candidate_units")
          .select("unit_id,candidate_id,is_reliever,candidates!inner(full_name,employee_code,role_key,status)")
          .in("unit_id", ids.slice(i, i + 100));
        if (error) throw error;
        out.push(...((data ?? []) as unknown as Post[]));
      }
      return out;
    },
  });

  const tree = useMemo(() => {
    const unitById = new Map(units.map((u) => [u.unit_id, u]));
    const guardsByUnit = new Map<string, number>();
    const fos = new Map<string, { id: string; name: string; code: string; inactive: boolean; units: Set<string> }>();
    for (const p of q.data ?? []) {
      const c = p.candidates;
      if (!c) continue;
      if (c.role_key === "field_officer") {
        const f = fos.get(p.candidate_id) ?? { id: p.candidate_id, name: c.full_name ?? "", code: c.employee_code ?? "", inactive: !["active", "approved"].includes(c.status ?? ""), units: new Set<string>() };
        f.units.add(p.unit_id);
        fos.set(p.candidate_id, f);
      } else if (["active", "approved"].includes(c.status ?? "") && !p.is_reliever) {
        guardsByUnit.set(p.unit_id, (guardsByUnit.get(p.unit_id) ?? 0) + 1);
      }
    }
    const covered = new Set<string>();
    const list = Array.from(fos.values()).map((f) => {
      const us = Array.from(f.units).map((id) => ({ ...(unitById.get(id) ?? { unit_id: id, unit_code: "", unit_name: "" }), guards: guardsByUnit.get(id) ?? 0 }))
        .sort((a, b) => a.unit_code.localeCompare(b.unit_code));
      us.forEach((u) => covered.add(u.unit_id));
      return { ...f, unitList: us, guards: us.reduce((s, u) => s + u.guards, 0) };
    }).sort((a, b) => b.unitList.length - a.unitList.length || a.name.localeCompare(b.name));
    const unassigned = units.filter((u) => !covered.has(u.unit_id)).map((u) => ({ ...u, guards: guardsByUnit.get(u.unit_id) ?? 0 }));
    const totalGuards = Array.from(guardsByUnit.values()).reduce((s, n) => s + n, 0);
    return { list, unassigned, totalGuards };
  }, [q.data, units]);

  const pages = Math.max(1, Math.ceil(tree.list.length / FO_PAGE));
  const Stat = ({ label, value }: { label: string; value: number }) => (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-semibold text-foreground">{q.isLoading ? "…" : value}</div>
    </div>
  );

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">Field officers and guards</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Field officers" value={tree.list.length} />
        <Stat label="Units" value={units.length} />
        <Stat label="Guards posted" value={tree.totalGuards} />
        <Stat label="Units without a field officer" value={tree.unassigned.length} />
      </div>
      {q.error ? <p className="text-sm text-destructive">Could not load the field officer chart.</p> : null}
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {tree.list.slice(page * FO_PAGE, page * FO_PAGE + FO_PAGE).map((f) => {
          const isOpen = open === f.id;
          return (
            <div key={f.id}>
              <button type="button" onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40">
                {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent"><UserRound className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{f.name}{f.inactive ? <span className="ml-2 text-xs text-destructive">inactive</span> : null}</div>
                  <div className="text-xs text-muted-foreground">{f.code}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground"><b className="text-foreground">{f.unitList.length}</b> units · <b className="text-foreground">{f.guards}</b> guards</div>
              </button>
              {isOpen ? (
                <div className="border-t border-border bg-muted/20 py-1 pl-12 pr-3">
                  {f.unitList.map((u) => (
                    <div key={u.unit_id} className="flex items-center gap-2 border-l border-border py-1.5 pl-3 text-sm">
                      <Link to="/admin/attendance/$unitId" params={{ unitId: u.unit_id }} className="shrink-0 text-primary hover:underline">{u.unit_code}</Link>
                      <span className="min-w-0 flex-1 truncate text-foreground">{u.unit_name}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5" />{u.guards}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {!q.isLoading && tree.list.length === 0 ? <div className="p-4 text-center text-sm text-muted-foreground">No field officers mapped to these units.</div> : null}
      </div>
      {pages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded border border-border px-2 py-1 disabled:opacity-40">Prev</button>
          <span className="text-muted-foreground">{page + 1} / {pages}</span>
          <button type="button" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded border border-border px-2 py-1 disabled:opacity-40">Next</button>
        </div>
      ) : null}
    </section>
  );
}
