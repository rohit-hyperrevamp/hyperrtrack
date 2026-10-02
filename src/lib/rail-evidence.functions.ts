import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listRailEvidence = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: canView, error: accessError } = await context.supabase.rpc("rail_can", { _module: "rail_quality", _action: "view" });
    if (accessError || !canView) throw new Error("You do not have access to cleaning evidence");
    const { data: tasks, error } = await context.supabase.from("rail_event_tasks")
      .select("id,event_coach_id,task_name,status,completed_at,completed_by,location_id,photo_path,ai_score,rail_event_coaches(position,status,rail_coaches(coach_number),rail_events(event_date,rail_trains(number)))")
      .not("photo_path", "is", null).is("deleted_at", null).order("completed_at", { ascending: false }).limit(200);
    if (error) throw error;
    const allowed = new Map<string, boolean>();
    const scoped = [];
    for (const task of tasks ?? []) {
      if (!task.location_id) continue;
      const key = task.location_id;
      if (!allowed.has(key)) {
        const { data: canViewPlace, error: permissionError } = await context.supabase.rpc("rail_can", { _module: "rail_quality", _action: "view", _location: task.location_id });
        if (permissionError) throw permissionError;
        allowed.set(key, canViewPlace === true);
      }
      if (allowed.get(key)) scoped.push({
        id: task.id, event_coach_id: task.event_coach_id, task_name: task.task_name,
        status: task.status, completed_at: task.completed_at, completed_by: task.completed_by,
        location_id: task.location_id, ai_score: task.ai_score,
        coach: task.rail_event_coaches,
      });
    }
    return scoped;
  });

export const getRailEvidencePhoto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ taskId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: task, error } = await context.supabase.from("rail_event_tasks")
      .select("id,location_id,photo_path,status,deleted_at")
      .eq("id", data.taskId).maybeSingle();
    if (error) throw error;
    if (!task || task.deleted_at || !task.photo_path || !task.location_id) throw new Error("Photo not available");
    const { data: allowed, error: permissionError } = await context.supabase.rpc("rail_can", { _module: "rail_quality", _action: "view", _location: task.location_id });
    if (permissionError || !allowed) throw new Error("You do not have access to this photo");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage.from("rail-task-photos").createSignedUrl(task.photo_path, 300);
    if (signError || !signed?.signedUrl) throw new Error("Could not open the private photo");
    return signed.signedUrl;
  });
