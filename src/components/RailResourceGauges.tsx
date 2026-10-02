// Leadership gauges on the Overview: chemical stock health, chemical and water use per coach against norm, water saved.
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { db, monthStart, num, rows } from "@/lib/rail-ui";

function Gauge({ label, value, max, display, hint, good = "low", to }: { label: string; value: number; max: number; display: string; hint: string; good?: "low" | "high"; to: string }) {
  const ratio = Math.max(0, Math.min(1, max ? value / max : 0));
  const okay = good === "high" ? ratio >= 0.66 : ratio <= 0.5;
  const bad = good === "high" ? ratio < 0.33 : ratio > 0.75;
  const tone = bad ? "var(--danger, #dc2626)" : okay ? "var(--good, #16a34a)" : "var(--brand, #2563eb)";
  const a = Math.PI * (1 - ratio); const x = 60 + 48 * Math.cos(a); const y = 60 - 48 * Math.sin(a);
  return (
    <Link to={to as never} className="flex min-w-0 flex-col items-center rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-brand/40">
      <svg viewBox="0 0 120 70" className="w-full max-w-[180px]" role="img" aria-label={`${label}: ${display}`}>
        <path d="M12 60 A48 48 0 0 1 108 60" fill="none" stroke="currentColor" className="text-muted" strokeWidth="10" strokeLinecap="round" />
        {ratio > 0 && <path d={`M12 60 A48 48 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round" />}
        <line x1="60" y1="60" x2={60 + 36 * Math.cos(a)} y2={60 - 36 * Math.sin(a)} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-foreground" />
        <circle cx="60" cy="60" r="4" className="fill-foreground" />
      </svg>
      <div className="-mt-1 text-xl font-bold tabular-nums">{display}</div>
      <div className="text-center text-sm font-medium">{label}</div>
      <div className="text-center text-xs text-muted-foreground">{hint}</div>
    </Link>
  );
}

export function RailResourceGauges() {
  const m0 = monthStart();
  const { data } = useQuery({
    queryKey: ["rail-resource-gauges", m0], refetchInterval: 120_000,
    queryFn: async () => {
      const [items, batches, kits, cons, ledger, baseline] = await Promise.all([
        rows<{ id: string; unit: string; default_reorder_level: number; rail_category: string | null }>(db.from("inv_items").select("id,unit,default_reorder_level,rail_category").eq("rail_category", "chemical")),
        rows<{ item_id: string; location_id: string; qty_on_hand: number }>(db.from("rail_item_batches").select("item_id,location_id,qty_on_hand").gt("qty_on_hand", 0)),
        rows<{ item_id: string; qty_issued: number; qty_returned: number; returned_at: string | null }>(db.from("rail_kit_issues").select("item_id,qty_issued,qty_returned,returned_at").gte("issue_date", m0)),
        rows<{ item_id: string; norm_qty: number; event_coach_id: string | null }>(db.from("rail_job_consumption").select("item_id,norm_qty,event_coach_id").gte("created_at", m0).limit(20000)),
        rows<{ resource: string; qty: number; event_coach_id: string | null; method: string | null }>(db.from("rail_resource_ledger").select("resource,qty,event_coach_id,method").gte("ledger_date", m0).limit(20000)),
        db.rpc("rail_setting", { _key: "baseline_manual_litres" }).then((r: { data: number | null }) => Number(r.data ?? 1500)),
      ]);
      return { items, batches, kits, cons, ledger, baseline };
    },
  });
  if (!data) return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-44 animate-pulse rounded-lg bg-muted" />)}</div>;
  const chem = new Set(data.items.map((i) => i.id));
  // Stock health: share of chemical items, per store holding them, at or above their low-stock level.
  const pairs = new Map<string, number>();
  data.batches.filter((b) => chem.has(b.item_id)).forEach((b) => pairs.set(`${b.item_id}|${b.location_id}`, (pairs.get(`${b.item_id}|${b.location_id}`) ?? 0) + Number(b.qty_on_hand)));
  const stores = new Set(data.batches.map((b) => b.location_id));
  let healthy = 0, total = 0;
  stores.forEach((loc) => data.items.forEach((i) => { total++; if ((pairs.get(`${i.id}|${loc}`) ?? 0) >= Math.max(1, Number(i.default_reorder_level))) healthy++; }));
  // Chemical use: what kits actually used (issued − returned) per coach cleaned, against the norm per coach.
  const coaches = new Set([...data.cons.map((c) => c.event_coach_id), ...data.ledger.map((l) => l.event_coach_id)].filter(Boolean)).size;
  const used = data.kits.filter((k) => chem.has(k.item_id) && k.returned_at).reduce((s, k) => s + Number(k.qty_issued) - Number(k.qty_returned), 0);
  const norm = data.cons.filter((c) => chem.has(c.item_id)).reduce((s, c) => s + Number(c.norm_qty), 0);
  const usedPer = coaches ? used / coaches : 0; const normPer = coaches ? norm / coaches : 0;
  // Water: fresh litres per coach against the manual-wash baseline; saved = baseline × coaches − fresh used.
  const fresh = data.ledger.filter((l) => l.resource === "water_fresh").reduce((s, l) => s + Number(l.qty), 0);
  const waterPer = coaches ? fresh / coaches : 0;
  const savedPct = coaches ? Math.max(0, 1 - fresh / (data.baseline * coaches)) : 0;
  return (
    <section aria-label="Resources at a glance" className="space-y-2">
      <div className="flex items-center justify-between"><h2 className="font-heading text-base font-semibold">Resources this month</h2><span className="text-xs text-muted-foreground">{num(coaches)} coaches cleaned</span></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Gauge label="Chemical stock health" value={healthy} max={total || 1} display={total ? `${Math.round(healthy / total * 100)}%` : "—"} hint={total ? `${total - healthy} item·store pairs low or out` : "No chemical stock yet"} good="high" to="/admin/rail/supplies" />
        <Gauge label="Chemical L per coach" value={usedPer} max={(normPer || usedPer || 1) * 2} display={coaches && used ? num(usedPer, 2) : "—"} hint={normPer ? `Norm ${num(normPer, 2)} L · from kit returns` : "Record kit returns to measure"} to="/admin/rail/sustainability" />
        <Gauge label="Fresh water L per coach" value={waterPer} max={data.baseline} display={coaches ? num(waterPer) : "—"} hint={`Manual-wash baseline ${num(data.baseline)} L`} to="/admin/rail/sustainability" />
        <Gauge label="Water saved" value={savedPct} max={1} display={coaches ? `${Math.round(savedPct * 100)}%` : "—"} hint={coaches ? `${num(Math.max(0, data.baseline * coaches - fresh) / 1000, 1)} kL vs manual wash` : "No cleaning logged"} good="high" to="/admin/rail/sustainability" />
      </div>
    </section>
  );
}
