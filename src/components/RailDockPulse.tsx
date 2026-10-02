import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ScanEye, UsersRound } from "lucide-react";
import { db, num, today } from "@/lib/rail-ui";

type K = Record<string, number>;

// Sidebar shift card: today's release progress, staffing and alerts at a glance,
// with the two most common actions one tap away.
export function RailDockPulse() {
  const { data: k } = useQuery({
    queryKey: ["rail-kpis"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await db.rpc("rail_kpis", { _date: today() });
      if (error) throw error;
      return (data ?? {}) as K;
    },
  });
  const total = k?.events_today ?? 0;
  const released = k?.released ?? 0;
  const progress = total ? Math.round((released / total) * 100) : 0;

  return (
    <div className="rail-dock-photo relative bg-brand mx-3 mb-3 hidden shrink-0 overflow-hidden rounded-lg lg:block" aria-label="Today's shift">
      <div className="relative z-10 flex flex-col gap-3 p-3 text-primary-foreground">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium opacity-80">Today's shift</span>
          <span className="text-[11px] font-medium opacity-80">{num(released)}/{num(total)}</span>
        </div>
        <div>
          <div className="text-2xl font-semibold leading-none tabular-nums">{total ? `${progress}%` : "—"}</div>
          <div className="mt-1 text-[11px] opacity-80">released</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-foreground/25">
            <div className="h-full rounded-full bg-primary-foreground transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="flex items-center gap-1"><UsersRound className="h-3 w-3" />{num(k?.staff_present)}/{num(k?.staff_norm)}</span>
          <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />{num(k?.open_alerts)} alerts</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Link to="/admin/rail/live" search={{}} className="rounded-md bg-card px-2 py-1.5 text-center text-[11px] font-medium text-brand">Live board</Link>
          <Link to="/admin/rail/ai-check" className="flex items-center justify-center gap-1 rounded-md bg-card/20 px-2 py-1.5 text-[11px] font-medium text-primary-foreground ring-1 ring-primary-foreground/40"><ScanEye className="h-3 w-3" />Scan</Link>
        </div>
      </div>
    </div>
  );
}
