import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getRailEvidencePhoto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ taskId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: task, error } = await supabaseAdmin.from("rail_event_tasks")
      .select("id,location_id,photo_path,status,deleted_at")
      .eq("id", data.taskId).maybeSingle();
    if (error) throw error;
    if (!task || task.deleted_at || !task.photo_path) throw new Error("Photo not available");
    const { data: allowed, error: permissionError } = await context.supabase.rpc("rail_can", { _module: "rail_quality", _action: "view", _location: task.location_id });
    if (permissionError || !allowed) throw new Error("You do not have access to this photo");
    const { data: signed, error: signError } = await supabaseAdmin.storage.from("rail-task-photos").createSignedUrl(task.photo_path, 300);
    if (signError || !signed?.signedUrl) throw new Error("Could not open the private photo");
    return signed.signedUrl;
  });
