import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Backend connection comes from this project's own Lovable Cloud environment
// (.env / platform-injected values). No hardcoded database pinning.

// The build host injects `process.env.*` defines whose values are fallback
// expressions (e.g. `(globalThis.process.env.X ?? ("..."))`). esbuild rejects
// non-literal define values, so drop them and let the server read env at runtime.
const isLiteral = (v: unknown) => {
  if (typeof v !== "string") return true;
  const t = v.trim();
  if (/^(undefined|null|true|false|-?\d+(\.\d+)?)$/.test(t)) return true;
  if (/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(t)) return true;
  try { JSON.parse(t); return true; } catch { return false; }
};
const sanitize = (d?: Record<string, unknown>) => {
  if (!d) return;
  for (const k of Object.keys(d)) if (!isLiteral(d[k])) delete d[k];
};
const sanitizeDefines = {
  name: "sanitize-env-defines",
  enforce: "post" as const,
  configResolved(config: any) {
    sanitize(config.define);
    for (const env of Object.values(config.environments ?? {}) as any[]) sanitize(env?.define);
  },
  configEnvironment(_name: string, config: any) {
    sanitize(config.define);
  },
};

export default defineConfig({
  nitro: { preset: "vercel" },
  vite: { plugins: [sanitizeDefines] },
});
