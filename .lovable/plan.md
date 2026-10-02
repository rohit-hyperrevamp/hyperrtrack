# Rail Clean OS: build Phases 1 to 7

The seven briefs you shared are built in order. Each phase is finished and tested before the next one starts. Phases 1 to 3 come from the earlier briefs; Phases 4 to 7 come from today's message. Everything follows the build rules already agreed: nothing fixed in code, dated values, soft delete, full history, access by role and data scope, the control-room design, and click-through on every number.

## Phase 1: Setup (masters, access, sample data)
- Tree of railway places: zone → division → depot / station → pit line / platform / bay / store. Each place has a code, a map boundary and an area class (A/B/C).
- Coach families and coach types (SL, GS, 3A, 3E, 2A, 1A, CC, EC, SLR, EOG, PC), train categories, trains, timetables per place, and standard coach order (rake).
- Coach register with a QR code for each coach.
- Service types, and checklists by service × coach type × area. Checklist text in English, Hindi and Marathi, with "photo required" per item and a weight.
- Task templates with the skill needed and standard minutes.
- Railway contracts:
  - Letter of Acceptance and GeM reference, sites, shifts.
  - Rate lines with dates: per coach / per day / per trip / lump sum.
  - Staffing norms, and the rule for partly cleaned coaches.
- Reason codes, screen labels, custom fields, alert rules.
- Roles: Super Admin, Project Head, Depot Manager, Shift Supervisor, Cleaner/Janitor, Store Keeper, HR/Payroll, Accounts, Railway Checker, Auditor.
  - Railway Checker is an outside user who can read, inspect and sign only, and never sees wages or costs.
  - Auditor can only read.
  - Roles can be given for a set period, and nobody can approve their own record.
- Screens:
  - Settings hub: one card per master, with a side panel for editing, a history tab, and import / export.
  - Place-tree editor with drag to move and a map to draw boundaries.
  - Train page with a drag-to-order coach strip.
  - Checklist builder with a preview of what the cleaner will see.
  - Role grid with a data-scope picker and "view as role".
- Sample data: 1 zone, 2 divisions, 2 depots with 3 pit lines each, 1 Clean Train Station, 10 trains, 300 coaches.
- **Done when:** an admin sets up a full contract without code, and a supervisor cannot see another depot's data.

## Phase 2: Daily operations
- Cleaning jobs for the next 48 hours are created automatically every night at 00:05. Special jobs can be added by hand.
- Job steps: Scheduled → Expected → Placed → In Progress → Ready for Inspection → Approved / Rework → Released.
  - Problems such as not placed, cancelled, withdrawn early, partly done or disputed always need a reason.
- When the train is placed, the supervisor confirms the actual coaches (scan or tick). Tasks are created for each coach. Coaches removed lose their tasks; coaches added get new ones.
- Late placement shortens the time window and records the railway's delay. At shift end, open jobs pass to the next supervisor with a handover note.
- Supervisor Live Board:
  - One card per line, showing the coach strip coloured by progress, a countdown ring to release, the team and the status.
  - Assign a team to a group of coaches in one action, or let the system auto-assign.
  - A staffing gauge shows staff present against the norm, with suggestions to move people.
- Cleaner phone app:
  - Sign in with phone and code on their own phone. Selfie and location check-in (the existing feature).
  - Before photo (camera only, no gallery), checklist, after photo, done, next coach.
  - Photos are shrunk to about 200 KB and stamped with time, location, person and coach.
  - Works offline, with a queue for clashes that the supervisor resolves.
  - Clean Train Station quick mode, an on-board (OBHS) rounds mode, Hindi / Marathi / English, and spoken prompts.
- **Done when:** a 24-coach train goes from Expected to Released on a phone in airplane mode and syncs later.

## Phase 3: Quality, penalties and complaints
- Coach-by-coach inspection scored out of 10, with a before/after photo viewer.
- Joint sign-off with the railway checker by code. Signed inspections can never be changed; corrections are new linked records.
- Disputes with evidence, which adjust the penalty when accepted.
- Penalty rule builder: WHEN … AND … THEN deduct … CAP … UNLESS … . Rules are dated and have a "what-if" tester. Rules run at sign-off and every hour.
- Deep-clean (intensive) planner: due and overdue coaches can be dragged onto an upcoming job.
- Complaints from on-board staff, Rail Madad and Coach Mitra, with time limits and escalation.
- Trust score from 0 to 100 for each job:
  - It drops for repeated photos, being outside the site boundary, phone clock differences, work done impossibly fast, missing photos, and jobs completed only offline.
  - Jobs with a low score need review before billing.
- Alerts in the app and on the phone, driven by the alert rules.

## Phase 4: Supplies and equipment (built on the existing inventory)
- **Items** gain:
  - Unit, concentrate or ready-to-use, and dilution ratio.
  - Hazard class and safety data sheet (MSDS) file.
  - Whether the item is approved for each contract, and its reorder level.
  - Batches with expiry date and cost.
- **Usage norms:** item × service × coach type → expected quantity per coach, with dates.
- **Daily flow:**
  1. The supervisor collects the day's supplies kit from the store.
  2. Usage is filled in from the norm when a task is done; the supervisor can edit it.
  3. Unused supplies go back to the store at shift end.
