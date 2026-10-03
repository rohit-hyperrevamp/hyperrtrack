import { applyProductionServerEnv } from "./lib/server-env";

applyProductionServerEnv();

import "./lib/error-capture";

import handler, { createServerEntry, type ServerEntry } from "@tanstack/react-start/server-entry";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Hosts outside Lovable (e.g. the Git → Vercel deployment) don't carry the
// private backend key. Forward backend work and Lovable-hosted media to the
// Lovable deployment built from the same commit so sign-in and data work.
const LOVABLE_ORIGIN = "https://hyperrtrack.lovable.app";
const RELAY_PREFIXES = ["/_serverFn/", "/api/", "/__l5e/"];

async function relayToLovable(request: Request): Promise<Response | null> {
  if (process.env["SUPABASE_SERVICE_ROLE_KEY"]) return null;
  const url = new URL(request.url);
  if (url.origin === LOVABLE_ORIGIN) return null;
  if (!RELAY_PREFIXES.some((p) => url.pathname.startsWith(p))) return null;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.set("x-radiant-caller", "radiant-production-shell");
  headers.set("origin", LOVABLE_ORIGIN);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(LOVABLE_ORIGIN + url.pathname + url.search, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });
  const out = new Headers(upstream.headers);
  out.delete("content-encoding");
  out.delete("content-length");
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export default createServerEntry({
  async fetch(...args) {
    applyProductionServerEnv();
    try {
      const relayed = await relayToLovable(args[0] as Request);
      if (relayed) return relayed;
      const response = await handler.fetch(...args);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
});
