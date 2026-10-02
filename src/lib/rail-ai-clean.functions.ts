import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  imageDataUrl: z.string().startsWith("data:image/").max(4_000_000),
  area: z.string().min(1).max(40),
  coachNumber: z.string().max(20).optional().nullable(),
  coachType: z.string().max(20).optional().nullable(),
});

export const checkCoachCleanliness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
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
      coachType: data.coachType,
      passScore: Number(settings?.pass_score ?? 7),
      attentionScore: Number(settings?.attention_score ?? 5),
    });
    const { data: row, error } = await supabase
      .from("rail_ai_photo_scores")
      .insert({
        photo_path: "inline",
        area: data.area,
        coach_number: data.coachNumber ?? null,
        coach_type: data.coachType ?? null,
        model: r.model,
        score: r.score,
        verdict: r.verdict,
        issues: r.issues,
        summary: r.summary,
        scored_by: userId,
      })
      .select("id")
      .single();
    if (error) console.error("rail_ai_photo_scores insert", error);
    return { ...r, id: row?.id ?? null };
  });
