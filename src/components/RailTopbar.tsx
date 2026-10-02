import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const RAIL_TOPBAR_SLOT_ID = "rail-topbar-slot";

/** Renders page-specific controls into the shared top bar (desktop and mobile). */
export function RailTopbarSlot({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => { setEl(document.getElementById(RAIL_TOPBAR_SLOT_ID)); }, []);
  return el ? createPortal(children, el) : null;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
export const shiftIso = (date: string, days: number) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + days); return iso(d); };

/** Prev / date / next with Today and Yesterday quick picks. */
export function RailDateStepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const today = iso(new Date());
  const yesterday = shiftIso(today, -1);
  const chip = (v: string, label: string) => (
    <button type="button" onClick={() => onChange(v)} className={cn("rail-topbar-tab", value === v && "is-active")}>{label}</button>
  );
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {chip(today, "Today")}
      {chip(yesterday, "Yesterday")}
      <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-muted p-0.5">
        <button type="button" aria-label="Previous day" onClick={() => onChange(shiftIso(value, -1))} className="grid h-8 w-8 place-items-center rounded-full hover:bg-card"><ChevronLeft className="h-4 w-4" /></button>
        <input type="date" aria-label="Date" value={value} max={today} onChange={(e) => e.target.value && onChange(e.target.value)} className="h-8 w-[128px] bg-transparent px-1 text-xs outline-none" />
        <button type="button" aria-label="Next day" disabled={value >= today} onClick={() => onChange(shiftIso(value, 1))} className="grid h-8 w-8 place-items-center rounded-full hover:bg-card disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
