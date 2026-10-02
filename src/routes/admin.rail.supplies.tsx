import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logActivity } from "@/lib/activity-log";
import { downloadCsv } from "@/lib/csv-export";
import { db, Empty, Kpi, num, railHead, rows, StatusPill, today } from "@/lib/rail-ui";
import { expiryState, OrdersView, StockView, StoresView, SuppliersView, TransfersView, useStockFlow, scopeSupplyLocs } from "@/components/RailStockFlow";

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
        rows<{ id: string; issue_date: string; item_id: string; qty_issued: number; qty_returned: number; location_id: string; returned_at: string | null; person_id: string | null; return_note: string | null }>(db.from("rail_kit_issues").select("id,issue_date,item_id,qty_issued,qty_returned,location_id,returned_at,person_id,return_note").gte("issue_date", since).order("issue_date", { ascending: false })),
        rows<{ id: string; item_id: string; norm_qty: number; qty: number; source: string; location_id: string; created_at: string; rail_event_coaches: { rail_coach_types: { code: string } | null } | null }>(db.from("rail_job_consumption").select("id,item_id,norm_qty,qty,source,location_id,created_at,rail_event_coaches(rail_coach_types(code))").gte("created_at", since).limit(5000)),
        rows<{ id: string; item_id: string; qty: number; status: string; reason: string | null; location_id: string; created_at: string }>(db.from("rail_purchase_requests").select("id,item_id,qty,status,reason,location_id,created_at").order("created_at", { ascending: false })),
        rows<{ id: string; qr_tag: string; name: string; category: string; status: string; location_id: string; custodian_person_id: string | null; last_pm_on: string | null; pm_every_days: number | null; warranty_until: string | null }>(db.from("rail_assets").select("id,qr_tag,name,category,status,location_id,custodian_person_id,last_pm_on,pm_every_days,warranty_until").order("qr_tag")),
        rows<{ id: string; asset_id: string; person_id: string; checked_out_at: string; due_back_at: string | null; checked_in_at: string | null }>(db.from("rail_asset_custody").select("id,asset_id,person_id,checked_out_at,due_back_at,checked_in_at").is("checked_in_at", null)),
        rows<{ id: string; asset_id: string; kind: string; status: string; due_on: string | null; opened_at: string; downtime_hours: number | null; description: string | null }>(db.from("rail_asset_maintenance").select("id,asset_id,kind,status,due_on,opened_at,downtime_hours,description").order("opened_at", { ascending: false })),
        rows<{ id: string; person_id: string; item_name: string; issued_on: string; next_due: string }>(db.from("rail_ppe_issues").select("id,person_id,item_name,issued_on,next_due").order("next_due")),
        rows<{ id: string; full_name: string; mobile: string; role_key: string; home_location_id: string | null; scope_location_id: string | null }>(db.from("rail_people").select("id,full_name,mobile,role_key,home_location_id,scope_location_id").eq("enabled", true).is("deleted_at", null)),
        rows<{ id: string; loa_number: string }>(db.from("rail_contracts").select("id,loa_number")),
      ]);
      const live = await rows<{ person_id: string }>(db.from("rail_attendance").select("person_id").eq("work_date", today()).is("check_out", null).is("deleted_at", null)).catch(() => []);
      const contractItems = await rows<{ contract_id: string; item_id: string }>(db.from("rail_contract_items").select("contract_id,item_id").is("deleted_at", null)).catch(() => []);
      return { items, batches, locs: (await db.rpc("rail_is_hq")).data ? locs : await scopeSupplyLocs(locs), kit, cons, prs, assets, custody, maint, ppe, people, contracts, contractItems, live: new Set(live.map((l) => l.person_id)) };
    },
  });
  const [loc, setLoc] = useState<string>("");
  const [tab, setTab] = useState("stores");
  const [kitForm, setKitForm] = useState({ loc: "", person_id: "", item_id: "", qty: "" });
  const [ret, setRet] = useState<{ id: string; qty: string; note: string } | null>(null);
  const flow = useStockFlow().data;

  const item = (id: string) => data?.items.find((i) => i.id === id);
  const person = (id: string | null) => data?.people.find((p) => p.id === id)?.full_name ?? "—";
  const locId = loc;

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
            const myLocs = data?.locs ?? [];
            const kitLoc = kitForm.loc || loc || (myLocs.length === 1 ? myLocs[0].id : "");
            const staff = (data?.people ?? []).filter((p) => kitLoc && (p.home_location_id === kitLoc || p.scope_location_id === kitLoc))
              .sort((a, b) => Number(data!.live.has(b.id)) - Number(data!.live.has(a.id)) || a.full_name.localeCompare(b.full_name));
            const inStore = (data?.items ?? []).map((i) => ({ i, have: kitLoc ? usableAt(i.id, kitLoc) : 0 })).filter((x) => x.have > 0);
            const have = inStore.find((x) => x.i.id === kitForm.item_id)?.have ?? 0;
            const qty = Number(kitForm.qty);
            const missing = !kitLoc ? "Choose a store" : !kitForm.person_id ? "Choose who gets the kit" : !kitForm.item_id ? "Choose an item" : !(qty > 0) ? "Enter a quantity above 0" : qty > have ? `Only ${num(have, 1)} in this store` : "";
            const approved = new Set((data?.contractItems ?? []).filter((c) => c.contract_id === contractId).map((c) => c.item_id));
            return <div className="space-y-1.5">
              <div className="grid gap-2 rounded-2xl border bg-card p-3 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={kitLoc} onChange={(e) => setKitForm({ loc: e.target.value, person_id: "", item_id: "", qty: "" })} aria-label="Store">
                  <option value="">Choose store…</option>{myLocs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={kitForm.person_id} onChange={(e) => setKitForm({ ...kitForm, person_id: e.target.value })} aria-label="Employee" disabled={!kitLoc}>
                  <option value="">{kitLoc ? (staff.length ? "Choose employee…" : "No staff at this store") : "Choose store first"}</option>
                  {staff.map((p) => <option key={p.id} value={p.id}>{data!.live.has(p.id) ? "● " : ""}{p.full_name} · {p.role_key.replace(/_/g, " ")}{data!.live.has(p.id) ? " (on shift)" : ""}</option>)}
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={kitForm.item_id} onChange={(e) => setKitForm({ ...kitForm, item_id: e.target.value })} aria-label="Item" disabled={!kitLoc}>
                  <option value="">{kitLoc ? (inStore.length ? "Choose item…" : "Nothing in stock here") : "Choose store first"}</option>
                  {inStore.map(({ i, have: h }) => <option key={i.id} value={i.id}>{i.name} — {num(h, 1)} {i.unit} in stock</option>)}
                </select>
                <Input type="number" min={1} placeholder={kitForm.item_id ? `Qty (max ${num(have, 1)})` : "Qty"} value={kitForm.qty} onChange={(e) => setKitForm({ ...kitForm, qty: e.target.value })} />
                <Button disabled={!!missing} onClick={async () => (await act(db.from("rail_kit_issues").insert({ item_id: kitForm.item_id, qty_issued: qty, location_id: kitLoc, person_id: kitForm.person_id, contract_id: contractId && approved.has(kitForm.item_id) ? contractId : null }), "Kit issued — stock reduced", { action: "kit_issue", table: "rail_kit_issues" })) && (setKitForm({ loc: kitForm.loc, person_id: kitForm.person_id, item_id: "", qty: "" }), inv())}>Issue kit</Button>
              </div>
              {missing && <p className="px-1 text-xs text-muted-foreground">{missing} to issue.</p>}
            </div>;
          })()}
          {(() => {
            const list = (data?.kit ?? []).filter((k) => !loc || k.location_id === loc);
            const open = ret ? data?.kit.find((k) => k.id === ret.id) : undefined;
            const back = Number(ret?.qty ?? "");
            const bad = !ret || ret.qty === "" || !Number.isFinite(back) || back < 0 || (open && back > Number(open.qty_issued));
            return <>
              {!list.length ? <Empty title="No kits issued in the last 30 days" /> :
                <div className="divide-y rounded-2xl border bg-card">{list.map((k) => (
                  <div key={k.id} className="flex items-center justify-between gap-2 p-3 text-sm"><div className="min-w-0"><div className="font-medium">{item(k.item_id)?.name} × {num(k.qty_issued, 1)} {item(k.item_id)?.unit} · {person(k.person_id)}</div>
                    <div className="text-xs text-muted-foreground">{k.issue_date} · {data?.locs.find((l) => l.id === k.location_id)?.name ?? ""}{k.returned_at ? ` · returned ${num(k.qty_returned, 1)}, used ${num(Number(k.qty_issued) - Number(k.qty_returned), 1)}` : " · out with employee"}{k.return_note ? ` · ${k.return_note}` : ""}</div></div>
                    {!k.returned_at && <Button size="sm" variant="outline" onClick={() => setRet({ id: k.id, qty: "0", note: "" })}>Record return</Button>}</div>))}</div>}
              <Dialog open={!!ret} onOpenChange={(o) => !o && setRet(null)}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record return</DialogTitle></DialogHeader>
                  {open && ret && <div className="space-y-3 text-sm">
                    <div className="rounded-xl bg-muted/50 p-3"><div className="font-medium">{item(open.item_id)?.name}</div><div className="text-xs text-muted-foreground">{person(open.person_id)} · issued {num(open.qty_issued, 1)} {item(open.item_id)?.unit} on {open.issue_date}</div></div>
                    <label className="block space-y-1"><span className="text-xs font-medium">Quantity returned (0 to {num(open.qty_issued, 1)})</span><Input type="number" min={0} max={Number(open.qty_issued)} value={ret.qty} onChange={(e) => setRet({ ...ret, qty: e.target.value })} /></label>
                    <label className="block space-y-1"><span className="text-xs font-medium">Note (optional)</span><Input placeholder="e.g. bottle half used" value={ret.note} onChange={(e) => setRet({ ...ret, note: e.target.value })} /></label>
                    {!bad && <div className="rounded-xl border p-3 text-xs">Used on the job: <b>{num(Number(open.qty_issued) - back, 1)} {item(open.item_id)?.unit}</b> · Back into store stock: <b>{num(back, 1)}</b></div>}
                  </div>}
                  <DialogFooter><Button variant="outline" onClick={() => setRet(null)}>Cancel</Button>
                    <Button disabled={!!bad} onClick={async () => { if (!ret) return; (await act(db.from("rail_kit_issues").update({ qty_returned: back, return_note: ret.note || null, returned_at: new Date().toISOString() }).eq("id", ret.id), "Return recorded — stock updated", { action: "kit_return", table: "rail_kit_issues" })) && (setRet(null), inv()); }}>Save return</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </>;
          })()}
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
