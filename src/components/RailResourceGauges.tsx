// Leadership resource dials: chemical stock, consumption and measured carbon.
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { db, monthStart, num, rows } from "@/lib/rail-ui";
import { RailAnimatedNumber, useRailAnimatedValue } from "@/components/RailAnimatedValue";

function Gauge({ label, value, max, display, hint, good = "low", to }: { label: string; value: number; max: number; display: string; hint: string; good?: "low" | "high"; to: string }) {
  const ratio = Math.max(0, Math.min(1, max ? value / max : 0));
  const animatedRatio = useRailAnimatedValue(ratio, 1050);
  const okay = good === "high" ? ratio >= 0.66 : ratio <= 0.5;
  const bad = good === "high" ? ratio < 0.33 : ratio > 0.75;
  const tone = bad ? "var(--palette-danger-main)" : okay ? "var(--palette-good-main)" : "var(--brand-blue)";
  const sticks = Array.from({ length: 17 }, (_, i) => {
    const angle = Math.PI - i * Math.PI / 16;
    const point = (radius: number) => ({ x: 60 + radius * Math.cos(angle), y: 60 - radius * Math.sin(angle) });
    return { inner: point(29), outer: point(51), filled: (i + 0.5) / 17 <= animatedRatio };
  });
  return (
    <Link to={to as never} className="flex min-w-0 flex-col items-center rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-brand/40">
      <svg viewBox="0 0 120 70" className="w-full max-w-[180px]" role="img" aria-label={`${label}: ${display}`}>
        {sticks.map((stick, i) => <line key={i} x1={stick.inner.x} y1={stick.inner.y} x2={stick.outer.x} y2={stick.outer.y} stroke={stick.filled ? tone : "var(--muted)"} strokeWidth="4.5" strokeLinecap="round" />)}
      </svg>
      <div className="-mt-1 text-xl font-bold tabular-nums"><RailAnimatedNumber value={display} /></div>
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
      const [items, batches, kits, cons, ledger] = await Promise.all([
        rows<{ id: string; default_reorder_level: number; co2e_kg_per_unit: number | null }>(db.from("inv_items").select("id,default_reorder_level,co2e_kg_per_unit").eq("rail_category", "chemical")),
        rows<{ item_id: string; qty_on_hand: number }>(db.from("rail_item_batches").select("item_id,qty_on_hand").gt("qty_on_hand", 0)),
        rows<{ item_id: string; qty_issued: number; qty_returned: number; returned_at: string | null }>(db.from("rail_kit_issues").select("item_id,qty_issued,qty_returned,returned_at").gte("issue_date", m0)),
        rows<{ item_id: string; norm_qty: number }>(db.from("rail_job_consumption").select("item_id,norm_qty").gte("created_at", m0).limit(20000)),
        rows<{ co2e_kg: number }>(db.from("rail_resource_ledger").select("co2e_kg").gte("ledger_date", m0).limit(20000)),
      ]);
      return { items, batches, kits, cons, ledger };
    },
  });
  if (!data) return <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-lg bg-muted" />)}</div>;

  const chemicals = new Set(data.items.map((item) => item.id));
  const stock = new Map<string, number>();
  data.batches.filter((batch) => chemicals.has(batch.item_id)).forEach((batch) => stock.set(batch.item_id, (stock.get(batch.item_id) ?? 0) + Number(batch.qty_on_hand)));
  const healthy = data.items.filter((item) => (stock.get(item.id) ?? 0) >= Math.max(1, Number(item.default_reorder_level))).length;
  const returned = data.kits.filter((kit) => chemicals.has(kit.item_id) && kit.returned_at);
  const used = returned.reduce((sum, kit) => sum + Number(kit.qty_issued) - Number(kit.qty_returned), 0);
  const norm = data.cons.filter((row) => chemicals.has(row.item_id)).reduce((sum, row) => sum + Number(row.norm_qty), 0);
  const factors = new Map(data.items.filter((item) => item.co2e_kg_per_unit != null).map((item) => [item.id, Number(item.co2e_kg_per_unit)]));
  const carbonComplete = returned.length > 0 && returned.every((kit) => factors.has(kit.item_id));
  const chemicalCarbon = returned.reduce((sum, kit) => sum + (Number(kit.qty_issued) - Number(kit.qty_returned)) * (factors.get(kit.item_id) ?? 0), 0);
  const otherCarbon = data.ledger.reduce((sum, row) => sum + Number(row.co2e_kg ?? 0), 0);
  const totalCarbon = chemicalCarbon + otherCarbon;

  return (
    <section aria-label="Resources at a glance" className="space-y-2">
      <h2 className="font-heading text-base font-semibold">Resources this month</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Gauge label="Chemical stock" value={healthy} max={data.items.length || 1} display={data.items.length ? `${Math.round(healthy / data.items.length * 100)}%` : "—"} hint={data.items.length ? `${data.items.length - healthy} of ${data.items.length} products low or out` : "No chemical products recorded"} good="high" to="/admin/rail/supplies" />
        <Gauge label="Chemical consumption" value={returned.length ? used : 0} max={norm || used || 1} display={returned.length ? `${num(used, 1)} L` : "—"} hint={returned.length ? norm ? `${num(norm, 1)} L planned · from kit returns` : "From kit returns · no planned norm" : "Record kit returns to measure"} to="/admin/rail/sustainability" />
        <Gauge label="Carbon emissions" value={carbonComplete ? chemicalCarbon : 0} max={totalCarbon || 1} display={carbonComplete ? `${num(totalCarbon, 1)} kg CO₂e` : "—"} hint={carbonComplete ? `${num(chemicalCarbon, 1)} kg from chemicals` : "Set product factors and record returns"} to="/admin/rail/sustainability" />
      </div>
    </section>
  );
}
