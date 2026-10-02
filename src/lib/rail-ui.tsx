// Shared helpers for HyperTrack screens: loose DB access, role lookup,
// KPI tiles, empty states, money/number formatting and the offline task queue.
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Activity, AlertTriangle, BadgeCheck, Banknote, Bell, ClipboardCheck, ClipboardList, Clock3, Droplets, FileText, Gauge, Package, ShieldCheck, TrainFront, Users, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Rail tables are many and evolve quickly; a loose client keeps screens simple.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export async function rpc<T = unknown>(fn: string, args: Record<string, unknown> = {}, okMsg?: string): Promise<T | null> {
  const { data, error } = await db.rpc(fn, args);
  if (error) {
    toast.error(error.message ?? "Something went wrong");
    return null;
  }
  if (okMsg) toast.success(okMsg);
  return data as T;
}

export async function rows<T = Record<string, unknown>>(q: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export type RailRole = { role_key: string; scope_type: string; scope_location_id: string | null };
export function useRailRoles() {
  return useQuery({
    queryKey: ["rail-my-roles"],
    staleTime: 5 * 60_000,
    queryFn: async () => rows<RailRole>(db.rpc("rail_my_roles")),
  });
}
export function hasRole(roles: RailRole[] | undefined, ...keys: string[]) {
  return !!roles?.some((r) => r.role_key === "super_admin" || keys.includes(r.role_key));
}

export const inr = (n: number | null | undefined) =>
  "₹" + Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
export const num = (n: number | null | undefined, d = 0) =>
  Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: d });
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) + "%" : "—");
export const today = () => new Date().toISOString().slice(0, 10);
export const monthStart = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);

export function railHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — HyperTrack` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — HyperTrack` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}

const kpiIcons: [RegExp, LucideIcon][] = [
  [/coach|train/i, TrainFront], [/staff|people|worker/i, Users], [/bill|wage|net|rate/i, Banknote],
  [/penalt|reject|fail|rework|below/i, AlertTriangle], [/alert|complaint/i, Bell],
  [/water|litre|meter|chemical/i, Droplets], [/approval|approved|pass|sign|verified/i, BadgeCheck],
  [/release|time|awaiting|due/i, Clock3], [/stock|item|equipment|maint/i, Package],
  [/inspection|review|quality/i, ShieldCheck], [/clean|task/i, ClipboardCheck],
  [/job|event/i, ClipboardList], [/cover|norm/i, Gauge], [/carbon|co₂|energy/i, Activity],
];

export function Kpi({ label, value, hint, to, tone = "default" }: { label: string; value: ReactNode; hint?: string; to?: string; tone?: "default" | "good" | "warn" | "bad" }) {
  const Icon = kpiIcons.find(([pattern]) => pattern.test(label))?.[1] ?? FileText;
  const tint = tone === "good" ? "bg-good-soft/70 dark:bg-good/15" : tone === "warn" ? "bg-caution-soft/70 dark:bg-caution/15" : tone === "bad" ? "bg-danger-soft/70 dark:bg-danger/15" : "bg-card";
  const iconTone = "bg-brand text-primary-foreground";
  const body = (
    <div data-tone={tone} className={cn(
      "rail-kpi group flex h-full min-h-32 min-w-0 flex-col justify-between rounded-lg border border-border/70 p-4 transition-[border-color,box-shadow,transform] duration-200 sm:p-5",
      tint,
      to && "cursor-pointer hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md",
    )}>
      <div className="flex items-start justify-between gap-2"><div className="rail-kpi-label min-w-0 text-xs font-medium leading-snug text-muted-foreground sm:text-sm">{label}</div><span aria-hidden="true" className={cn("rail-kpi-icon grid h-9 w-9 shrink-0 place-items-center rounded-full", iconTone)}><Icon className="h-4 w-4" strokeWidth={2} /></span></div>
      <div className="rail-kpi-value mt-4 min-w-0 font-heading text-2xl font-semibold leading-none tabular-nums text-foreground sm:text-3xl" title={typeof value === "string" || typeof value === "number" ? String(value) : undefined}>{value}</div>
      {hint && <div className="rail-kpi-hint mt-2 text-xs leading-snug text-muted-foreground">{hint}</div>}
    </div>
  );
  return to ? <Link to={to as never}>{body}</Link> : body;
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-8 text-center">
      <div className="font-medium">{title}</div>
      {hint && <div className="mt-1 text-sm text-muted-foreground">{hint}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function StatusPill({ s }: { s: string }) {
  const tone: Record<string, string> = {
    planned: "bg-muted text-muted-foreground", placed: "bg-accent/10 text-accent",
    in_progress: "bg-warning/10 text-warning", pending: "bg-muted text-muted-foreground",
    done: "bg-accent/10 text-accent", completed: "bg-accent/10 text-accent",
    approved: "bg-success/10 text-success", released: "bg-success text-card",
    rejected: "bg-destructive/15 text-destructive", removed: "bg-muted text-muted-foreground line-through",
    draft: "bg-muted text-muted-foreground", submitted: "bg-accent/10 text-accent",
    checker_verified: "bg-accent/10 text-accent", certified: "bg-success/10 text-success",
    paid: "bg-success text-card", cancelled: "bg-muted text-muted-foreground line-through",
    open: "bg-warning/10 text-warning", proposed: "bg-warning/10 text-warning",
    confirmed: "bg-destructive/15 text-destructive", waived: "bg-muted text-muted-foreground", resolved: "bg-success/10 text-success",
    requested: "bg-warning/10 text-warning", received: "bg-success/10 text-success",
  };
  return <span className={cn("inline-flex min-h-6 max-w-full items-center justify-center rounded-md px-2 py-0.5 text-center text-xs font-medium capitalize leading-4", tone[s] ?? "bg-muted text-muted-foreground")}>{s.replace(/_/g, " ")}</span>;
}

export async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function toCsv(data: Record<string, unknown>[]) {
  if (!data.length) return "";
  const cols = Object.keys(data[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...data.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function parseCsv(text: string): Record<string, string>[] {
  const out: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) out.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) out.push(row);
  const [head, ...body] = out;
  if (!head) return [];
  const keys = head.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

// ---------- Offline task queue (cleaner app) ----------
const QKEY = "rail.offline.tasks.v1";
export type QueuedTask = { task_id: string; offline_id: string; completed_at: string; label?: string };
export function readQueue(): QueuedTask[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(QKEY) ?? "[]"); } catch { return []; }
}
export function writeQueue(q: QueuedTask[]) { localStorage.setItem(QKEY, JSON.stringify(q)); }
export function enqueueTask(t: Omit<QueuedTask, "offline_id" | "completed_at">) {
  const q = readQueue();
  if (q.some((x) => x.task_id === t.task_id)) return;
  q.push({ ...t, offline_id: crypto.randomUUID(), completed_at: new Date().toISOString() });
  writeQueue(q);
}
export async function flushQueue(): Promise<number> {
  const q = readQueue();
  if (!q.length || (typeof navigator !== "undefined" && !navigator.onLine)) return 0;
  const left: QueuedTask[] = [];
  let ok = 0;
  for (const t of q) {
    const { error } = await db.rpc("rail_complete_task", { _task: t.task_id, _offline_id: t.offline_id, _completed_at: t.completed_at });
    if (error && !/not found|Not allowed/i.test(error.message)) left.push(t); else ok++;
  }
  writeQueue(left);
  return ok;
}
