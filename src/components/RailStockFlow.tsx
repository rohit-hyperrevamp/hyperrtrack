import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { confirmAction } from "@/components/ConfirmProvider";
import { logActivity } from "@/lib/activity-log";
import { downloadCsv } from "@/lib/csv-export";
import { supabase } from "@/integrations/supabase/client";
import { db, Empty, num, rows, StatusPill, today } from "@/lib/rail-ui";

type Item = { id: string; item_code: string; name: string; unit: string; default_reorder_level: number; rail_category: string | null; hazard_class: string | null };
type Loc = { id: string; code: string; name: string; type: string };
type Batch = { id: string; item_id: string; location_id: string; batch_no: string | null; qty_on_hand: number; expiry_date: string | null };
type PR = { id: string; item_id: string; qty: number; status: string; reason: string | null; location_id: string; created_at: string; vendor_id: string | null; po_number: string | null; unit_price: number | null; expected_on: string | null; requested_by: string | null; decision_note: string | null };
type Trf = { id: string; item_id: string; from_location_id: string; to_location_id: string; qty: number; status: string; note: string | null; created_at: string; requested_by: string | null; refuse_reason: string | null; request_id: string | null };
type Vendor = { id: string; name: string; phone: string | null; email: string | null; gstin: string | null; lead_days: number };

const sel = "h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm";
// One responsive form row for every Supplies form: fields wrap instead of squeezing to unreadable widths.
const formRow = "grid gap-2 rounded-2xl border bg-card p-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]";
const subRow = "grid gap-2 rounded-xl bg-muted/50 p-2 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]";
const DAY = 864e5;
export function expiryState(d: string | null): "expired" | "soon" | "ok" | "none" {
  if (!d) return "none";
  const left = new Date(d).getTime() - Date.now();
  return left < 0 ? "expired" : left < 60 * DAY ? "soon" : "ok";
}
const expiryLabel = { expired: "Expired", soon: "Expiring soon", ok: "OK", none: "No expiry" } as const;
const expiryTone = { expired: "text-destructive font-semibold", soon: "text-warning font-medium", ok: "text-muted-foreground", none: "text-muted-foreground" } as const;

async function act(p: PromiseLike<{ error: { message: string } | null }>, msg: string, action: string, details: Record<string, unknown> = {}) {
  const { error } = await p;
  if (error) { toast.error(error.message); return false; }
  toast.success(msg);
  void logActivity({ module: "Rail Supplies", action, entityType: "rail_inventory", details });
  return true;
}

export function useStockFlow() {
  return useQuery({
    queryKey: ["rail-stock-flow"],
    queryFn: async () => {
      const [items, locs, batches, prs, trfs, vendors] = await Promise.all([
        rows<Item>(db.from("inv_items").select("id,item_code,name,unit,default_reorder_level,rail_category,hazard_class").not("rail_category", "is", null).order("name")),
        rows<Loc>(db.from("rail_locations").select("id,code,name,type").in("type", ["depot", "station", "store"]).is("deleted_at", null).order("name")),
        rows<Batch>(db.from("rail_item_batches").select("id,item_id,location_id,batch_no,qty_on_hand,expiry_date").gt("qty_on_hand", 0)),
        rows<PR>(db.from("rail_purchase_requests").select("id,item_id,qty,status,reason,location_id,created_at,vendor_id,po_number,unit_price,expected_on,requested_by,decision_note").order("created_at", { ascending: false })),
        rows<Trf>(db.from("rail_stock_transfers").select("id,item_id,from_location_id,to_location_id,qty,status,note,created_at,requested_by,refuse_reason,request_id").order("created_at", { ascending: false })),
        rows<Vendor>(db.from("rail_vendors").select("id,name,phone,email,gstin,lead_days").order("name")),
      ]);
      // Requests need a second person to approve (database rule), so the UI must know who is signed in.
      const me = (await supabase.auth.getUser()).data.user?.id ?? null;
      const allLocs = locs;
      const [{ data: hq }, { data: mainStore }] = await Promise.all([db.rpc("rail_is_hq"), db.rpc("rail_main_store_id")]);
      const isHq = !!hq; const mainId = (mainStore as string | null) ?? "";
      return { items, locs: isHq ? locs : await scopeSupplyLocs(locs), allLocs, batches, prs, trfs, vendors, me, isHq, mainId };
    },
  });
}

