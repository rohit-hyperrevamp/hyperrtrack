# View as User (Super Admin impersonation)

## What you get
- A **"View as user"** button in the top bar, visible only to Super Admin.
- Opens a search box: type a name, employee ID or mobile number, pick the person.
- Your screen switches to exactly what that person sees: their dashboard, their menu, their permissions and only the data they are allowed to see.
- A fixed coloured strip at the top of every page: **"Viewing as Rani Kumari (48874, Accounts) — Back to Super Admin view"**.
- Clicking **Back to Super Admin view** returns you to your own account on the dashboard, with no OTP.
- Every start and end of a "view as" session is recorded in System Logs (who, whom, when).

## Safety rules
- Only the Super Admin can start it; the server checks this every time, not the screen.
- You cannot "view as" another Super Admin, or someone whose account is disabled.
- While viewing as someone, anything you save is saved as that person (same as if they did it), and is logged as done during impersonation. The strip stays visible so this is never forgotten.
- Logging out while viewing as someone also ends the Super Admin session.
- No SMS or OTP is sent to the person; they are not notified and their own login is unaffected.

## Technical details
- New server function `startImpersonation` (`src/lib/impersonation.functions.ts`), `requireSupabaseAuth` + caller must be super admin (phone allowlist / `role_key='super_admin'`). Looks up the target candidate, checks `can_phone_login`, then mints a session for the target's synthetic identity using the same admin magic-link path as `restorePhoneSession` (no password change for the target).
- Client: before switching, store the Super Admin's current session (refresh token) in localStorage `radiant.impersonator`, then `supabase.auth.setSession(target)` and update `radiant.auth` to the target phone; clear React Query cache.
- `ImpersonationBanner` in the admin layout reads `radiant.impersonator`; "Back" restores the stored session via `setSession`, resets `radiant.auth`, clears cache, navigates to `/admin/dashboard`. If the stored token has expired, fall back to the normal Super Admin sign-in.
- User picker reuses existing employee search (paginated), searching `candidates` by name/employee_code/mobile.
- `logActivity` on start/stop with module label "View as User".
- Record the rule in AGENTS.md. Type check must pass.
