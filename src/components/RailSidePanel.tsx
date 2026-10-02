// Fixed overview widget beside every HyperTrack page. One place filter, page-aware content.
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { PanelRightOpen, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { db, inr, monthStart, num, rows, today } from "@/lib/rail-ui";

const KEY = "rail.place.v1";
export function useRailPlace() {
  const [place, setPlaceState] = useState<string>("");
  useEffect(() => { setPlaceState(localStorage.getItem(KEY) ?? ""); }, []);
  const setPlace = (v: string) => { setPlaceState(v); localStorage.setItem(KEY, v); window.dispatchEvent(new Event("rail-place")); };
  useEffect(() => {
    const h = () => setPlaceState(localStorage.getItem(KEY) ?? "");
    window.addEventListener("rail-place", h);
    return () => window.removeEventListener("rail-place", h);
  }, []);
  return [place, setPlace] as const;
}

function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "bad" | "good" }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${tone === "bad" ? "text-destructive" : tone === "good" ? "text-brand" : ""}`}>{value}</div>
    </div>
  );
}

function List({ items, empty }: { items: { id: string; title: string; sub?: string; right?: string }[]; empty: string }) {
  if (!items.length) return <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">{empty}</div>;
  return (
    <ul className="divide-y rounded-lg border border-border/70 bg-card">
      {items.map((i) => (
        <li key={i.id} className="flex items-center gap-3 p-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-primary-foreground">{i.title.slice(0, 1)}</span>
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{i.title}</div>{i.sub && <div className="truncate text-xs text-muted-foreground">{i.sub}</div>}</div>
          {i.right && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{i.right}</span>}
        </li>
      ))}
    </ul>
  );
}

const time = (t: string | null) => (t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");

function section(path: string) {
  const s = path.split("/")[3] ?? "command";
  if (["live", "checker", "ai-check"].includes(s)) return "ops";
  if (s === "quality") return "quality";
  if (s === "supplies") return "supplies";
  if (s === "sustainability") return "resources";
  if (["billing", "finance"].includes(s)) return "money";
  return "people";
}

function PanelBody() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [place, setPlace] = useRailPlace();
  const kind = section(path);
  const loc = place || null;

  const { data: depots } = useQuery({ queryKey: ["rail-panel-depots"], staleTime: 300_000, queryFn: () => rows<{ id: string; name: string }>(db.from("rail_locations").select("id,name").eq("type", "depot").is("deleted_at", null).order("name")) });

  const { data } = useQuery({
    queryKey: ["rail-panel", kind, loc],
    refetchInterval: 60_000,
    queryFn: async () => {
      if (kind === "people") {
        const [present, required] = await Promise.all([
          rows<{ person_id: string; full_name: string; role_key: string; location_name: string | null; check_in: string | null; check_out: string | null }>(db.rpc("rail_presence", { _location: loc })),
          db.rpc("rail_required_staff", { _location: loc }).then((r: { data: number | null }) => Number(r.data ?? 0)),
        ]);
        return { present, required };
      }
      if (kind === "ops") {
        let q = db.from("rail_event_tasks").select("id,status,rail_events!inner(location_id,event_date)").eq("rail_events.event_date", today()).limit(5000);
        if (loc) q = q.eq("rail_events.location_id", loc);
        const tasks = await rows<{ status: string }>(q);
        const present = await rows<{ person_id: string; full_name: string; role_key: string; location_name: string | null; check_in: string | null }>(db.rpc("rail_presence", { _location: loc }));
        return { tasks, present };
      }
      if (kind === "quality") {
        let q = db.from("rail_complaints").select("id,status,category,created_at").neq("status", "resolved").order("created_at", { ascending: false }).limit(8);
        if (loc) q = q.eq("location_id", loc);
        return { complaints: await rows<{ id: string; status: string; category: string | null; created_at: string }>(q) };
      }
      if (kind === "supplies") {
        let q = db.from("rail_item_batches").select("id,qty_on_hand,inv_items(name,unit)").is("deleted_at", null).order("qty_on_hand").limit(8);
        if (loc) q = q.eq("location_id", loc);
        return { low: await rows<{ id: string; qty_on_hand: number; inv_items: { name: string; unit: string } | null }>(q) };
      }
      if (kind === "resources") {
        let q = db.from("rail_resource_ledger").select("resource,qty,co2e_kg").eq("ledger_date", today());
        if (loc) q = q.eq("location_id", loc);
        return { ledger: await rows<{ resource: string; qty: number; co2e_kg: number }>(q) };
      }
      const [bills, fin] = await Promise.all([
        rows<{ status: string; net_total: number; penalty_total: number }>(db.from("rail_bills").select("status,net_total,penalty_total").eq("bill_month", monthStart()).is("deleted_at", null)),
        rows<{ location_id: string; wage_cost: number; penalties: number }>(db.rpc("rail_finance_summary", { _month: monthStart() })),
      ]);
      return { bills, fin: loc ? fin.filter((f) => f.location_id === loc) : fin };
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  let body: ReactNode = <div className="h-40 animate-pulse rounded-lg bg-muted" />;
  if (d && kind === "people") {
    const onSite = d.present.filter((p: { check_out: string | null }) => !p.check_out).length;
    body = (<>
      <div className="grid grid-cols-3 gap-2"><Stat label="Required" value={num(d.required)} /><Stat label="Present" value={num(onSite)} tone="good" /><Stat label="Gap" value={num(Math.max(0, d.required - onSite))} tone={d.required > onSite ? "bad" : undefined} /></div>
      <div className="text-xs font-medium text-muted-foreground">Checked in today</div>
      <List empty="No one has checked in yet." items={d.present.map((p: { person_id: string; full_name: string; role_key: string; location_name: string | null; check_in: string | null; check_out: string | null }) => ({ id: p.person_id, title: p.full_name, sub: `${p.role_key.replace(/_/g, " ")} · ${p.location_name ?? ""}`, right: p.check_out ? "Left" : time(p.check_in) }))} />
    </>);
  } else if (d && kind === "ops") {
    const c = (s: string) => d.tasks.filter((t: { status: string }) => t.status === s).length;
    body = (<>
      <div className="grid grid-cols-3 gap-2"><Stat label="Pending" value={num(c("pending"))} /><Stat label="Running" value={num(c("in_progress"))} tone="good" /><Stat label="Done" value={num(c("done"))} /></div>
      <div className="text-xs font-medium text-muted-foreground">On duty now</div>
      <List empty="No one on duty." items={d.present.slice(0, 12).map((p: { person_id: string; full_name: string; role_key: string; check_in: string | null }) => ({ id: p.person_id, title: p.full_name, sub: p.role_key.replace(/_/g, " "), right: time(p.check_in) }))} />
    </>);
  } else if (d && kind === "quality") {
    body = (<><Stat label="Open complaints" value={num(d.complaints.length)} tone={d.complaints.length ? "bad" : undefined} />
      <List empty="No open complaints." items={d.complaints.map((c: { id: string; status: string; category: string | null; created_at: string }) => ({ id: c.id, title: c.category ?? "Complaint", sub: c.status.replace(/_/g, " "), right: c.created_at.slice(5, 10) }))} /></>);
  } else if (d && kind === "supplies") {
    body = (<><div className="text-xs font-medium text-muted-foreground">Lowest stock</div>
      <List empty="No stock recorded." items={d.low.map((b: { id: string; qty_on_hand: number; inv_items: { name: string; unit: string } | null }) => ({ id: b.id, title: b.inv_items?.name ?? "Item", right: `${num(b.qty_on_hand)} ${b.inv_items?.unit ?? ""}` }))} /></>);
  } else if (d && kind === "resources") {
    const sum = (r: string) => d.ledger.filter((l: { resource: string }) => l.resource === r).reduce((s: number, l: { qty: number }) => s + Number(l.qty), 0);
    body = (<div className="grid grid-cols-2 gap-2"><Stat label="Fresh water L" value={num(sum("water_fresh"))} /><Stat label="Recycled L" value={num(sum("water_recycled"))} tone="good" /><Stat label="Energy kWh" value={num(sum("electricity"))} /><Stat label="kg CO₂e" value={num(d.ledger.reduce((s: number, l: { co2e_kg: number }) => s + Number(l.co2e_kg), 0), 1)} /></div>);
  } else if (d) {
    const billed = d.bills.reduce((s: number, b: { net_total: number }) => s + Number(b.net_total ?? 0), 0);
    const pending = d.bills.filter((b: { status: string }) => !["certified", "paid"].includes(b.status)).reduce((s: number, b: { net_total: number }) => s + Number(b.net_total ?? 0), 0);
    const wages = d.fin.reduce((s: number, f: { wage_cost: number }) => s + Number(f.wage_cost), 0);
    const pen = d.fin.reduce((s: number, f: { penalties: number }) => s + Number(f.penalties), 0);
    body = (<div className="grid grid-cols-2 gap-2"><Stat label="Billed this month" value={inr(billed)} /><Stat label="Awaiting sign-off" value={inr(pending)} /><Stat label="Wage cost" value={inr(wages)} /><Stat label="Penalties" value={inr(pen)} tone={pen ? "bad" : undefined} /></div>);
  }

  return (
    <div className="space-y-3">
      <select aria-label="Place" value={place} onChange={(e) => setPlace(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-sm">
        <option value="">All places</option>
        {depots?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {body}
    </div>
  );
}

export function RailSidePanel() {
  return (
    <aside aria-label="Overview" className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-4 max-h-[calc(100dvh-2rem)] space-y-3 overflow-y-auto pb-4">
        <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-primary-foreground"><Users className="h-4 w-4" /></span>Overview</div>
        <PanelBody />
      </div>
    </aside>
  );
}

export function RailSidePanelMobile() {
  const [open, setOpen] = useState(false);
  return (
    <div className="xl:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-label="Open overview" className="fixed bottom-24 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-brand text-primary-foreground shadow-lg">
        <PanelRightOpen className="h-5 w-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-2xl">
          <SheetHeader><SheetTitle>Overview</SheetTitle></SheetHeader>
          <div className="mt-3"><PanelBody /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
