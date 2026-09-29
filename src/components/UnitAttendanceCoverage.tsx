import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

type Row = { unit_id: string; unit_code: string; unit_name: string; days_marked: number; staff_marked: number };

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Units with an active contract that the viewer can see, split by whether any attendance exists in the range. */
export function UnitAttendanceCoverage() {
  const today = new Date();
  const [from, setFrom] = useState(iso(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(iso(today));
  const [show, setShow] = useState<"none" | "with">("none");
  const [page, setPage] = useState(0);
  const PAGE = 25;

  const q = useQuery({
    queryKey: ["unit-attendance-coverage", from, to],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as unknown as (
        fn: string,
        args: Record<string, string>,
      ) => Promise<{ data: Row[] | null; error: Error | null }>)("unit_attendance_coverage", { _from: from, _to: to });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = q.data ?? [];
  const withAtt = useMemo(() => rows.filter((r) => Number(r.days_marked) > 0), [rows]);
  const without = useMemo(() => rows.filter((r) => Number(r.days_marked) === 0), [rows]);
  const total = rows.length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const list = (show === "none" ? without : withAtt).slice().sort((a, b) => a.unit_code.localeCompare(b.unit_code));
  const pages = Math.max(1, Math.ceil(list.length / PAGE));

  const Tile = ({ label, value, sub, active, onClick }: { label: string; value: number; sub: string; active?: boolean; onClick?: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-card p-4 text-left transition-colors ${active ? "border-primary ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{q.isLoading ? "…" : value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Attendance coverage</h2>
        <div className="flex items-center gap-2 text-xs">
          <Input type="date" value={from} max={to} onChange={(e) => { setFrom(e.target.value); setPage(0); }} className="h-8 w-36" />
          <span className="text-muted-foreground">to</span>
          <Input type="date" value={to} min={from} onChange={(e) => { setTo(e.target.value); setPage(0); }} className="h-8 w-36" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile label="Total units" value={total} sub="With an active contract" />
        <Tile label="With attendance" value={withAtt.length} sub={`${pct(withAtt.length)}% of units`} active={show === "with"} onClick={() => { setShow("with"); setPage(0); }} />
        <Tile label="No attendance" value={without.length} sub={`${pct(without.length)}% of units`} active={show === "none"} onClick={() => { setShow("none"); setPage(0); }} />
      </div>
      {q.error ? <p className="text-sm text-destructive">Could not load coverage.</p> : null}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr><th className="p-2 text-left">Site</th><th className="p-2 text-left">Name</th><th className="p-2 text-right">Days marked</th><th className="p-2 text-right">Staff</th></tr>
          </thead>
          <tbody>
            {list.slice(page * PAGE, page * PAGE + PAGE).map((r) => (
              <tr key={r.unit_id} className="border-t border-border">
                <td className="p-2"><Link to="/admin/attendance/$unitId" params={{ unitId: r.unit_id }} className="text-primary hover:underline">{r.unit_code}</Link></td>
                <td className="p-2 text-foreground">{r.unit_name}</td>
                <td className="p-2 text-right">{r.days_marked}</td>
                <td className="p-2 text-right">{r.staff_marked}</td>
              </tr>
            ))}
            {!q.isLoading && list.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Nothing here.</td></tr> : null}
          </tbody>
        </table>
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
