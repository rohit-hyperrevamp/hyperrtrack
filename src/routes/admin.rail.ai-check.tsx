import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, CheckCircle2, AlertTriangle, XCircle, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { capturePhoto } from "@/lib/native-camera";
import { checkCoachCleanliness } from "@/lib/rail-ai-clean.functions";
import { logActivity } from "@/lib/activity-log";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/rail/ai-check")({
  head: () => ({
    meta: [
      { title: "AI Clean Check — HyperTrack" },
      { name: "description", content: "Take a photo of a coach area and get an instant AI cleanliness score out of 10." },
      { property: "og:title", content: "AI Clean Check — HyperTrack" },
      { property: "og:description", content: "Instant AI cleanliness score for train coach photos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AiCheckPage,
});

const AREA_LABELS: Record<string, string> = {
  toilet: "Toilet", floor: "Floor", berths: "Berths / seats", windows: "Windows", dustbin: "Dustbin",
  doorway: "Doorway", washbasin: "Wash basin", vestibule: "Vestibule",
};

type Result = Awaited<ReturnType<typeof checkCoachCleanliness>>;

// Shrink camera photos to ~1024px JPEG before sending (keeps upload ~150-250 KB).
async function shrink(dataUrl: string): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  const context = c.getContext("2d");
  if (!context) throw new Error("Could not prepare the photo. Please try again.");
  context.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.75);
}

function AiCheckPage() {
  const run = useServerFn(checkCoachCleanliness);
  const [area, setArea] = useState("toilet");
  const [coach, setCoach] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const { data: areas = Object.keys(AREA_LABELS) } = useQuery({
    queryKey: ["rail-ai-areas"],
    queryFn: async () => {
      const { data } = await supabase.from("rail_ai_settings").select("areas").is("effective_to", null).order("effective_from", { ascending: false }).limit(1).maybeSingle();
      return (data?.areas as string[] | undefined) ?? Object.keys(AREA_LABELS);
    },
  });

  const { data: recent = [], refetch } = useQuery({
    queryKey: ["rail-ai-recent"],
    queryFn: async () => {
      const { data } = await supabase.from("rail_ai_photo_scores").select("id,area,coach_number,score,verdict,summary,created_at").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  async function takeAndCheck() {
    const raw = await capturePhoto({ title: `Photo of ${AREA_LABELS[area] ?? area}` });
    if (!raw) return;
    setBusy(true);
    setResult(null);
    try {
      const small = await shrink(raw);
      setPhoto(small);
      const r = await run({ data: { imageDataUrl: small, area, coachNumber: coach || null } });
      setResult(r);
      await logActivity({ module: "AI Clean Check", action: "create", entityType: "rail_ai_photo_scores", entityId: r.id ?? undefined, details: { area, coach, score: r.score, verdict: r.verdict } });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Check failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rail-photo-check mx-auto max-w-xl space-y-5">
      <PageHeader title="Photo Check" description="Take a photo after cleaning. The AI scores it out of 10. Your supervisor still gives the final approval." />

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor="coach">Coach number (optional)</Label>
          <Input id="coach" inputMode="numeric" className="font-mono tabular-nums text-lg" value={coach} onChange={(e) => setCoach(e.target.value)} placeholder="e.g. 200145" />
        </div>
        <div className="space-y-1">
          <Label>Area</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {areas.map((a) => (
              <Button
                key={a}
                type="button"
                variant={area === a ? "default" : "outline"}
                onClick={() => setArea(a)}
                aria-pressed={area === a}
                className="min-h-12 h-auto whitespace-normal rounded-lg px-2 py-2 text-center text-sm font-medium"
              >
                {AREA_LABELS[a] ?? a}
              </Button>
            ))}
          </div>
        </div>
        <Button className="h-14 w-full text-base" onClick={takeAndCheck} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Camera className="mr-2 h-5 w-5" />}
          {busy ? "Checking photo…" : photo ? "Retake photo" : "Open camera"}
        </Button>
      </div>

      {photo && (
        <div className="overflow-hidden rounded-xl border border-border">
          <img src={photo} alt={`Photo of ${AREA_LABELS[area] ?? area}`} className="max-h-80 w-full object-contain bg-muted" />
        </div>
      )}

      {result && <ResultCard r={result} onRetake={takeAndCheck} />}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent checks</h2>
        {recent.length === 0 && <p className="text-sm text-muted-foreground">No checks yet. Take your first photo above.</p>}
        {recent.map((r) => (
          <div key={r.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border px-3 py-3 text-sm">
            <span className="min-w-0 truncate">{AREA_LABELS[r.area ?? ""] ?? r.area}{r.coach_number ? <span className="ml-2 font-mono tabular-nums text-muted-foreground">{r.coach_number}</span> : null}</span>
            <span className="flex shrink-0 items-center gap-2"><VerdictIcon v={r.verdict} /><span className="font-mono tabular-nums">{Number(r.score).toFixed(1)}</span></span>
          </div>
        ))}
      </section>
    </div>
  );
}

function VerdictIcon({ v }: { v: string }) {
  if (v === "clean") return <CheckCircle2 className="h-4 w-4 text-chart-2" aria-label="Clean" />;
  if (v === "attention") return <AlertTriangle className="h-4 w-4 text-chart-4" aria-label="Needs attention" />;
  return <XCircle className="h-4 w-4 text-destructive" aria-label="Dirty" />;
}

function ResultCard({ r, onRetake }: { r: Result; onRetake: () => void }) {
  const label = r.verdict === "clean" ? "Clean" : r.verdict === "attention" ? "Needs attention" : "Dirty";
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4" role="status">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2 text-lg font-semibold"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted"><VerdictIcon v={r.verdict} /></span><span className="min-w-0">{label}</span></div>
        <div className="shrink-0 font-mono text-2xl font-bold tabular-nums">{r.score.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></div>
      </div>
      {r.summary && <p className="text-sm">{r.summary}</p>}
      {r.issues.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{r.issues.map((i) => <li key={i}>{i}</li>)}</ul>
      )}
      {r.verdict !== "clean" && (
        <Button variant="outline" className="h-12 w-full" onClick={onRetake}><RotateCcw className="mr-2 h-4 w-4" />Clean again and retake</Button>
      )}
    </div>
  );
}
