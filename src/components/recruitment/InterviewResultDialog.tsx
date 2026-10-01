import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { logActivity } from "@/lib/activity-log";
import { recDb, REC_MODULE, stageLabel, type RecInterview } from "@/lib/recruitment";
import { cn } from "@/lib/utils";

/** Approve/Reject an interview round. Approve advances the candidate to the next round automatically. */
export function InterviewResultDialog({
  interview, candidateName, decision, onClose,
}: { interview: RecInterview; candidateName: string; decision: "approved" | "rejected"; onClose: () => void }) {
  const qc = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!feedback.trim()) return toast.error("Feedback is required");
    if (!rating) return toast.error("Give a rating");
    setBusy(true);
    try {
      const { data, error } = await recDb.rpc("rec_submit_interview_result", { _interview_id: interview.id, _decision: decision, _feedback: feedback.trim(), _rating: rating });
      if (error) throw error;
      void logActivity({ module: REC_MODULE, action: decision === "approved" ? "approve" : "reject", entityType: "rec_interviews", entityId: interview.id, entityLabel: `${candidateName} round ${interview.round_no}`, details: { next_stage: data, rating } });
      await qc.invalidateQueries({ queryKey: ["rec"] });
      toast.success(decision === "approved" ? `Approved — now ${stageLabel(String(data))}` : "Rejected");
      onClose();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{decision === "approved" ? "Approve" : "Reject"} {candidateName} — Round {interview.round_no}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className={cn("h-9 w-9 rounded-lg border text-sm font-medium", rating >= n ? "border-accent bg-accent text-accent-foreground" : "border-border")}>{n}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Feedback *</Label>
            <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Strengths, concerns, recommendation" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={decision === "rejected" ? "destructive" : "default"} disabled={busy} onClick={submit}>{busy ? "Saving…" : decision === "approved" ? "Approve" : "Reject"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
