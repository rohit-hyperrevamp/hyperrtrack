import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const Input = z.object({
  imageDataUrl: z.string().startsWith("data:image/").max(4_000_000),
  area: z.string().min(1).max(40),
  eventCoachId: z.string().uuid(),
});

type AssignedCoach = { id: string; position: number; coach_number: string | null; coach_type: string | null; train_number: string; train_name: string | null; location_id: string; location_name: string; event_id: string };

async function availableCoaches(supabase: SupabaseClient<Database>, userId: string): Promise<{ coaches: AssignedCoach[]; manager: boolean }> {
  const { data: canManage, error: permissionError } = await supabase.rpc("rail_can", { _module: "rail_ops", _action: "edit" });
  if (permissionError) throw permissionError;
  const manager = canManage === true;
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  let ids: string[] | null = null;
  if (!manager) {
    const { data: tasks, error } = await supabase.from("rail_event_tasks").select("event_coach_id,rail_event_coaches!inner(rail_events!inner(event_date))").eq("assigned_to", userId).eq("rail_event_coaches.rail_events.event_date", day).is("deleted_at", null).limit(1000);
    if (error) throw error;
    const assignedIds = [...new Set((tasks ?? []).map((task) => task.event_coach_id))];
    if (!assignedIds.length) return { coaches: [], manager };
    ids = assignedIds;
  }
  const query = supabase.from("rail_event_coaches")
    .select("id,position,event_id,location_id,rail_coaches(coach_number),rail_coach_types(code),rail_events!inner(event_date,location_id,rail_trains(number,name),rail_locations(name))")
    .eq("rail_events.event_date", day).is("deleted_at", null).neq("status", "removed").order("position").limit(1000);
  const { data, error } = await (ids ? query.in("id", ids) : query);
  if (error) throw error;
  const coaches: AssignedCoach[] = [];
  for (const row of data ?? []) {
    const event = row.rail_events;
    const locationId = event?.location_id;
    if (!event || !locationId) continue;
    if (manager) {
      const { data: allowed, error: accessError } = await supabase.rpc("rail_can", { _module: "rail_ops", _action: "edit", _location: locationId });
      if (accessError) throw accessError;
      if (!allowed) continue;
    }
    coaches.push({ id: row.id, event_id: row.event_id, position: row.position, coach_number: row.rail_coaches?.coach_number ?? null,
      coach_type: row.rail_coach_types?.code ?? null, train_number: event.rail_trains?.number ?? "Train", train_name: event.rail_trains?.name ?? null,
      location_id: locationId, location_name: event.rail_locations?.name ?? "Location" });
  }
  return { coaches, manager };
}

export const getPhotoCheckCoaches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => availableCoaches(context.supabase, context.userId));

export const checkCoachCleanliness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { coaches } = await availableCoaches(supabase, userId);
    const coach = coaches.find((item) => item.id === data.eventCoachId);
    if (!coach) throw new Error("This coach is not available for your assignment today.");
    const { data: settings } = await supabase
      .from("rail_ai_settings")
      .select("pass_score,attention_score")
      .is("effective_to", null)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { scoreCleanliness } = await import("./rail-ai-clean.server");
    const r = await scoreCleanliness({
      imageDataUrl: data.imageDataUrl,
      area: data.area,
      coachType: coach.coach_type,
      passScore: Number(settings?.pass_score ?? 7),
      attentionScore: Number(settings?.attention_score ?? 5),
    });
    const { data: row, error } = await supabase
      .from("rail_ai_photo_scores")
      .insert({
        photo_path: "inline",
        area: data.area,
        coach_number: coach.coach_number ?? String(coach.position),
        coach_type: coach.coach_type,
        model: r.model,
        score: r.score,
        verdict: r.verdict,
        issues: r.issues,
        summary: r.summary,
        scored_by: userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ...r, id: row?.id ?? null };
  });
