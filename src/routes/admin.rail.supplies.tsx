import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logActivity } from "@/lib/activity-log";
import { downloadCsv } from "@/lib/csv-export";
import { db, Empty, Kpi, num, railHead, rows, StatusPill, today } from "@/lib/rail-ui";
import { expiryState, OrdersView, StockView, StoresView, SuppliersView, TransfersView, useStockFlow } from "@/components/RailStockFlow";

export const Route = createFileRoute("/admin/rail/supplies")({
  head: () => railHead("Supplies & Equipment", "Chemical stock with days of cover, kit issue, consumption variance, purchases, equipment custody, maintenance and PPE."),
  component: SuppliesPage,
});

type Item = { id: string; item_code: string; name: string; unit: string; default_reorder_level: number; is_concentrate: boolean; dilution_ratio: string | null; hazard_class: string | null };
type Loc = { id: string; code: string; name: string; type: string };

async function act(p: PromiseLike<{ error: { message: string } | null }>, msg: string, log?: Record<string, unknown>) {
  const { error } = await p;
  if (error) { toast.error(error.message); return false; }
  toast.success(msg);
  if (log) void logActivity({ module: "Rail Supplies", action: String(log.action ?? "update"), entityType: String(log.table ?? "rail_supplies"), details: log });
  return true;
}