- Items not approved for a contract cannot be issued to that contract's jobs.
- Variance report (actual against norm) by site, cleaner and coach type. Alert above 25%, which can be changed.
- Purchase request → approval by someone else → goods received note.
- **Equipment register** with QR tags covering:
  - Machines: jet machine, scrubber-drier, vacuum, fogger.
  - Small kit: ladder, trolley, phone or tablet, ACWP spare parts.
  - Wearables: PPE and uniforms.
  - Vehicles: tractor and tanker.
- Equipment is checked out and in by QR scan, with condition and a photo. Nothing new can be issued to a person holding overdue items.
- Preventive maintenance, breakdown tickets and downtime. A PPE register per worker with replacement cycles.
- **Screens:**
  - Stock with days of cover.
  - Who holds what.
  - Maintenance calendar.
  - Variance leaderboard.
  - Store keeper scan screen on the phone.

## Phase 5: Water, chemicals, energy and carbon
- **Records:**
  - Meters for fresh water, recycled water, electricity and fuel, with photo readings.
  - Emission factors, with dates.
  - A resource record for each job.
- **How records are written:** each finished job writes meter-based lines (marked "metered") or norm-based lines (marked "estimated"). The two are never mixed in totals.
- **Starting values (editable, with dates):**
  - Manual wash: 1,500 L per coach.
  - Washing plant (ACWP): 300 L per coach with 80% recycled.
  - Electricity: 0.7 kg CO2 per kWh, to be replaced with the client's chosen official value.
  - Diesel: 2.68 kg CO2 per litre.
- **Calculations:**
  - Water saved = the manual baseline minus the fresh water actually used.
  - Carbon = electricity × grid factor + diesel × diesel factor + water × water factor + chemicals × chemical factor.
- **Inputs:** washing plant monthly reports can be imported from CSV.
- **Sustainability dashboard:**
  - Water: litres saved, recycled %, fresh litres per coach.
  - Chemicals: litres per coach.
  - Carbon: kg CO2e per coach.
  - Wash method mix (machine vs manual) and % of figures that are metered.
  - Monthly trend and a site league table.
- **Nudges:** leak warnings, and projected savings from moving manual coaches to the washing plant.
- **Reporting:**
  - Monthly ESG report as a PDF, with a data-quality statement and sign-off.
  - A live savings counter on the Command Centre.

## Phase 6: Railway billing and wage compliance
- **Monthly bill per contract:**
  - Built only from approved coaches (or per day / per trip / lump sum), using the rate valid on each date.
  - The partly-cleaned rule is applied, then penalties are deducted, then GST is added.
  - The same train + date + service + coach can never be billed twice.
- **Coach-wise annexure (PDF + Excel):**
  - The railway checker signs it by code.
  - A fingerprint of the signed file is stored so any change can be detected.
- **Bill steps:** Draft → Submitted → Checker Verified → Certified → Paid. Corrections are made with credit notes.
- **Minimum wages:**
  - Rules by area class × skill, as basic + VDA per day, with dates.
  - Starting values (1 April 2026, unskilled sweeping and cleaning): A 827, B 693, C 556.
  - The 1 Oct 2026 values are left for your admin to enter.
- **Payroll** keeps its current formulas but refuses any daily wage below the minimum. EPF and ESIC percentages come from Settings.
- **Compliance documents** each month: bank transfer proof, EPF ECR, ESIC challan, attendance register. A bill cannot be submitted until all are in.
- Each worker's tasks done are compared with the hours they were present.

## Phase 7: Dashboards, polish and the full test
- **Dashboards:**
  - Command Centre: map of depots with live status, 10 key figures and a problems feed.
  - Depot: a timeline of the day's jobs per line, staffing, stock alerts.
  - Railway Checker: sign-off queue and bills to sign.
  - Cleaner "Me": today's tasks, quality score, attendance, payslip.
  - Scorecards for each cleaner and supervisor.
- **Polish:**
  - Ctrl+K quick search and keyboard shortcuts on the Live Board.
  - Helpful "nothing here yet" screens and loading placeholders.
  - Confirmations with undo, layouts that work on every screen size, and accessibility (WCAG AA).
- **End-to-end test with sample data, in this order:**
  1. Plan a day; jobs are created.
  2. A train is placed with one coach removed.
  3. Tasks are done offline.
  4. One coach is rejected and recleaned; the checker signs.
  5. A staff-shortage penalty is applied.
  6. Usage and water are logged.
  7. Month end: bill, penalty statement, compliance pack and ESG report are produced.
  8. Each role's access is checked.

  Anything that fails gets fixed.

## Notes before starting
- Real-time photo stamping, signing by code and the phone push alerts use features already in the app. Phone codes still use the temporary "last 4 digits" sign-in until the SMS key is added.
- The map uses the Google Maps connection, which you'll be asked to approve in Phase 1.
- This is a very large build. I'll report after each phase with what you can try.

## Technical notes
- **New tables:** all `rail_*`, with the standard columns (`created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`), row-level security through `rail_can(module, action, scope)`, and `rail_audit_trail` triggers.
- **Reused tables:** inventory extends the existing `inv_*` tables with new columns. Equipment and PPE are new `rail_assets*` tables.
- **Scheduled jobs:** the 48-hour job generator, hourly penalty checks, daily deep-clean due list and alert checks run as database scheduled jobs.
- **Photos:** stored in a private bucket. Watermarking and the perceptual-hash fingerprint are done in a server function.
- **Offline:** the cleaner app uses an IndexedDB queue. The browser-installed app is registered only on the published site.
- **PDFs and Excel** (annexure, ESG report, compliance pack) are generated in the browser. The SHA-256 fingerprint is stored on the bill.
