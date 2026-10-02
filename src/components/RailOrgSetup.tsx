// Configuration Hub → Organization: company details, stores/godowns and item types in one place.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Building2, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logActivity } from "@/lib/activity-log";
import { db, Empty, rows } from "@/lib/rail-ui";
import { saveStoreSetting, useStoreSettings } from "@/components/RailStockFlow";

const sel = "h-10 rounded-md border bg-background px-3 text-sm";
const ITEM_CATEGORIES = ["chemical", "consumable", "linen", "tool", "ppe", "spare"];

function Section({ icon: Icon, title, hint, children, action }: { icon: typeof Building2; title: string; hint: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-primary-foreground"><Icon className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1"><h2 className="text-base font-semibold">{title}</h2><p className="text-xs text-muted-foreground">{hint}</p></div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function RailOrgSetup() {
  const qc = useQueryClient();
  const settings = useStoreSettings();
  const orgRow = settings.data?.find((s) => s.key === "org_name");
  const cityRow = settings.data?.find((s) => s.key === "org_city");
  const [city, setCity] = useState("");
  const mainRow = settings.data?.find((s) => s.key === "main_store_id");
  const mainId = mainRow?.text_value ?? "";
  const [org, setOrg] = useState<string | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);
  const [sf, setSf] = useState({ name: "", code: "", type: "store" });

  const stores = useQuery({ queryKey: ["rail-org-stores"], queryFn: () => rows<{ id: string; code: string; name: string; type: string }>(db.from("rail_locations").select("id,code,name,type").in("type", ["store", "depot", "station"]).is("deleted_at", null).order("name")) });
  const refresh = () => ["rail-store-settings", "rail-org-stores", "rail-org-items", "rail-stock-flow", "rail-sup"].forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));

  async function addStore() {
    const name = sf.name.trim();
    if (!name) return toast.error("Enter a store name");
    const code = (sf.code.trim() || name.replace(/[^A-Za-z0-9]+/g, "-")).toUpperCase().slice(0, 20);
    const { data: row, error } = await db.from("rail_locations").insert({ name, code, type: sf.type }).select("id").single();
    if (error) return toast.error(error.message.includes("duplicate") ? "That code is already used" : error.message);
    void logActivity({ module: "Organization", action: "create", entityType: "rail_locations", entityId: row?.id, entityLabel: name });
    if (!mainId && row?.id) await saveStoreSetting(mainRow, "main_store_id", row.id);
    toast.success("Store added"); setSf({ name: "", code: "", type: "store" }); setStoreOpen(false); refresh();
  }

  return (
    <div className="space-y-4">
      <Section icon={Building2} title="Company details" hint="Your organization's name, shown across HyperTrack."
        action={org === null ? <Button size="sm" variant="outline" onClick={() => { setOrg(orgRow?.text_value ?? ""); setCity(cityRow?.text_value ?? ""); }}>Edit</Button> : null}>
        {org === null
          ? <div><div className="text-lg font-semibold">{orgRow?.text_value || <span className="text-muted-foreground">Not set yet</span>}</div>{cityRow?.text_value && <div className="text-sm text-muted-foreground">Head office · {cityRow.text_value}</div>}</div>
          : <div className="flex flex-wrap gap-2"><Input autoFocus className="max-w-sm" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Company name" />
              <Input className="max-w-[200px]" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Head office city" />
              <Button variant="outline" onClick={() => setOrg(null)}>Cancel</Button>
              <Button onClick={async () => { if ((await saveStoreSetting(orgRow, "org_name", org.trim())) && (await saveStoreSetting(cityRow, "org_city", city.trim()))) { toast.success("Saved"); setOrg(null); refresh(); } }}>Save</Button></div>}
      </Section>

      <Section icon={Warehouse} title="Stores & godowns" hint="The main store (head office) supplies every other store and is the only one that buys from suppliers." action={<Button size="sm" onClick={() => setStoreOpen((v) => !v)}>{storeOpen ? "Close" : "Add store"}</Button>}>
        {storeOpen && <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto]">
          <Input placeholder="Store or godown name" value={sf.name} onChange={(e) => setSf({ ...sf, name: e.target.value })} />
          <Input placeholder="Code (optional)" value={sf.code} onChange={(e) => setSf({ ...sf, code: e.target.value })} />
          <select className={sel} value={sf.type} onChange={(e) => setSf({ ...sf, type: e.target.value })} aria-label="Store type"><option value="store">Store / godown</option><option value="depot">Depot</option><option value="station">Station</option></select>
          <Button onClick={addStore}>Save</Button>
        </div>}
        {!stores.data?.length ? <Empty title="No stores yet" hint="Add your main godown first." /> :
          <ul className="divide-y rounded-xl border">{stores.data.map((s) => (
            <li key={s.id} className="flex items-center gap-3 p-3 text-sm">
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2 font-medium">{s.name}{s.id === mainId && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Main store</span>}</div><div className="text-xs capitalize text-muted-foreground">{s.type} · {s.code}</div></div>
              {s.id !== mainId && <Button size="sm" variant="ghost" onClick={async () => { if (await saveStoreSetting(mainRow, "main_store_id", s.id)) { toast.success(`${s.name} is now the main store`); refresh(); } }}>Make main</Button>}
            </li>))}</ul>}
      </Section>

    </div>
  );
}

