/**
 * Single source of truth for the AI account that reads attendance sheets.
 *
 * Attendance sheet reading is the ONLY AI document feature. It runs on the
 * built-in Lovable AI (no external key to manage) — usage is covered by the
 * project's Lovable plan. Aadhaar / PAN identity checks use SurePass, not AI.
 */

import type { LanguageModel } from "ai";

/**
 * Attendance data feeds invoicing, so accuracy outranks latency here. Use the
 * full Flash model first, and only fall back when the provider itself is
 * overloaded (503) — never as a silent quality downgrade on a good response.
 */
const ATTENDANCE_VISION_MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"] as const;

export type AiKeySource = "lovable";

function lovableKey(): string {
  return process.env["LOVABLE_API_KEY"]?.trim() || "";
}

/** True when the built-in Lovable AI is configured. */
export function aiKeyConfigured(): boolean {
  return Boolean(lovableKey());
}

/** Which account would be used right now. */
export function activeAiKeySource(): AiKeySource | null {
  return lovableKey() ? "lovable" : null;
}

function isOverloaded(error: unknown): boolean {
  const status = (error as { statusCode?: number } | null)?.statusCode;
  if (status === 429 || status === 503 || status === 500) return true;
  const message = [
    error instanceof Error ? error.message : String(error ?? ""),
    String((error as { responseBody?: unknown } | null)?.responseBody ?? ""),
  ].join(" ");
  return /\b(429|500|503)\b|overload|unavailable|high demand|rate limit|quota|exceeded|RESOURCE_EXHAUSTED/i.test(
    message,
  );
}

/**
 * Run one attendance-sheet read against the built-in Lovable AI. Only retry
 * when the provider reports the model as overloaded/rate limited — a genuine
 * failure surfaces instead of being masked by a weaker model.
 */
export async function runVision<T>(
  run: (model: LanguageModel) => Promise<T>,
  modelIds: readonly string[] = ATTENDANCE_VISION_MODELS,
): Promise<T> {
  const key = lovableKey();

  if (!key) {
    throw new Error(
      "Document reading is not available: the built-in AI is not configured for this project.",
    );
  }

  const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
  const provider = createLovableAiGatewayProvider(key);

  let lastError: unknown = null;
  for (const modelId of modelIds) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await run(provider(modelId));
      } catch (error) {
        lastError = error;
        if (!isOverloaded(error)) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Sheet reading failed: the reader is busy, please retry.");
}