/** Keep only stores the signed-in user may see in Supplies (database rail_can, depot/contract scope aware). */
export async function scopeSupplyLocs<T extends { id: string }>(locs: T[]): Promise<T[]> {
  const checks = await Promise.all(
    locs.map((l) => (supabase.rpc as never as (f: string, a: object) => Promise<{ data: boolean | null }>)("rail_can", { _module: "rail_supplies", _action: "view", _location: l.id }).then((r) => !!r.data).catch(() => false)),
  );
  return locs.filter((_, i) => checks[i]);
}

/** Filter bar shared by stock views: search, category, status. */
function Filters({ q, setQ, cat, setCat, status, setStatus, statuses }: { q: string; setQ: (v: string) => void; cat: string; setCat: (v: string) => void; status: string; setStatus: (v: string) => void; statuses: [string, string][] }) {
  return (
    <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr]">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search item or code" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <select className={sel} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
        <option value="">All categories</option><option value="chemical">Chemicals</option><option value="consumable">Consumables</option>
      </select>
      <select className={sel} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
        {statuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

export function StockView({ locId }: { locId: string }) {
  const { data } = useStockFlow();
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [status, setStatus] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const locName = (id: string) => data?.allLocs.find((l) => l.id === id)?.name ?? "—";
  const list = useMemo(() => (data?.items ?? []).map((i) => {
    const bs = data!.batches.filter((b) => b.item_id === i.id && (!locId || b.location_id === locId));
    const usable = bs.filter((b) => expiryState(b.expiry_date) !== "expired").reduce((s, b) => s + Number(b.qty_on_hand), 0);
    const expired = bs.filter((b) => expiryState(b.expiry_date) === "expired").reduce((s, b) => s + Number(b.qty_on_hand), 0);
    const soon = bs.filter((b) => expiryState(b.expiry_date) === "soon");
    const next = bs.map((b) => b.expiry_date).filter((d): d is string => !!d && expiryState(d) !== "expired").sort()[0] ?? null;
    const low = usable < Number(i.default_reorder_level);
    return { ...i, bs, usable, expired, soonCount: soon.length, next, low };
  }).filter((r) => (!cat || r.rail_category === cat)
    && (!q || `${r.name} ${r.item_code}`.toLowerCase().includes(q.toLowerCase()))
    && (!status || (status === "low" && r.low) || (status === "soon" && r.soonCount > 0) || (status === "expired" && r.expired > 0))), [data, locId, q, cat, status]);

  return (
    <div className="space-y-3">
      <Filters {...{ q, setQ, cat, setCat, status, setStatus }} statuses={[["", "All stock"], ["low", "Low stock"], ["soon", "Expiring soon"], ["expired", "Expired"]]} />
      <div className="flex justify-end"><Button variant="outline" size="sm" onClick={() => downloadCsv(`stock-${today()}`, list.map((r) => ({ item: r.name, code: r.item_code, store: locId ? locName(locId) : "All stores", usable: r.usable, expired: r.expired, unit: r.unit, reorder_level: r.default_reorder_level, next_expiry: r.next ?? "" })))}>Export</Button></div>
      {!list.length ? <Empty title="Nothing matches" hint="Change the search or filters." /> :
        <div className="divide-y rounded-2xl border bg-card">{list.map((r) => (
          <div key={r.id} className="p-3 text-sm">
            <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen(open === r.id ? null : r.id)}>
              <div className="min-w-0"><div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.item_code} · {r.rail_category} · reorder at {num(r.default_reorder_level)} {r.unit}{r.next && ` · next expiry ${r.next}`}</div></div>
              <div className="flex shrink-0 items-center gap-2">
                {r.expired > 0 && <StatusPill s="expired" />}
                {r.soonCount > 0 && <StatusPill s="expiring" />}
                {r.low && <StatusPill s="low" />}
                <span className={r.low ? "font-semibold text-destructive" : "font-semibold"}>{num(r.usable, 1)} {r.unit}</span>
              </div>
            </button>
            {open === r.id && (
              !r.bs.length ? <div className="mt-2 text-xs text-muted-foreground">No batches in stock.</div> :
              <div className="mt-2 space-y-1 rounded-xl bg-muted/50 p-2">{r.bs.sort((a, b) => (a.expiry_date ?? "9").localeCompare(b.expiry_date ?? "9")).map((b) => { const st = expiryState(b.expiry_date); return (
                <div key={b.id} className="flex items-center justify-between text-xs"><span>{b.batch_no ?? "Batch"} · {locName(b.location_id)}</span>
                  <span className="flex gap-3"><span>{num(b.qty_on_hand, 1)} {r.unit}</span><span className={expiryTone[st]}>{b.expiry_date ? `${expiryLabel[st]} · ${b.expiry_date}` : expiryLabel[st]}</span></span></div>); })}</div>
            )}
          </div>))}</div>}
    </div>
  );
}

