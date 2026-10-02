import { streamText } from "ai";

export type CleanVerdict = "clean" | "attention" | "dirty";
export type CleanScore = {
  score: number;
  verdict: CleanVerdict;
  issues: string[];
  summary: string;
  model: string;
};

const MODEL = "openai/gpt-6-astra";

const SYSTEM = `You inspect photos of Indian Railways passenger coach areas after cleaning.
Score how clean the visible area is from 0 to 10 using this rubric:
10 = spotless, no stains, litter, water pooling, odour signs or residue.
7-9 = clean with minor marks.
4-6 = visible dirt, stains, litter or an unemptied bin.
0-3 = clearly dirty, soiled toilet, garbage, heavy stains.
If the photo does not show a coach area, is too dark or too blurry to judge, give score 0 and say why in issues.
Reply with JSON only: {"score": number, "issues": string[], "summary": string}. Keep issues short (max 5) and summary under 20 words.`;

function toBytes(dataUrl: string): Uint8Array {
  const m = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  if (!m) throw new Error("Photo must be a camera image.");
  return Uint8Array.from(atob(m[1]!), (c) => c.charCodeAt(0));
}

export async function scoreCleanliness(input: {
  imageDataUrl: string;
  area: string;
  coachType?: string | null;
  passScore: number;
  attentionScore: number;
}): Promise<CleanScore> {
  const key = process.env["LOVABLE_API_KEY"]?.trim();
  if (!key) throw new Error("AI check is not configured for this project.");
  const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
  const provider = createLovableAiGatewayProvider(key);

  const result = streamText({
    model: provider(MODEL),
    system: SYSTEM,
    maxRetries: 0,
    providerOptions: { lovable: { reasoningEffort: "low" } },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `Area: ${input.area}. Coach type: ${input.coachType || "unknown"}. Score this photo.` },
          { type: "image", image: toBytes(input.imageDataUrl) },
        ],
      },
    ],
  });

  let text: string;
  try {
    text = await result.text;
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 402) throw new Error("AI credits have run out. Add credits to continue photo checks.");
    if (status === 429) throw new Error("AI checker is busy. Please try again in a minute.");
    throw err;
  }
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  let parsed: { score?: unknown; issues?: unknown; summary?: unknown };
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("AI could not read this photo. Please retake it.");
  }
  const score = Math.max(0, Math.min(10, Math.round(Number(parsed.score) * 10) / 10 || 0));
  const verdict: CleanVerdict =
    score >= input.passScore ? "clean" : score >= input.attentionScore ? "attention" : "dirty";
  return {
    score,
    verdict,
    issues: Array.isArray(parsed.issues) ? parsed.issues.map(String).slice(0, 5) : [],
    summary: String(parsed.summary ?? ""),
    model: MODEL,
  };
}
