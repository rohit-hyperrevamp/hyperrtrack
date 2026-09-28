-- Add a plain "Operations" role, distinct from "Operations Manager".
-- Operations Manager (operations_manager) remains the approver role for field-ops
-- requests such as rehire. The new role is for operations team members who need
-- day-to-day operations access without manager-level approvals.

INSERT INTO public.roles (key, name, description, is_system, sort_order)
VALUES (
  'operations',
  'Operations',
  'Operations team member — day-to-day operations access without manager-level approvals.',
  false,
  44
)
ON CONFLICT (key) DO NOTHING;
