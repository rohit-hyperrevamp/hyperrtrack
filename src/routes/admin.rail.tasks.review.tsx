import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Search, ExternalLink, MessageSquare, History } from "lucide-react";
import { toast } from "sonner";
import { db, Empty, Kpi, num, railHead, rows, StatusPill, today } from "@/lib/rail-ui";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/rail/tasks/review")({
  head: () => railHead("Task Review", "Review cleaner tasks, photos and AI scores."),
  component: ReviewPage,
});

type Task = {
  id: string;
  task_name: string;
  status: string;
  completed_at: string;
  completed_by: string;
  photo_path: string | null;
  ai_score: number | null;
  supervisor_score: number | null;
  supervisor_feedback: string | null;
  history: any[];
  rail_event_coaches: { 
    position: number; 
    rail_coaches: { coach_number: string } | null;
    rail_events: { rail_trains: { number: string } | null; rail_locations: { name: string } | null } | null;
  } | null;
  completed_by_person: { full_name: string } | null;
};

function ReviewPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number | "">("");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["rail-tasks-review"],
    queryFn: async () => {
      const { data, error } = await db.from("rail_event_tasks")
        .select(`
          id, task_name, status, completed_at, completed_by, photo_path, ai_score, supervisor_score, supervisor_feedback, history,
          rail_event_coaches(position, rail_coaches(coach_number), rail_events(rail_trains(number), rail_locations(name))),
          completed_by_person:rail_people!rail_event_tasks_completed_by_fkey(full_name)
        `)
        .eq("status", "done")
        .order("completed_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as unknown as Task[];
    },
  });

  async function saveReview() {
    if (!selected) return;
    const newHistory = [...(selected.history || []), { 
      action: "review", 
      by: (await db.auth.getUser()).data.user?.id,
      at: new Date().toISOString(),
      score,
      feedback 
    }];

    const { error } = await db.from("rail_event_tasks")
      .update({ 
        supervisor_score: score === "" ? null : Number(score), 
        supervisor_feedback: feedback,
        history: newHistory
      })
      .eq("id", selected.id);

    if (error) { toast.error(error.message); return; }
    toast.success("Review saved");
    setSelected(null);
    setFeedback("");
    setScore("");
    qc.invalidateQueries({ queryKey: ["rail-tasks-review"] });
  }

  const filtered = tasks.filter(t => 
    t.task_name.toLowerCase().includes(search.toLowerCase()) || 
    t.completed_by_person?.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Task Review" description="Verify cleaning quality from photos and AI scores." />
      
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks or cleaners..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? <div className="p-12 text-center text-muted-foreground">Loading tasks...</div> : 
           !filtered.length ? <Empty title="No tasks found" hint="Completed tasks appear here for review." /> : 
           filtered.map(t => (
            <div key={t.id} className={`p-4 rounded-lg border bg-card cursor-pointer transition-colors ${selected?.id === t.id ? 'border-brand ring-1 ring-brand' : 'hover:border-brand/40'}`} onClick={() => { setSelected(t); setFeedback(t.supervisor_feedback || ""); setScore(t.supervisor_score || ""); }}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-2">
                    {t.task_name}
                    {t.supervisor_score !== null && <CheckCircle2 className="h-4 w-4 text-success" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.rail_event_coaches?.rail_events?.rail_locations?.name} · Train {t.rail_event_coaches?.rail_events?.rail_trains?.number} · Coach {t.rail_event_coaches?.position}
                  </div>
                  <div className="text-xs font-medium mt-2">
                    {t.completed_by_person?.full_name} · {new Date(t.completed_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-xs font-bold px-2 py-1 rounded bg-muted">AI: {t.ai_score ?? '—'}</div>
                  {t.supervisor_score !== null && <div className="text-xs font-bold px-2 py-1 rounded bg-brand/10 text-brand text-center">{t.supervisor_score}/10</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {selected ? (
            <div className="sticky top-6 p-6 rounded-xl border bg-card space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg">Review Task</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button>
              </div>

              {selected.photo_path && (
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <img src={supabase.storage.from("rail-task-photos").getPublicUrl(selected.photo_path).data.publicUrl} alt="Task Proof" className="max-w-full max-h-full object-contain" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">AI Score</div>
                  <div className="text-2xl font-heading font-bold">{selected.ai_score ?? '—'}</div>
                </div>
                <div className="p-3 rounded-lg bg-brand/5">
                  <div className="text-[10px] uppercase tracking-wider text-brand font-bold">Manual Score</div>
                  <Input type="number" min="0" max="10" className="mt-1 h-8 text-lg font-bold" value={score} onChange={e => setScore(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feedback</label>
                <Textarea placeholder="Add instructions or notes for the cleaner..." value={feedback} onChange={e => setFeedback(e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><History className="h-3 w-3" /> History</div>
                <div className="text-[11px] space-y-1 max-h-32 overflow-y-auto pr-2">
                  {selected.history?.map((h, i) => (
                    <div key={i} className="border-l-2 border-muted pl-2 py-1">
                      <div className="text-muted-foreground">{new Date(h.at).toLocaleString()} · {h.action}</div>
                      {h.feedback && <div className="italic">"{h.feedback}"</div>}
                    </div>
                  )) || <div className="text-muted-foreground italic">No history yet</div>}
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={saveReview}>Save Review</Button>
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
              Select a task to review photo and AI score.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
