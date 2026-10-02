import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { db, rows } from "@/lib/rail-ui";

export const Route = createFileRoute("/admin/rail")({
  component: RailLayout,
});

const PAGES = [
  ["/admin/rail/command", "Command Centre"], ["/admin/rail/live", "Live Board"], ["/admin/rail/me", "My Day"], ["/admin/rail/checker", "Railway Checker"],
  ["/admin/rail/quality", "Quality"], ["/admin/rail/supplies", "Supplies & Equipment"], ["/admin/rail/sustainability", "Sustainability"],
  ["/admin/rail/billing", "Railway Billing"], ["/admin/rail/people", "People & Logins"], ["/admin/rail/settings", "Rail Settings"], ["/admin/rail/ai-check", "AI Clean Check"],
] as const;

// Ctrl+K / ⌘K palette: jump to a page, train, coach or person.
function RailLayout() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
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
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a page, train, coach or person…" value={q} onValueChange={setQ} />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandGroup heading="Pages">{PAGES.filter(([, l]) => !q || l.toLowerCase().includes(q.toLowerCase())).map(([to, l]) => <CommandItem key={to} value={l} onSelect={() => go(to)}>{l}</CommandItem>)}</CommandGroup>
          {!!data?.trains.length && <CommandGroup heading="Trains">{data.trains.map((t) => <CommandItem key={t.id} value={`train ${t.number} ${t.name}`} onSelect={() => go("/admin/rail/live")}>{t.number} {t.name}</CommandItem>)}</CommandGroup>}
          {!!data?.coaches.length && <CommandGroup heading="Coaches">{data.coaches.map((c) => <CommandItem key={c.id} value={`coach ${c.coach_number}`} onSelect={() => go("/admin/rail/settings")}>Coach {c.coach_number}</CommandItem>)}</CommandGroup>}
          {!!data?.people.length && <CommandGroup heading="People">{data.people.map((p) => <CommandItem key={p.id} value={`person ${p.full_name} ${p.mobile}`} onSelect={() => go("/admin/rail/people")}>{p.full_name} · {p.mobile}</CommandItem>)}</CommandGroup>}
        </CommandList>
      </CommandDialog>
    </>
  );
}