type Kv = { id: string; key: string; text_value: string | null };
export const useStoreSettings = () => useQuery({
  queryKey: ["rail-store-settings"],
  queryFn: () => rows<Kv>(db.from("rail_settings_kv").select("id,key,text_value").in("key", ["org_name", "main_store_id"]).is("deleted_at", null).is("effective_to", null)),
});

export async function saveStoreSetting(existing: Kv | undefined, key: string, text: string) {
  const r = existing
    ? await db.from("rail_settings_kv").update({ text_value: text }).eq("id", existing.id)
    : await db.from("rail_settings_kv").insert({ key, text_value: text, description: key === "org_name" ? "Your company name" : "Main store / godown that supplies other stores" });
  if (r.error) { toast.error(r.error.message); return false; }
  void logActivity({ module: "Rail Supplies", action: "update", entityType: "rail_settings_kv", entityLabel: key, details: { value: text } });
  return true;
}

export function StoresView({ onPick, onTransfer }: { onPick: (id: string) => void; onTransfer?: () => void }) {
  const { data } = useStockFlow();
  const settings = useStoreSettings();
  const [q, setQ] = useState("");
  const mainRow = settings.data?.find((s) => s.key === "main_store_id");
  const mainId = mainRow?.text_value ?? "";

  const stores = (data?.locs ?? []).filter((l) => !q || l.name.toLowerCase().includes(q.toLowerCase())).map((l) => {
    const low = (data?.items ?? []).filter((i) => data!.batches.filter((b) => b.item_id === i.id && b.location_id === l.id && expiryState(b.expiry_date) !== "expired").reduce((s, b) => s + Number(b.qty_on_hand), 0) < Number(i.default_reorder_level)).length;
    const units = data!.batches.filter((b) => b.location_id === l.id && expiryState(b.expiry_date) !== "expired").reduce((s, b) => s + Number(b.qty_on_hand), 0);
    const pending = data!.prs.filter((p) => p.location_id === l.id && p.status === "requested").length + data!.trfs.filter((t) => (t.from_location_id === l.id || t.to_location_id === l.id) && t.status === "requested").length;
    return { ...l, low, units, pending, main: l.id === mainId };
  }).sort((a, b) => Number(b.main) - Number(a.main) || b.pending - a.pending || b.low - a.low);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Add stores and item types in Configuration Hub → Organization.</p>
        {onTransfer && <Button size="sm" onClick={onTransfer}>Send stock</Button>}
      </div>

      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search store" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {!stores.length ? <Empty title="No stores yet" hint="Add your main godown in Configuration Hub → Organization." /> :
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stores.map((s) => (
          <div key={s.id} className={`rounded-2xl border p-4 ${s.main ? "border-2 border-brand bg-brand/5 shadow-md ring-4 ring-brand/10 sm:col-span-2 lg:col-span-1" : "bg-card"}`}>
            <button type="button" onClick={() => onPick(s.id)} className="block w-full text-left">
              <div className="flex min-w-0 items-center gap-2"><span className="min-w-0 truncate font-semibold">{s.name}</span>{s.main && <span className="shrink-0 whitespace-nowrap rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Head office</span>}</div>
              <div className="text-xs capitalize text-muted-foreground">{s.type} · {s.code}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div><div className="text-lg font-bold">{num(s.units)}</div>In stock</div>
                <div><div className={`text-lg font-bold ${s.low ? "text-destructive" : ""}`}>{s.low}</div>Low items</div>
                <div><div className={`text-lg font-bold ${s.pending ? "text-brand" : ""}`}>{s.pending}</div>Requests</div>
              </div>
            </button>
          </div>))}</div>}
    </div>
  );
}

