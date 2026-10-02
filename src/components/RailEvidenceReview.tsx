import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, StatusPill } from "@/lib/rail-ui";
import { getRailEvidencePhoto, listRailEvidence } from "@/lib/rail-evidence.functions";

export function RailEvidenceReview({ depotOf, depot }: { depotOf: (id: string | null) => string | null; depot: string }) {
  const list = useServerFn(listRailEvidence);
  const photo = useServerFn(getRailEvidencePhoto);
  const { data: tasks, isLoading, error } = useQuery({ queryKey: ["rail-quality-evidence"], queryFn: () => list() });
  const [selected, setSelected] = useState<string | null>(null);
  const { data: url, isLoading: photoLoading, error: photoError } = useQuery({
    queryKey: ["rail-quality-photo", selected], enabled: !!selected,
    queryFn: () => photo({ data: { taskId: selected ?? "" } }), staleTime: 240_000,
  });
  const visible = (tasks ?? []).filter((t) => !depot || depotOf(t.location_id) === depot);
  const current = tasks?.find((t) => t.id === selected);
  const coach = (t: (typeof visible)[number]) => t.coach;
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">After-cleaning photos from completed tasks. Review the photo before coach sign-off.</p>
    {isLoading ? <p className="text-sm text-muted-foreground">Loading photos…</p> : error ? <p role="alert" className="text-sm text-destructive">{error instanceof Error ? error.message : "Photos could not be loaded"}</p> : !visible.length ? <Empty title="No cleaning photos yet" hint="Task photos appear after a cleaner completes and syncs a job." /> :
      <div className="divide-y divide-border border-y border-border">{visible.map((t) => <div key={t.id} className="flex flex-wrap items-center gap-3 py-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand"><Camera className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><div className="font-medium">{t.task_name}</div><div className="text-xs text-muted-foreground">Train {coach(t)?.rail_events?.rail_trains?.number ?? "—"} · Coach {coach(t)?.position ?? "—"} {coach(t)?.rail_coaches?.coach_number ?? ""} · {t.completed_at ? new Date(t.completed_at).toLocaleString("en-IN") : "Pending sync"}</div></div>
        <div className="flex items-center gap-2"><StatusPill s={coach(t)?.status ?? t.status} />{t.ai_score != null && <span className="text-xs tabular-nums text-muted-foreground">AI {t.ai_score}/10</span>}<Button size="sm" variant="outline" onClick={() => setSelected(t.id)}><Camera className="mr-1 h-4 w-4" />View photo</Button></div>
      </div>)}</div>}
    <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{current?.task_name ?? "Cleaning photo"}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Train {current?.coach?.rail_events?.rail_trains?.number ?? "—"} · Coach {current?.coach?.position ?? "—"} · {current?.completed_at ? new Date(current.completed_at).toLocaleString("en-IN") : ""}</p>
        {photoLoading ? <div className="grid min-h-64 place-items-center bg-muted text-sm text-muted-foreground">Opening private photo…</div> : photoError ? <p role="alert" className="text-sm text-destructive">{photoError instanceof Error ? photoError.message : "Photo unavailable"}</p> : url ? <img src={url} alt={`After cleaning: ${current?.task_name ?? "task"}`} className="max-h-[60dvh] w-full bg-muted object-contain" /> : null}
        <div className="flex items-center justify-between gap-2"><span className="text-sm text-muted-foreground">{current?.ai_score != null ? `AI score ${current.ai_score}/10 · ` : ""}Coach {current?.coach?.status ?? "pending"}</span><Button asChild size="sm" variant="outline"><Link to="/admin/rail/checker"><ExternalLink className="mr-1 h-4 w-4" />Coach sign-off</Link></Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