/** Masters & rules → Inventory: the item types stores can hold. */
export function RailItemTypes() {
  const qc = useQueryClient();
  const [itemOpen, setItemOpen] = useState(false);
  const [it, setIt] = useState({ name: "", unit: "nos", rail_category: "consumable", reorder: "" });
  const items = useQuery({ queryKey: ["rail-org-items"], queryFn: () => rows<{ id: string; item_code: string; name: string; unit: string; rail_category: string | null; default_reorder_level: number }>(db.from("inv_items").select("id,item_code,name,unit,rail_category,default_reorder_level").not("rail_category", "is", null).order("name")) });
  const refresh = () => ["rail-org-items", "rail-stock-flow", "rail-sup"].forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
  async function addItem() {
    const name = it.name.trim();
    if (!name) return toast.error("Enter an item name");
    const item_code = `RC-${name.replace(/[^A-Za-z0-9]+/g, "").toUpperCase().slice(0, 10)}-${Date.now().toString().slice(-4)}`;
    const { data: row, error } = await db.from("inv_items").insert({ name, item_code, unit: it.unit || "nos", rail_category: it.rail_category, default_reorder_level: Number(it.reorder) || 0 }).select("id").single();
    if (error) return toast.error(error.message);
    void logActivity({ module: "Organization", action: "create", entityType: "inv_items", entityId: row?.id, entityLabel: name });
    toast.success("Item added"); setIt({ name: "", unit: "nos", rail_category: "consumable", reorder: "" }); setItemOpen(false); refresh();
  }

  return (
    <div className="space-y-2">
      <Section icon={Boxes} title="Inventory · Item types" hint="Chemicals, consumables, linen and tools your stores hold." action={<Button size="sm" onClick={() => setItemOpen((v) => !v)}>{itemOpen ? "Close" : "Add item"}</Button>}>
        {itemOpen && <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <Input placeholder="Item name" value={it.name} onChange={(e) => setIt({ ...it, name: e.target.value })} />
          <select className={sel} value={it.rail_category} onChange={(e) => setIt({ ...it, rail_category: e.target.value })} aria-label="Category">{ITEM_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}</select>
          <Input placeholder="Unit (nos, L, kg)" value={it.unit} onChange={(e) => setIt({ ...it, unit: e.target.value })} />
          <Input type="number" min={0} placeholder="Low-stock level" value={it.reorder} onChange={(e) => setIt({ ...it, reorder: e.target.value })} />
          <Button onClick={addItem}>Save</Button>
        </div>}
        {!items.data?.length ? <Empty title="No item types yet" /> :
          <ul className="divide-y rounded-xl border">{items.data.map((i) => (
            <li key={i.id} className="flex items-center gap-3 p-3 text-sm"><div className="min-w-0 flex-1"><div className="font-medium">{i.name}</div><div className="text-xs capitalize text-muted-foreground">{i.rail_category} · {i.unit} · low below {i.default_reorder_level}</div></div></li>))}</ul>}
      </Section>
      <p className="px-1 text-xs text-muted-foreground">To issue an item on a contract, also add it under Masters & rules → Approved items.</p>
      <p className="px-1 text-xs text-muted-foreground">To issue an item on a contract, also add it under Approved items.</p>
    </div>
  );
}
