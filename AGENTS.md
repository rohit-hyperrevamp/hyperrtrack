
- Training files live in the private `training` storage bucket (path `<role_key>/<file>`); `training_modules` holds metadata only and files open via short-lived signed links — keeps the database small and fast.
- Attendance selfies remain private object-storage files and are compressed client-side to 420px JPEG thumbnails before upload — keeps punch capture fast and storage small.
- Mixed-window charter lifecycle statuses load through `batch_period_statuses(jsonb)` in one RLS-respecting request — prevents per-window request fan-out.
- Site-grain MIS exports group by unit, designation, and billing rate — preserves separate contract line items while still consolidating employees on identical rates.
- Payroll approval is role-based: workflow_steps.approver_role_key='payroll' (approver_candidate_id only when a step must be a named person) — approvals follow the team, not an individual.
- Login OTP send and verification run server-side through MSG91, with the Lovable deployment as the credentialed relay for the production shell — prevents employee office IPs from being blocked by provider IP controls.
- Sales & Marketing CRM lives in `crm_*` tables gated by `current_user_can_crm()` (Super Admin + `sales_marketing` RBAC module); prospects convert via the org → unit → contract chain (`OrgUnitChain`) into a pending-approval contract draft — Client Contracts holds contracts only.
