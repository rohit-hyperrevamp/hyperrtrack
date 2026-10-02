# HyperTrack: side widget, cleaner Sustainability, full People & Pay and Finance

## What already exists (answer to "where is payroll?")
The earlier security-company system still has all of these screens. They are hidden from the HyperTrack sidebar, but they still work:
- **Salary structures**: Allowance Manager (wage parts like Basic, HRA, etc.), Deduction Types, Employer Contributions (PF, ESIC and similar), Payroll Days rules. Contract lines set these per role (designation).
- **Payroll**: Payroll register per site, Payroll Manager with approval steps, and Deductions.
- **Invoices**: Invoice register per site, invoice numbering, and the final invoice.
- **Attendance, onboarding, offboarding, rehire**: Attendance muster, Employees, Candidates (onboarding), offboarding reasons, and rehire requests.

These screens are not connected to HyperTrack's depots and cleaners yet. The rail Billing and People pages run separately.

## 1. Side overview panel on every rail page
A fixed panel on the left side of the content area on desktop (next to the sidebar, which stays as it is). On phones it becomes a swipe-up sheet.
- **Place picker** at the top (All places, or one depot or station). The choice carries across pages.
- **Command Centre**: staff required, staff present now, the gap, and a list of who is present with their role and check-in time.
- **Each page shows related data in the same panel**:
  - Live Board: jobs running now and who is on them
  - Quality: open complaints and inspections due
  - Supplies: low-stock items
  - Billing: this month's billed amount, penalties, and amount pending sign-off
  - Sustainability: water and energy used today against the norm
  - People: present, absent, on leave
  - Payroll and Finance: payroll cost against invoice value for the month
- The panel is a single shared widget. Each page supplies its own section, so pages stay consistent.

## 2. Cleaner Sustainability page
- 4 headline tiles (Water, Chemicals, Energy, CO2) showing each figure against its norm
- One trend chart and one simple table
- Forms open in the standard centred dialog
- Text-heavy blocks removed

## 3. People & Pay and Finance in HyperTrack
New sidebar groups that reuse the existing screens (no second payroll engine):
- **People**: Employees, Onboarding, Attendance, Offboarding, Rehire
- **Pay setup**: Salary parts, Deductions, Employer contributions, Payroll days. A salary structure is set **per role**, so each role can have different pay parts and deductions.
- **Payroll**: Payroll register and approvals
- **Finance**:
  - Invoices
  - A new **Profit view** for each depot and month: invoice value against payroll cost, employer cost and penalties, giving the margin. The figures can be opened for detail.

Connecting to rail:
- Each depot maps to a site, and each depot contract maps to a contract.
- Each rail worker is linked to an employee record.
- This way, rail attendance feeds the existing payroll calculation.

## 4. Role-based pay visibility
- **Cleaners and other workers** (phone): a "My Pay" page with their own profile, monthly payslips (earnings, deductions, net pay) and attendance days. They see nothing about anyone else.
- **Supervisors and depot managers**: their team's attendance and net pay totals, without the CTC breakdown.
- **Super admin and leadership**: the full CTC breakdown, employer costs and the Profit view.
- Access is enforced by database rules, not just hidden in the screen.

## Technical details
- `RailSidePanel` is rendered in the `admin.rail.tsx` layout. Pages register their section through a small context or registry keyed by route. The place filter is stored in a shared hook (URL search param plus localStorage).
- New linking: `rail_locations.unit_id` and `rail_people.candidate_id` (nullable, added additively). Rail attendance is synced into `attendance_entries` through a security-definer function, so `payroll-process.ts` and the invoice code stay unchanged.
- Profit view: a new `rail_depot_pnl(_month)` function returns invoice, gross, employer contributions, penalties and margin per location. It is gated by `rail_can('finance','view')`.
- My Pay reads `payroll_run_snapshots` filtered by `current_user_candidate_id()`. CTC columns are limited to leadership roles.
- Legacy screens are linked from the rail sidebar under the rail shell styling. Page access goes through `rail_page_access` modules (`people`, `payroll`, `finance`).
- Schema changes are made as additive migrations. Every new admin action calls `logActivity`.

## Open items
- Real salary figures, minimum wages and the depot-to-site mapping need your data. Sample structures are clearly labelled until then.