function SuppliesPage() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["rail-sup"] });
  const { data } = useQuery({
    queryKey: ["rail-sup"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
      const [items, batches, locs, kit, cons, prs, assets, custody, maint, ppe, people, contracts] = await Promise.all([
        rows<Item>(db.from("inv_items").select("id,item_code,name,unit,default_reorder_level,is_concentrate,dilution_ratio,hazard_class").not("rail_category", "is", null).order("item_code")),
        rows<{ item_id: string; location_id: string; qty_on_hand: number; expiry_date: string | null }>(db.from("rail_item_batches").select("item_id,location_id,qty_on_hand,expiry_date")),
        rows<Loc>(db.from("rail_locations").select("id,code,name,type").in("type", ["depot", "station", "store"])),
        rows<{ id: string; issue_date: string; item_id: string; qty_issued: number; qty_returned: number; location_id: string; returned_at: string | null }>(db.from("rail_kit_issues").select("id,issue_date,item_id,qty_issued,qty_returned,location_id,returned_at").gte("issue_date", since).order("issue_date", { ascending: false })),
        rows<{ id: string; item_id: string; norm_qty: number; qty: number; source: string; location_id: string; created_at: string; rail_event_coaches: { rail_coach_types: { code: string } | null } | null }>(db.from("rail_job_consumption").select("id,item_id,norm_qty,qty,source,location_id,created_at,rail_event_coaches(rail_coach_types(code))").gte("created_at", since).limit(5000)),
        rows<{ id: string; item_id: string; qty: number; status: string; reason: string | null; location_id: string; created_at: string }>(db.from("rail_purchase_requests").select("id,item_id,qty,status,reason,location_id,created_at").order("created_at", { ascending: false })),
        rows<{ id: string; qr_tag: string; name: string; category: string; status: string; location_id: string; custodian_person_id: string | null; last_pm_on: string | null; pm_every_days: number | null; warranty_until: string | null }>(db.from("rail_assets").select("id,qr_tag,name,category,status,location_id,custodian_person_id,last_pm_on,pm_every_days,warranty_until").order("qr_tag")),
        rows<{ id: string; asset_id: string; person_id: string; checked_out_at: string; due_back_at: string | null; checked_in_at: string | null }>(db.from("rail_asset_custody").select("id,asset_id,person_id,checked_out_at,due_back_at,checked_in_at").is("checked_in_at", null)),
        rows<{ id: string; asset_id: string; kind: string; status: string; due_on: string | null; opened_at: string; downtime_hours: number | null; description: string | null }>(db.from("rail_asset_maintenance").select("id,asset_id,kind,status,due_on,opened_at,downtime_hours,description").order("opened_at", { ascending: false })),
        rows<{ id: string; person_id: string; item_name: string; issued_on: string; next_due: string }>(db.from("rail_ppe_issues").select("id,person_id,item_name,issued_on,next_due").order("next_due")),
        rows<{ id: string; full_name: string; mobile: string; role_key: string }>(db.from("rail_people").select("id,full_name,mobile,role_key").eq("enabled", true)),
        rows<{ id: string; loa_number: string }>(db.from("rail_contracts").select("id,loa_number")),
      ]);
      const contractItems = await rows<{ contract_id: string; item_id: string }>(db.from("rail_contract_items").select("contract_id,item_id").is("deleted_at", null)).catch(() => []);
      return { items, batches, locs, kit, cons, prs, assets, custody, maint, ppe, people, contracts, contractItems };
    },
  });
  const [loc, setLoc] = useState<string>("");
  const [tab, setTab] = useState("stores");
  const [kitForm, setKitForm] = useState({ loc: "", item_id: "", qty: "" });
  const flow = useStockFlow().data;

  const item = (id: string) => data?.items.find((i) => i.id === id);
  const person = (id: string | null) => data?.people.find((p) => p.id === id)?.full_name ?? "—";
  const locId = loc;

  const stock = (data?.items ?? []).map((i) => {
    const onHand = data!.batches.filter((b) => b.item_id === i.id && (!locId || b.location_id === locId) && expiryState(b.expiry_date) !== "expired").reduce((s, b) => s + Number(b.qty_on_hand), 0);
    return { ...i, onHand };
  });
  // Low stock is judged per store (same rule as the Stores cards), so "All stores" adds up each store's low items.
  const usableAt = (itemId: string, at: string) => (data?.batches ?? []).filter((b) => b.item_id === itemId && b.location_id === at && expiryState(b.expiry_date) !== "expired").reduce((s, b) => s + Number(b.qty_on_hand), 0);
  const lowCount = (data?.locs ?? []).filter((l) => !locId || l.id === locId).reduce((n, l) => n + (data?.items ?? []).filter((i) => usableAt(i.id, l.id) < Number(i.default_reorder_level)).length, 0);
  const scopedBatches = (data?.batches ?? []).filter((b) => (!locId || b.location_id === locId) && Number(b.qty_on_hand) > 0);
  const pendingReq = (flow?.prs ?? []).filter((p) => (!locId || p.location_id === locId) && p.status === "requested").length
    + (flow?.trfs ?? []).filter((t) => (!locId || t.from_location_id === locId || t.to_location_id === locId) && t.status === "requested").length;

  // Variance by coach type
  const variance = Object.values((data?.cons ?? []).reduce<Record<string, { key: string; norm: number; actual: number; n: number }>>((m, c) => {
    const k = `${item(c.item_id)?.name ?? "?"} · ${c.rail_event_coaches?.rail_coach_types?.code ?? "?"}`;
    m[k] ??= { key: k, norm: 0, actual: 0, n: 0 };
    m[k].norm += Number(c.norm_qty); m[k].actual += Number(c.qty); m[k].n++;
    return m;
  }, {})).map((v) => ({ ...v, pct: v.norm ? Math.round((v.actual / v.norm - 1) * 100) : 0 })).sort((a, b) => b.pct - a.pct);

  const contractId = data?.contracts[0]?.id;

  return (
    <div className="space-y-5">
      <RailTopbarSlot>
        <select className="h-10 w-44 max-w-full shrink-0 rounded-lg border border-border bg-card px-3 pr-8 text-sm text-foreground" value={locId} onChange={(e) => setLoc(e.target.value)} aria-label="Store">
          <option value="">All stores</option>
          {data?.locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </RailTopbarSlot>
      <PageHeader title="Supplies & Equipment" description="Stock by store, expiry, requests, supplier orders and transfers." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Low stock items" value={lowCount} tone="bad" />
        <Kpi label="Expired batches" value={scopedBatches.filter((b) => expiryState(b.expiry_date) === "expired").length} tone="bad" />
        <Kpi label="Expiring in 60 days" value={scopedBatches.filter((b) => expiryState(b.expiry_date) === "soon").length} tone="warn" />
        <Kpi label="Requests waiting" value={pendingReq} />
        <Kpi label="Equipment out" value={data?.custody.length ?? 0} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          {[["stores", "Stores"], ["stock", "Stock"], ["orders", "Requests"], ["transfers", "Transfers"], ["kit", "Kits"], ["custody", "Equipment"], ["suppliers", "Suppliers"]].map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="stock"><StockView locId={loc} /></TabsContent>
        <TabsContent value="stores"><StoresView onPick={(id) => { setLoc(id); setTab("stock"); }} onTransfer={() => setTab("transfers")} /></TabsContent>
        <TabsContent value="orders"><OrdersView locId={loc} /></TabsContent>
        <TabsContent value="transfers"><TransfersView locId={loc} /></TabsContent>
        <TabsContent value="suppliers"><SuppliersView /></TabsContent>

        <TabsContent value="kit" className="space-y-3">
          {(() => {
            const kitLoc = kitForm.loc || loc;
            const allowed = new Set((data?.contractItems ?? []).filter((c) => c.contract_id === contractId).map((c) => c.item_id));
            const kitItems = (data?.items ?? []).filter((i) => !contractId || allowed.has(i.id));
            const qty = Number(kitForm.qty);
            const missing = !kitLoc ? "Choose a store" : !kitForm.item_id ? "Choose an item" : !(qty > 0) ? "Enter a quantity above 0" : "";
            return <div className="space-y-1.5">
              <div className="grid gap-2 rounded-2xl border bg-card p-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={kitLoc} onChange={(e) => setKitForm({ ...kitForm, loc: e.target.value })} aria-label="Store">
                  <option value="">Choose store…</option>{data?.locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={kitForm.item_id} onChange={(e) => setKitForm({ ...kitForm, item_id: e.target.value })} aria-label="Item">
                  <option value="">Choose item…</option>{kitItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <Input type="number" min={1} placeholder="Qty" value={kitForm.qty} onChange={(e) => setKitForm({ ...kitForm, qty: e.target.value })} />
                <Button disabled={!!missing} onClick={async () => (await act(db.from("rail_kit_issues").insert({ item_id: kitForm.item_id, qty_issued: qty, location_id: kitLoc, contract_id: contractId ?? null }), "Kit issued", { action: "kit_issue", table: "rail_kit_issues" })) && (setKitForm({ loc: kitForm.loc, item_id: "", qty: "" }), inv())}>Issue to shift</Button>
              </div>
              {missing && <p className="px-1 text-xs text-muted-foreground">{missing} to issue.</p>}
              {contractId && !kitItems.length && <p className="px-1 text-xs text-destructive">No items are approved for the contract yet — add them in Configuration Hub first.</p>}
            </div>;
          })()}
          {!data?.kit.length ? <Empty title="No kits issued in the last 30 days" /> :
            <div className="divide-y rounded-2xl border bg-card">{data.kit.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{item(k.item_id)?.name}</div><div className="text-xs text-muted-foreground">{k.issue_date} · issued {k.qty_issued} · returned {k.qty_returned}</div></div>
                {!k.returned_at && <Button size="sm" variant="outline" onClick={async () => { const r = window.prompt(`Quantity returned at end of shift? (0 to ${k.qty_issued})`, "0"); if (r === null) return; const back = Number(r); if (!Number.isFinite(back) || back < 0 || back > Number(k.qty_issued)) { toast.error(`Enter a number between 0 and ${k.qty_issued}.`); return; } (await act(db.from("rail_kit_issues").update({ qty_returned: back, returned_at: new Date().toISOString() }).eq("id", k.id), "Return recorded")) && inv(); }}>Record return</Button>}</div>))}</div>}
        </TabsContent>

        <TabsContent value="kit" data-merged="variance" className="space-y-2">
          <div className="flex justify-end"><Button variant="outline" size="sm" onClick={() => downloadCsv(`consumption-variance-${today()}`, variance)}>Export</Button></div>
          {!variance.length ? <Empty title="No consumption recorded yet" hint="Usage is filled from norms when a cleaning job completes." /> :
            <div className="divide-y rounded-2xl border bg-card">{variance.map((v, i) => (
              <div key={v.key} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{i + 1}. {v.key}</div><div className="text-xs text-muted-foreground">{v.n} coaches · norm {num(v.norm, 2)} · actual {num(v.actual, 2)}</div></div>
                 <div className={v.pct > 25 ? "font-semibold text-destructive" : v.pct < -10 ? "text-warning" : "text-muted-foreground"}>{v.pct > 0 ? "+" : ""}{v.pct}%</div></div>))}</div>}
        </TabsContent>

        <TabsContent value="custody">
          {!data?.assets.length ? <Empty title="No equipment registered" /> :
            <div className="overflow-x-auto rounded-2xl border bg-card"><table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr className="border-b"><th className="p-3">QR</th><th>Item</th><th>Status</th><th>Held by</th><th>Due back</th></tr></thead>
              <tbody>{data.assets.filter((a) => !locId || a.location_id === locId).map((a) => { const c = data.custody.find((x) => x.asset_id === a.id); const overdue = c?.due_back_at && new Date(c.due_back_at) < new Date();
                return <tr key={a.id} className="border-b last:border-0"><td className="p-3 font-mono text-xs">{a.qr_tag}</td><td>{a.name}</td><td><StatusPill s={a.status} /></td><td>{person(a.custodian_person_id)}</td><td className={overdue ? "text-destructive font-medium" : ""}>{c?.due_back_at ? new Date(c.due_back_at).toLocaleString() : "—"}</td></tr>; })}</tbody></table></div>}
        </TabsContent>


        <TabsContent value="custody" data-merged="maintenance" className="space-y-3">
          <div className="text-sm font-medium">Preventive schedule</div>
          <div className="divide-y rounded-2xl border bg-card">{(data?.assets ?? []).filter((a) => a.pm_every_days && (!locId || a.location_id === locId)).map((a) => {
            const next = new Date(new Date(a.last_pm_on ?? "2025-06-01").getTime() + a.pm_every_days! * 864e5); const late = next < new Date();
            return <div key={a.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{a.name} <span className="font-mono text-xs text-muted-foreground">{a.qr_tag}</span></div><div className={`text-xs ${late ? "text-destructive" : "text-muted-foreground"}`}>Next service {next.toLocaleDateString()}</div></div>
              <div className="flex gap-2"><Button size="sm" variant="outline" onClick={async () => (await act(db.from("rail_assets").update({ last_pm_on: today() }).eq("id", a.id), "Service recorded")) && inv()}>Serviced</Button>
                <Button size="sm" variant="ghost" onClick={async () => { const d = window.prompt("Describe the breakdown"); if (!d) return; (await act(db.from("rail_asset_maintenance").insert({ asset_id: a.id, kind: "breakdown", description: d, location_id: a.location_id }), "Breakdown ticket opened")) && (await db.from("rail_assets").update({ status: "maintenance" }).eq("id", a.id), inv()); }}>Breakdown</Button></div></div>; })}</div>
          <div className="text-sm font-medium">Tickets</div>
          {!data?.maint.length ? <Empty title="No maintenance tickets" /> : <div className="divide-y rounded-2xl border bg-card">{data.maint.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{data.assets.find((a) => a.id === m.asset_id)?.name} · {m.kind}</div><div className="text-xs text-muted-foreground">{m.description} · opened {new Date(m.opened_at).toLocaleString()}{m.downtime_hours != null && ` · downtime ${m.downtime_hours} h`}</div></div>
              {m.status === "open" ? <Button size="sm" variant="outline" onClick={async () => (await act(db.from("rail_asset_maintenance").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", m.id), "Closed")) && (await db.from("rail_assets").update({ status: "available" }).eq("id", m.asset_id), inv())}>Close</Button> : <StatusPill s="resolved" />}</div>))}</div>}
        </TabsContent>

        <TabsContent value="custody" data-merged="ppe">
          {!data?.ppe.length ? <Empty title="No PPE issued" /> : <div className="divide-y rounded-2xl border bg-card">{data.ppe.map((p) => { const late = new Date(p.next_due) < new Date();
            return <div key={p.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{person(p.person_id)} · {p.item_name}</div><div className="text-xs text-muted-foreground">Issued {p.issued_on}</div></div><div className={late ? "text-destructive font-medium" : "text-muted-foreground"}>Replace by {p.next_due}</div></div>; })}</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