const usable = (batches: Batch[], itemId: string, at: string) => batches.filter((b) => b.item_id === itemId && b.location_id === at && expiryState(b.expiry_date) !== "expired").reduce((s, b) => s + Number(b.qty_on_hand), 0);
const PR_LABEL: Record<string, string> = { requested: "Waiting for head office", approved: "Waiting for head office", ordered: "Ordered from supplier", sending: "On the way", received: "Received", rejected: "Rejected by head office", refused: "Refused by store" };

/** Store requests: any store asks head office; head office sends from the main store or buys from a supplier (delivered straight to the store). */
export function OrdersView({ locId }: { locId: string }) {
  const { data } = useStockFlow();
  const qc = useQueryClient();
  const inv = () => { void qc.invalidateQueries({ queryKey: ["rail-stock-flow"] }); void qc.invalidateQueries({ queryKey: ["rail-sup"] }); };
  const [f, setF] = useState({ item_id: "", qty: "", reason: "", loc: "" });
  const [status, setStatus] = useState("open");
  const [mode, setMode] = useState<Record<string, "send" | "buy" | "reject" | "">>({});
  const [po, setPo] = useState<Record<string, { vendor_id: string; unit_price: string; expected_on: string }>>({});
  const [sendQty, setSendQty] = useState<Record<string, string>>({});
  const [why, setWhy] = useState<Record<string, string>>({});
  const [grn, setGrn] = useState<Record<string, { qty: string; batch: string; expiry: string }>>({});
  const item = (id: string) => data?.items.find((i) => i.id === id);
  const loc = (id: string) => data?.allLocs.find((l) => l.id === id)?.name ?? "—";
  const vendor = (id: string | null) => data?.vendors.find((v) => v.id === id)?.name;
  const isHq = !!data?.isHq; const mainId = data?.mainId ?? "";
  const myLocs = data?.locs ?? [];
  const target = f.loc || locId || (isHq && mainId ? mainId : myLocs[0]?.id ?? "");
  const canEdit = (at: string) => isHq || myLocs.some((l) => l.id === at);
  const open = ["requested", "approved", "ordered", "sending"];
  const list = (data?.prs ?? []).filter((p) => (!locId || p.location_id === locId) && (status === "all" || (status === "open" ? open.includes(p.status) : status === "closed" ? ["rejected", "refused"].includes(p.status) : p.status === status)));
  const setM = (id: string, m: "send" | "buy" | "reject" | "") => setMode({ ...mode, [id]: mode[id] === m ? "" : m });

  return (
    <div className="space-y-3">
      <div className={formRow}>
        <select className={sel} value={f.item_id} onChange={(e) => setF({ ...f, item_id: e.target.value })} aria-label="Item"><option value="">Choose item…</option>{data?.items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
        <select className={sel} value={target} onChange={(e) => setF({ ...f, loc: e.target.value })} aria-label="For store"><option value="">For store…</option>{myLocs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <Input type="number" min={1} placeholder="Qty" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
        <Input placeholder="Reason (optional)" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
        <Button disabled={!f.item_id || !(Number(f.qty) > 0) || !target} onClick={async () => (await act(db.from("rail_purchase_requests").insert({ item_id: f.item_id, qty: Number(f.qty), reason: f.reason || null, location_id: target }), "Request sent to head office", "stock_request", { item: f.item_id })) && (setF({ item_id: "", qty: "", reason: "", loc: "" }), inv())}>Raise request</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select className={`${sel} max-w-[220px]`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="open">Open</option><option value="requested">Waiting for head office</option><option value="ordered">Ordered from supplier</option><option value="sending">On the way</option><option value="received">Received</option><option value="closed">Rejected / refused</option><option value="all">All</option>
        </select>
        <span className="text-xs text-muted-foreground">Store asks → head office sends stock or buys from a supplier → store accepts or refuses</span>
      </div>
      {!list.length ? <Empty title="No requests here" /> :
        <div className="divide-y rounded-2xl border bg-card">{list.map((p) => {
          const i = item(p.item_id); const m = mode[p.id] ?? "";
          const pf = po[p.id] ?? { vendor_id: p.vendor_id ?? "", unit_price: "", expected_on: "" };
          const gf = grn[p.id] ?? { qty: String(p.qty), batch: "", expiry: "" };
          const hqHas = mainId ? usable(data!.batches, p.item_id, mainId) : 0;
          const sq = sendQty[p.id] ?? String(p.qty);
          const waiting = p.status === "requested" || p.status === "approved";
          return (
            <div key={p.id} className="space-y-2 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div><div className="font-medium">{i?.name} × {num(p.qty)} {i?.unit}</div>
                  <div className="text-xs text-muted-foreground">For {loc(p.location_id)} · {new Date(p.created_at).toLocaleDateString()}{p.reason && ` · ${p.reason}`}{p.po_number && ` · ${p.po_number}`}{vendor(p.vendor_id) && ` · ${vendor(p.vendor_id)}`}{p.expected_on && ` · due ${p.expected_on}`}</div>
                  {p.decision_note && <div className="mt-1 text-xs text-destructive">Reason: {p.decision_note}</div>}</div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">{PR_LABEL[p.status] ?? p.status}</span>
              </div>
              {waiting && isHq && <div className="flex flex-wrap justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setM(p.id, "reject")}>Reject</Button>
                <Button size="sm" variant="outline" onClick={() => setM(p.id, "buy")}>Buy from supplier</Button>
                {mainId && p.location_id !== mainId && <Button size="sm" onClick={() => setM(p.id, "send")}>Send from head office</Button>}
              </div>}
              {waiting && !isHq && <div className="text-right text-xs text-muted-foreground">Head office will send it or order it for you.</div>}
              {waiting && isHq && m === "send" && <div className={subRow}>
                <div className="flex items-center text-xs text-muted-foreground">Head office has {num(hqHas, 1)} {i?.unit}</div>
                <Input type="number" min={1} placeholder="Qty to send" value={sq} onChange={(e) => setSendQty({ ...sendQty, [p.id]: e.target.value })} />
                <Button size="sm" className="h-10" disabled={!(Number(sq) > 0) || Number(sq) > hqHas} onClick={async () => {
                  if (!(await confirmAction({ title: "Send this stock now?", description: `${i?.name} × ${sq}: ${loc(mainId)} → ${loc(p.location_id)}. Stock leaves head office now; the store accepts or refuses it.`, confirmText: "Send" }))) return;
                  if (await act(db.rpc("rail_send_stock", { _item: p.item_id, _from: mainId, _to: p.location_id, _qty: Number(sq), _note: p.reason, _request: p.id }), "Sent — waiting for the store to accept", "request_fulfil", { request: p.id })) inv();
                }}>{Number(sq) > hqHas ? "Not enough at head office" : "Send"}</Button>
              </div>}
              {waiting && isHq && m === "buy" && <div className={subRow}>
                <select className={sel} value={pf.vendor_id} onChange={(e) => setPo({ ...po, [p.id]: { ...pf, vendor_id: e.target.value } })} aria-label="Supplier"><option value="">Choose supplier…</option>{data?.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
                <Input type="number" placeholder="Price / unit ₹" value={pf.unit_price} onChange={(e) => setPo({ ...po, [p.id]: { ...pf, unit_price: e.target.value } })} />
                <Input type="date" aria-label="Expected on" value={pf.expected_on} onChange={(e) => setPo({ ...po, [p.id]: { ...pf, expected_on: e.target.value } })} />
                <Button size="sm" className="h-10" disabled={!pf.vendor_id} onClick={async () => (await confirmAction({ title: `Order from ${vendor(pf.vendor_id)}?`, description: `Supplier delivers straight to ${loc(p.location_id)}. A purchase order number is created.`, confirmText: "Place order" })) && (await act(db.from("rail_purchase_requests").update({ status: "ordered", vendor_id: pf.vendor_id, unit_price: pf.unit_price ? Number(pf.unit_price) : null, expected_on: pf.expected_on || null }).eq("id", p.id), "Order placed", "purchase_order")) && inv()}>Place order</Button>
              </div>}
              {waiting && isHq && m === "reject" && <div className={subRow}>
                <Input placeholder="Reason for rejecting" value={why[p.id] ?? ""} onChange={(e) => setWhy({ ...why, [p.id]: e.target.value })} />
                <Button size="sm" variant="destructive" className="h-10" disabled={!(why[p.id] ?? "").trim()} onClick={async () => (await act(db.from("rail_purchase_requests").update({ status: "rejected", decision_note: why[p.id].trim() }).eq("id", p.id), "Request rejected", "reject_request")) && inv()}>Reject request</Button>
              </div>}
              {p.status === "ordered" && canEdit(p.location_id) && <div className={subRow}>
                <Input type="number" placeholder="Qty received" value={gf.qty} onChange={(e) => setGrn({ ...grn, [p.id]: { ...gf, qty: e.target.value } })} />
                <Input placeholder="Batch no. (optional)" value={gf.batch} onChange={(e) => setGrn({ ...grn, [p.id]: { ...gf, batch: e.target.value } })} />
                <Input type="date" aria-label="Expiry date" value={gf.expiry} onChange={(e) => setGrn({ ...grn, [p.id]: { ...gf, expiry: e.target.value } })} />
                <Button size="sm" variant="outline" className="h-10" disabled={!(Number(gf.qty) > 0)} onClick={async () => (await confirmAction({ title: "Supplier delivery arrived?", description: `${gf.qty} ${i?.unit ?? ""} added to ${loc(p.location_id)}${gf.expiry ? `, expires ${gf.expiry}` : ""}.`, confirmText: "Receive" })) && (await act(db.from("rail_purchase_requests").update({ status: "received", grn_qty: Number(gf.qty), grn_batch: gf.batch || null, grn_expiry: gf.expiry || null, grn_at: new Date().toISOString() }).eq("id", p.id), "Received — stock added", "grn")) && inv()}>Receive delivery</Button>
              </div>}
              {p.status === "sending" && <div className="text-right text-xs text-muted-foreground">On the way — the store accepts it under Transfers.</div>}
            </div>);
        })}</div>}
    </div>
  );
}

/** Transfers: send stock now from a store you manage; the receiving store accepts or refuses with a reason (stock goes back). */
export function TransfersView({ locId }: { locId: string }) {
  const { data } = useStockFlow();
  const qc = useQueryClient();
  const inv = () => { void qc.invalidateQueries({ queryKey: ["rail-stock-flow"] }); void qc.invalidateQueries({ queryKey: ["rail-sup"] }); };
  const [f, setF] = useState({ item_id: "", from: "", to: "", qty: "", note: "" });
  const [why, setWhy] = useState<Record<string, string>>({});
  const [refusing, setRefusing] = useState("");
  const item = (id: string) => data?.items.find((i) => i.id === id);
  const loc = (id: string) => data?.allLocs.find((l) => l.id === id)?.name ?? "—";
  const myLocs = data?.locs ?? [];
  const mainId = data?.mainId ?? "";
  const from = f.from || (myLocs.some((l) => l.id === mainId) ? mainId : myLocs[0]?.id ?? "");
  const to = f.to || (locId && locId !== from ? locId : mainId && mainId !== from ? mainId : "");
  const avail = f.item_id && from ? usable(data?.batches ?? [], f.item_id, from) : null;
  const canReceive = (at: string) => !!data?.isHq || myLocs.some((l) => l.id === at);
  const step = async (t: Trf, action: "receive" | "refuse") => {
    const reason = action === "refuse" ? (why[t.id] ?? "").trim() : null;
    if (action === "receive" && !(await confirmAction({ title: "Accept this delivery?", description: `${item(t.item_id)?.name} × ${t.qty} added to ${loc(t.to_location_id)}.`, confirmText: "Accept" }))) return;
    const { error } = await db.rpc("rail_transfer_step", { _id: t.id, _action: action, _reason: reason });
    if (error) return toast.error(error.message);
    toast.success(action === "receive" ? "Accepted — stock added" : "Refused — stock returned to sender");
    void logActivity({ module: "Rail Supplies", action: `transfer_${action}`, entityType: "rail_stock_transfers", entityId: t.id, details: reason ? { reason } : {} });
    setRefusing(""); inv();
  };
  const list = (data?.trfs ?? []).filter((t) => !locId || t.from_location_id === locId || t.to_location_id === locId);
  const TRF_LABEL: Record<string, string> = { dispatched: "On the way", received: "Accepted", refused: "Refused", requested: "Old request", approved: "Old request", rejected: "Rejected" };
  return (
    <div className="space-y-3">
      <div className={formRow}>
        <select className={sel} value={f.item_id} onChange={(e) => setF({ ...f, item_id: e.target.value })} aria-label="Item"><option value="">Choose item…</option>{data?.items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
        <select className={sel} value={from} onChange={(e) => setF({ ...f, from: e.target.value })} aria-label="From store"><option value="">From store…</option>{myLocs.map((l) => <option key={l.id} value={l.id}>{l.name}{l.id === mainId ? " (main)" : ""}</option>)}</select>
        <select className={sel} value={to} onChange={(e) => setF({ ...f, to: e.target.value })} aria-label="To store"><option value="">To store…</option>{data?.allLocs.filter((l) => l.id !== from).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <Input type="number" min={1} placeholder={avail !== null ? `Max ${num(avail, 1)}` : "Qty"} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
        <Input placeholder="Note (optional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        <Button disabled={!f.item_id || !from || !to || from === to || !(Number(f.qty) > 0) || (avail !== null && Number(f.qty) > avail)} onClick={async () => {
          if (!(await confirmAction({ title: "Send this stock now?", description: `${item(f.item_id)?.name} × ${f.qty}: ${loc(from)} → ${loc(to)}. The receiving store accepts or refuses it.`, confirmText: "Send" }))) return;
          if (await act(db.rpc("rail_send_stock", { _item: f.item_id, _from: from, _to: to, _qty: Number(f.qty), _note: f.note || null }), "Sent — waiting for the store to accept", "transfer_send")) { setF({ item_id: "", from: "", to: "", qty: "", note: "" }); inv(); }
        }}>{avail !== null && Number(f.qty) > avail ? "Not enough stock" : "Send stock"}</Button>
      </div>
      <div className="text-xs text-muted-foreground">Stock leaves the sending store at once (oldest expiry first). The receiving store accepts it, or refuses with a reason and it goes back.</div>
      {!list.length ? <Empty title="No transfers yet" /> :
        <div className="divide-y rounded-2xl border bg-card">{list.map((t) => (
          <div key={t.id} className="space-y-2 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><div className="font-medium">{item(t.item_id)?.name} × {num(t.qty)} {item(t.item_id)?.unit}</div>
                <div className="text-xs text-muted-foreground">{loc(t.from_location_id)} → {loc(t.to_location_id)} · {new Date(t.created_at).toLocaleDateString()}{t.request_id ? " · for a store request" : ""}{t.note ? ` · ${t.note}` : ""}</div>
                {t.refuse_reason && <div className="mt-1 text-xs text-destructive">Refused: {t.refuse_reason}</div>}</div>
              <div className="flex items-center gap-2"><span className="text-xs font-medium text-muted-foreground">{TRF_LABEL[t.status] ?? t.status}</span>
                {t.status === "dispatched" && canReceive(t.to_location_id) && <><Button size="sm" variant="ghost" onClick={() => setRefusing(refusing === t.id ? "" : t.id)}>Refuse</Button><Button size="sm" onClick={() => step(t, "receive")}>Accept</Button></>}
              </div>
            </div>
            {refusing === t.id && <div className={subRow}>
              <Input placeholder="Why are you refusing? (e.g. damaged, wrong item)" value={why[t.id] ?? ""} onChange={(e) => setWhy({ ...why, [t.id]: e.target.value })} />
              <Button size="sm" variant="destructive" className="h-10" disabled={!(why[t.id] ?? "").trim()} onClick={() => step(t, "refuse")}>Refuse delivery</Button>
            </div>}
          </div>))}</div>}
    </div>
  );
}

export function SuppliersView() {
  const { data } = useStockFlow();
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", phone: "", email: "", gstin: "", lead_days: "" });
  const [q, setQ] = useState("");
  const list = (data?.vendors ?? []).filter((v) => !q || v.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className={formRow}>
        <Input placeholder="Supplier name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <Input placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Input placeholder="GSTIN" value={f.gstin} onChange={(e) => setF({ ...f, gstin: e.target.value })} />
        <Input type="number" placeholder="Lead days (7)" value={f.lead_days} onChange={(e) => setF({ ...f, lead_days: e.target.value })} />
        <Button disabled={!f.name.trim()} onClick={async () => (await act(db.from("rail_vendors").insert({ name: f.name.trim(), phone: f.phone || null, email: f.email || null, gstin: f.gstin || null, lead_days: Number(f.lead_days) || 7 }), "Supplier added", "vendor_create")) && (setF({ name: "", phone: "", email: "", gstin: "", lead_days: "" }), qc.invalidateQueries({ queryKey: ["rail-stock-flow"] }))}>Add</Button>
      </div>
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search supplier" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {!list.length ? <Empty title="No suppliers yet" hint="Add the companies you buy chemicals and consumables from." /> :
        <div className="divide-y rounded-2xl border bg-card">{list.map((v) => {
          const orders = data!.prs.filter((p) => p.vendor_id === v.id);
          return <div key={v.id} className="flex items-center justify-between p-3 text-sm"><div><div className="font-medium">{v.name}</div><div className="text-xs text-muted-foreground">{[v.phone, v.email, v.gstin].filter(Boolean).join(" · ") || "No contact details"} · {v.lead_days} days lead</div></div>
            <div className="text-xs text-muted-foreground">{orders.filter((o) => o.status === "ordered").length} open · {orders.filter((o) => o.status === "received").length} received</div></div>;
        })}</div>}
    </div>
  );
}
