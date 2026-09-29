# Sales & Marketing CRM + contract-only Client Contracts

## What you'll get

### 1. New left-menu section: "Sales & Marketing" (Super Admin only for now)
- **Dashboard** – funnel tiles with counts and pipeline value per stage, conversion % stage-to-stage, won vs lost this month, expected closures in the next 30/60/90 days, leads by source and by owner, and a list of overdue follow-ups. Every tile opens the Prospects list already filtered.
- **Prospects (pipeline)** – list view and board view (columns per stage, move a card to change stage). Search, filters (stage, owner, state, source, date range), pagination, CSV export.
- **Prospect detail** – company and contact details, site location, requested headcount by designation, estimated monthly value, win probability, owner, next follow-up date, and an activity timeline (calls, meetings, emails, notes, stage changes).
- **Quotes** – build a quote from the prospect's headcount and rate card (same rate-sheet structure used for contracts), version it (v1, v2...), mark Sent / Signed / Rejected.

### 2. Funnel stages
New → Contacted → Qualified → Meeting Scheduled → Site Survey → Proposal / Pricing Negotiation → Quote Sent → Quote Signed → **Won (converted)**, plus **Lost** (with reason) and **On Hold** at any point. Stages are stored as a list in the system, so names and order can be changed later without code changes.

### 3. Win → contract, as one chain
When a quote is signed, "Convert to contract" opens a guided flow:
1. **Organization** – pick an existing organization or create a new one (name, PAN, GST, billing address, state).
2. **Unit / site** – pick an existing unit under that organization or create a new unit (name, address, state, branch, pincode, GPS location for attendance).
3. **Contract** – dates, service type, payroll window, billing type, tax; posts and rates are pre-filled from the signed quote's rate card.
4. Save → contract is created at unit level in the normal approval flow, the prospect is marked Won and linked to the new contract.

### 4. Client Contracts becomes contracts only
- Remove the Prospect tab, prospect codes, "Lost" status and prospect stage controls from Client Contracts and the dashboard contract tile.
- "New contract" on this page uses the same Organization → Unit → Contract chain (select or create), so a contract is always tied to a unit and its parent organization.
- Existing data: the one current prospect row (no real contract) moves into the new Prospects list; 938 client contracts are untouched.

### 5. Access
- New permission module "Sales & Marketing" with sub-modules Dashboard, Prospects, Quotes — visible to Super Admin only until you tell me who else gets it.
- All create/edit/stage-change/convert actions are recorded in System Logs as "Sales & Marketing".

## Technical details
- Prod migration under `db/prod-migrations/`: tables `crm_stages`, `crm_leads`, `crm_lead_contacts`, `crm_lead_requirements` (designation, qty, shift hours), `crm_activities`, `crm_quotes`, `crm_quote_lines`, `crm_lost_reasons`; GRANTs + RLS gated by `current_user_has_permission('sales_marketing', ...)` (super admin only by default); stage change trigger writes an activity row.
- Leads link to `customers`/`units` once converted (`converted_contract_id`); prospect rows in `client_contracts` migrated to `crm_leads`, `record_type` column left in place and marked deprecated.
- Routes: `admin.sales.tsx` (layout), `admin.sales.dashboard.tsx`, `admin.sales.prospects.tsx`, `admin.sales.prospects.$leadId.tsx`, `admin.sales.quotes.tsx`.
- Shared `OrgUnitContractWizard` component used by both Convert and Client Contracts "New contract".
- RBAC registry entry `sales_marketing`; `bunx tsgo --noEmit` must pass.
