import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db, rows } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail")({
  component: RailLayout,
});

const PAGES = [
  ["/admin/rail/command", "Overview"], ["/admin/rail/live", "Operations"], ["/admin/rail/me", "My Shift"], ["/admin/rail/checker", "Checks"],
  ["/admin/rail/quality", "Quality"], ["/admin/rail/supplies", "Supplies"], ["/admin/rail/sustainability", "Resources"],
  ["/admin/rail/billing", "Billing"], ["/admin/rail/people", "Team"], ["/admin/rail/settings", "Configuration Hub"], ["/admin/rail/ai-check", "Photo Check"],
] as const;

// Ctrl+K / ⌘K palette: jump to a page, train, coach or person.
function RailLayout() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } };
    const toggle = () => setOpen((o) => !o);
    window.addEventListener("keydown", h);
    window.addEventListener("rail-search-toggle", toggle);
    return () => { window.removeEventListener("keydown", h); window.removeEventListener("rail-search-toggle", toggle); };
  }, []);
  useEffect(() => {
    if (!open) { setQ(""); return; }
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onPointer = (e: PointerEvent) => {
      if (e.target instanceof Node && !searchRef.current?.contains(e.target) && !(e.target instanceof Element && e.target.closest('[aria-label="Search"]'))) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, [open]);
  const { data } = useQuery({
    queryKey: ["rail-palette", q],
    enabled: open && q.length >= 2,
    queryFn: async () => {
      const like = `%${q}%`;
      const [trains, coaches, people] = await Promise.all([
        rows<{ id: string; number: string; name: string }>(db.from("rail_trains").select("id,number,name").or(`number.ilike.${like},name.ilike.${like}`).limit(5)),
        rows<{ id: string; coach_number: string }>(db.from("rail_coaches").select("id,coach_number").ilike("coach_number", like).limit(5)),
        rows<{ id: string; full_name: string; mobile: string }>(db.from("rail_people").select("id,full_name,mobile").or(`full_name.ilike.${like},mobile.ilike.${like}`).limit(5)),
      ]);
      return { trains, coaches, people };
    },
  });
  const go = (to: string) => { setOpen(false); setQ(""); navigate({ to: to as never }); };
  return (
    <>
      <Outlet />
       {open && <div ref={searchRef} role="search" aria-label="Search HyperTrack" className="rail-search-panel">
           <Command shouldFilter={false} className="rounded-lg bg-transparent">
             <div className="flex items-center gap-1 border-b border-border/60 pr-2"><CommandInput ref={inputRef} aria-label="Search pages, trains, coaches, people" placeholder="Search pages, trains, coaches, people…" value={q} onValueChange={setQ} className="!h-12 !text-base" /><Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close search" className="h-8 w-8 shrink-0 rounded-full"><X className="h-4 w-4" /></Button></div>
             <CommandList className="mt-1 max-h-[min(55dvh,25rem)]">
          {!PAGES.some(([, l]) => l.toLowerCase().includes(q.toLowerCase())) && !data?.trains.length && !data?.coaches.length && !data?.people.length && <CommandEmpty>No matches.</CommandEmpty>}
          {PAGES.some(([, l]) => l.toLowerCase().includes(q.toLowerCase())) && <CommandGroup heading="Pages">{PAGES.filter(([, l]) => l.toLowerCase().includes(q.toLowerCase())).map(([to, l]) => <CommandItem key={to} value={l} onSelect={() => go(to)}>{l}</CommandItem>)}</CommandGroup>}
          {!!data?.trains.length && <CommandGroup heading="Trains">{data.trains.map((t) => <CommandItem key={t.id} value={`train ${t.number} ${t.name}`} onSelect={() => go("/admin/rail/live")}>{t.number} {t.name}</CommandItem>)}</CommandGroup>}
          {!!data?.coaches.length && <CommandGroup heading="Coaches">{data.coaches.map((c) => <CommandItem key={c.id} value={`coach ${c.coach_number}`} onSelect={() => go("/admin/rail/settings")}>Coach {c.coach_number}</CommandItem>)}</CommandGroup>}
          {!!data?.people.length && <CommandGroup heading="People">{data.people.map((p) => <CommandItem key={p.id} value={`person ${p.full_name} ${p.mobile}`} onSelect={() => go("/admin/rail/people")}>{p.full_name} · {p.mobile}</CommandItem>)}</CommandGroup>}
             </CommandList>
           </Command>
       </div>}
    </>
  );
}
