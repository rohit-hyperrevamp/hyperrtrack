// Server-side database binding.
//
// This project runs on its own Lovable Cloud backend. Earlier it was pinned to
// an external production database; that pinning is removed so server code uses
// the platform-provided environment (this project's Lovable Cloud) everywhere.
//
// Called from `src/server.ts` on every request entry. Never imported by browser code.

/**
 * No-op retained for the existing call sites in `src/server.ts`.
 */
export function applyProductionServerEnv(): void {
  // Intentionally empty: the platform environment is the single source of truth.
}
