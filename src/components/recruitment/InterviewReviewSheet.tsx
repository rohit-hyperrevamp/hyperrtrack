import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink, FileText, Mail, MapPin, Phone, Star, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { logActivity } from "@/lib/activity-log";
import {
  fetchCandidate, fmtDateTime, inr, recDb, REC_BUCKET, REC_MODULE, stageLabel, stageTone,
  type RecCandidate, type RecInterview,
} from "@/lib/recruitment";
import { cn } from "@/lib/utils";

/** Full candidate review for an interviewer: profile, resume preview, previous rounds and the feedback form. */
export function InterviewReviewSheet({
  interview, candidate, onClose,
}: { interview: RecInterview; candidate: RecCandidate | null; onClose: () => void }) {
  const qc = useQueryClient();
  const detailQ = useQuery({ queryKey: ["rec", "candidate", interview.candidate_id], queryFn: () => fetchCandidate(interview.candidate_id) });
  const c = detailQ.data?.candidate ?? candidate;
  const resumeQ = useQuery({
    queryKey: ["rec", "resume-url", c?.resume_path],
    enabled: !!c?.resume_path,
    staleTime: 240_000,
    queryFn: async () => {
      const { data, error } = await recDb.storage.from(REC_BUCKET).createSignedUrl(c!.resume_path, 300);
      if (error) throw error;
      return data.signedUrl as string;
    },
  });
  const [feedback, setFeedback] = useState(interview.feedback ?? "");
  const [rating, setRating] = useState(interview.rating ?? 0);
  const [busy, setBusy] = useState<"" | "approved" | "rejected">("");
  const decided = interview.status !== "scheduled";
  const history = (detailQ.data?.interviews ?? []).filter((i) => i.id !== interview.id && i.status !== "scheduled");
  const isPdf = /\.pdf$/i.test(c?.resume_name || c?.resume_path || "");

  async function submit(decision: "approved" | "rejected") {
    if (!rating) return toast.error("Give a rating");
    if (!feedback.trim()) return toast.error("Feedback is required");
    setBusy(decision);
    try {
      const { data, error } = await recDb.rpc("rec_submit_interview_result", { _interview_id: interview.id, _decision: decision, _feedback: feedback.trim(), _rating: rating });
      if (error) throw error;
      void logActivity({ module: REC_MODULE, action: decision === "approved" ? "approve" : "reject", entityType: "rec_interviews", entityId: interview.id, entityLabel: `${c?.full_name ?? "Candidate"} round ${interview.round_no}`, details: { next_stage: data, rating } });
      await qc.invalidateQueries({ queryKey: ["rec"] });
      toast.success(decision === "approved" ? `Approved — now ${stageLabel(String(data))}` : "Rejected");
      onClose();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(""); }
  }

  const facts: [string, string][] = c ? [
    ["Experience", `${c.experience_years} yrs`],
    ["Current CTC", inr(c.current_ctc)],
    ["Expected CTC", inr(c.expected_ctc)],
    ["Notice", `${c.notice_days} days`],
    ["Source", c.source || "—"],
    ["Referred by", c.referred_by || "—"],
  ] : [];

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="center" className="w-full overflow-y-auto p-0 sm:max-w-3xl">
        <SheetHeader className="border-b border-border/60 px-6 py-5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle className="text-xl">{c?.full_name ?? "Candidate"}</SheetTitle>
            <span className="text-sm text-muted-foreground">{c?.code}</span>
            {c && <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", stageTone(c.stage))}>{stageLabel(c.stage)}</span>}
          </div>
          <p className="text-sm text-muted-foreground">Round {interview.round_no}: {interview.round_name} · {fmtDateTime(interview.scheduled_at)} · {interview.mode.replace("_", " ")}{interview.location ? ` · ${interview.location}` : ""}</p>
        </SheetHeader>

        <div className="space-y-6 px-6 py-5">
          {c && (
            <section className="space-y-3">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                {c.mobile && <a href={`tel:${c.mobile}`} className="flex items-center gap-1.5 hover:text-foreground"><Phone className="h-3.5 w-3.5" />{c.mobile}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-foreground"><Mail className="h-3.5 w-3.5" />{c.email}</a>}
                {c.current_location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{c.current_location}</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {facts.map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div>
                    <div className="truncate text-sm font-medium">{v}</div>
                  </div>
                ))}
              </div>
              {c.notes && <p className="rounded-xl border border-border/60 bg-muted/20 p-3 text-sm whitespace-pre-wrap">{c.notes}</p>}
            </section>
          )}

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-accent" />Resume</h3>
              {resumeQ.data && <Button size="sm" variant="outline" asChild><a href={resumeQ.data} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-4 w-4" />Open in new tab</a></Button>}
            </div>
            {!c?.resume_path ? <p className="text-sm text-muted-foreground">No resume uploaded.</p>
              : resumeQ.isLoading ? <p className="text-sm text-muted-foreground">Loading resume…</p>
              : resumeQ.error ? <p className="text-sm text-destructive">Could not load resume.</p>
              : isPdf ? <iframe title="Resume" src={resumeQ.data} className="h-[60vh] w-full rounded-xl border border-border/60 bg-background" />
              : <p className="text-sm text-muted-foreground">{c.resume_name} — preview not available, use "Open in new tab".</p>}
          </section>

          {history.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Previous rounds</h3>
              {history.map((h) => (
                <div key={h.id} className="rounded-xl border border-border/60 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">Round {h.round_no}: {h.round_name}</span>
                    <span className={cn("text-xs capitalize", h.status === "rejected" ? "text-destructive" : "text-primary")}>{h.status}{h.rating ? ` · ${h.rating}/5` : ""}</span>
                  </div>
                  {h.feedback && <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{h.feedback}</p>}
                </div>
              ))}
            </section>
          )}

          <section className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
            <h3 className="text-sm font-semibold">{decided ? "Your feedback" : "Interview feedback"}</h3>
            <div className="space-y-1.5">
              <Label className="text-xs">Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" disabled={decided} onClick={() => setRating(n)} aria-label={`${n} star`}
                    className={cn("flex h-9 w-9 items-center justify-center rounded-lg border transition", rating >= n ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent/60")}>
                    <Star className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Feedback *</Label>
              <Textarea rows={5} disabled={decided} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Strengths, concerns, communication, recommendation" />
            </div>
            {decided ? (
              <p className={cn("text-sm font-medium capitalize", interview.status === "rejected" ? "text-destructive" : "text-primary")}>Decision: {interview.status}</p>
            ) : (
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="destructive" disabled={!!busy} onClick={() => submit("rejected")}><XCircle className="mr-1 h-4 w-4" />{busy === "rejected" ? "Saving…" : "Reject"}</Button>
                <Button disabled={!!busy} onClick={() => submit("approved")}><CheckCircle2 className="mr-1 h-4 w-4" />{busy === "approved" ? "Saving…" : "Approve & advance"}</Button>
              </div>
            )}
          </section>

          <Link to="/admin/hr/recruitment/candidates/$recId" params={{ recId: interview.candidate_id }} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            Open full candidate page <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
