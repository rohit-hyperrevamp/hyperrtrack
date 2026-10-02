# Rail Clean: turning the portal into a train-cleaning operations system

## Part 1: How train cleaning works in Indian Railways (research)

**Who pays and who checks.** The work is given out by the railway's Mechanical (Carriage & Wagon) department. Each division puts out tenders on GeM, usually for 3 to 4 years, and pays the contractor per coach cleaned or per day. Railway supervisors check the work, and money is cut for poor work under the General Conditions of Contract 2018. Examples: Gomti Nagar depot, 4 years, about Rs 16.4 crore; Delhi passing-train cleaning, 1,461 days, about Rs 22 crore.

**Where cleaning happens**
| Place | What it is | Typical work |
|---|---|---|
| Coaching depot, washing pit line | The "dock". A rake (full train set) stands on a pit line between trips, usually for 4 to 6 hours | Full mechanised clean: outside wash (with a washing plant, ACWP, or by hand), inside, toilets, filling water |
| Platform at the end station ("platform return" / terminal attention) | Trains that turn round at the platform instead of going to the depot | Inside and toilet cleaning, filling water, in a short time slot |
| Clean Train Station (CTS) | Trains passing through a chosen station, usually 06:00 to 22:00 | Quick toilet, doorway and vestibule cleaning plus garbage pick-up, done during the halt (5 to 15 minutes) |
| On-Board Housekeeping (OBHS) | Staff travelling on long-distance trains | Cleaning toilets and aisles during the journey, answering passenger requests (Coach Mitra / Rail Madad), pest control |
| Depot premises | The depot yard and buildings | Daily sweeping, garbage removal, disinfection |

**Types of cleaning (each is priced separately)**
- **Normal mechanised clean:** outside and inside, with or without the washing plant.
- **Intensive clean:** a deep clean on a set schedule (for example every 15 to 30 days, or at set kilometres). Covers seats, berths, panels, under-frame, toilets with chemicals, and pest and rodent control.
- **Inside-only:** dry and wet cleaning.
- **Supplies:** toilet supplies for AC coaches, loading bedding (linen).
- **Other:** filling coach water tanks, garbage disposal by tractor trolley, cleaning bio-toilets.

**Staff roles:** Project Manager, Depot or Site Supervisor (one per shift), Pit Line In-charge, cleaners (outside, inside, toilet), washing plant operator, water-filling staff, OBHS janitors travelling on trains, pest-control technician, store keeper, and the railway's checking officer (SSE/C&W, a client-side user).

**Proof the railway asks for:** a cleaning record for each coach (coach number, time, staff, before and after photos), an attendance register of staff actually present, monthly chemical and supply use, passenger feedback scores (OBHS), and a joint check with the railway that ends in a monthly certified bill minus penalties.

Sources: Gomti Nagar depot tender (GeM 2026); Delhi Clean Train Station tender (GeM 2025); Katni Clean Train Station tender (GeM 2025); Railway Board OBHS guidelines, 2016; IRIMEE notes on OBHS and Clean Train Station; Samastipur, Mysore and Raipur tenders (2025–26).

## Part 2: How the portal changes

### Existing screens, renamed for railways
| Today | Becomes |
|---|---|
| Organizations (clients) | Railway zones and divisions (for example NER, Lucknow Division) |
| Units (sites) | Depots, stations, OBHS train sets |
| Client contracts + rate lines | Tender / Letter of Acceptance with a schedule of rates: each cleaning type, rate per coach or per day, coaches expected per day, contract value, penalty rules |
| Designations | Supervisor, cleaners (outside, inside, toilet), washing plant operator, water staff, OBHS janitor, and the other roles above |
| Attendance, payroll, invoices | Kept, with railway wage rules added (see "Automation") |
| Inventory | Chemicals, cleaning tools, toilet supplies, uniforms, washing plant spares |
| Vehicles | Garbage tractors, water tankers |

Security-only items are hidden: guard posting orders, ex-servicemen, security-specific forms.

### New railway modules
1. **Masters:** trains (number, name, how many coaches, which depot looks after them), the coach list (coach number, type: SL, 3A, 2A, 1A, GS, pantry), pit lines at each depot, platforms, intensive-cleaning schedules.
2. **Today's Board** (the main screen): one card per pit line or platform showing the train there, its status (Expected → Placed → Cleaning → Checking → Done / Rejected), time left before it must leave, and the team assigned. It refreshes on its own.
3. **Train Cleaning Jobs:** created automatically each day from train timings. Each job is split into coach-by-coach tasks for the outside, inside, toilets and water. The supervisor assigns the team in one tap.
4. **Mobile task view for cleaners:** "My tasks today" lists the train, coach and work to do. The cleaner takes a photo before and after, ticks the checklist (toilets, floor, berths, windows, dustbin), and marks the task done. It also works with a weak signal.
5. **Checking and penalties:** the supervisor or railway checker opens a coach, scores it (for example out of 10), and approves or sends it back for re-cleaning. Penalty rules from the contract are applied automatically.
6. **Intensive cleaning planner:** marks coaches due for a deep clean based on the date or kilometres since their last one.
7. **Clean Train Station and OBHS logs:** quick entries for each train that stops, and passenger complaints with how fast each was resolved.
8. **Supplies use:** chemicals and supplies used per job, taken from inventory.
9. **Railway bill:** coaches cleaned × rate for each cleaning type, minus penalties, plus GST. Comes with a coach-wise attachment the railway checker can confirm.
10. **Dashboards**
    - Management: trains cleaned, pending and in progress today, by depot.
    - Depot: pit line timeline and staff on shift.
    - Railway checker: read-only, sign-off.
    - Cleaner: "My work".

### Automation
- Daily cleaning jobs are created automatically from train timings and the intensive schedule.
- Alerts when a train arrives, when a job is late, or when a coach is sent back for re-cleaning.
- Attendance comes from shift check-in with selfie and location (already built), linked to the tasks each person did.
- Payroll keeps the existing wage formulas. It adds central-sphere minimum wage rates by area (A/B/C) and skill, and the dearness allowance (VDA) revised twice a year (April and October), with EPF and ESIC. This is a compliance requirement for railway contracts.
- The monthly bill and the penalty statement are produced automatically.

### Who sees what (permissions, data-driven)
- Super Admin / Project Head: everything.
- Depot Manager: their depots.
- Supervisor: their shift and pit lines; assigns and checks work.
- Cleaner / Janitor: only their own tasks, attendance and payslip.
- Railway Checker (outside login): read and certify only.
- HR / Payroll / Accounts: as today.

## Part 3: Build phases
1. Masters, the new naming, and roles.
2. Today's Board, cleaning jobs and the mobile cleaner view.
3. Checking, penalties and intensive cleaning.
4. Railway billing, supplies use, Clean Train Station and OBHS.
5. Railway wage rules, dashboards, and a full end-to-end test.

Each phase is finished and tested before the next one starts.

## Build rules (your brief, applied to every phase)
1. **Cleaning Event at the centre:** one train, at one place, in one time window, needing one service. The services are pit-line full clean, platform return, Clean Train Station halt, OBHS trip, intensive clean, premises, water filling, or a custom one. Tasks, photos, checks, penalties, supplies used, sustainability figures and billing all attach to an event.
2. **Nothing fixed in the code:** coach types, checklists, rates, penalties, wages, shifts, norms, emission factors, labels, alert rules, reason codes and roles are all editable in Settings. Rates, penalties, wages, norms and factors have start and end dates, and old values are never overwritten.
3. **Full history:** every new record can be traced to who created or changed it and when. Deleting only hides a record. Every change is written to the activity log and to a separate history that can never be edited.
4. **Access control:** a permission is a role, a module and an action (view, create, edit, delete, approve, export, configure). Each person also has a data scope: all, zone, division, contract, depot, line or shift, or only their own records. The database enforces this, not just the screens.
5. **Existing data stays:** organisations, sites, employees, attendance, payroll, invoices, inventory and vehicles stay as they are. Only the names users see change, through a label list. Security-company features (guard posting orders, ex-servicemen forms) are hidden by an on/off switch.
6. **Design: a calm, dark "control room".**
   - Colours: background #0B0F14, panels #121821, borders #1F2833, text #E6EDF3, teal #2DD4BF for actions.
   - Status colours: green #22C55E done, sky #38BDF8 active, amber #F59E0B waiting, red #EF4444 problem, lime #84CC16 for sustainability only. Status is always shown with an icon or word too, never colour alone.
   - Light theme to match. Inter for text; JetBrains Mono with even-width digits for train numbers, coach numbers and figures.
   - Layout: 8px spacing grid, 12px rounded corners, thin borders, no heavy shadows. Left icon menu, a top bar for contract / depot / date / shift, and a Ctrl+K quick search.
7. **Cleaner phone app:**
   - Installs from the browser and keeps working offline; changes sync when the signal returns.
   - Light theme by default, large 56px buttons, mostly icons.
   - Hindi, Marathi and English.
8. **Dashboards:** every number can be clicked to open the records behind it.
9. **Lists and masters:**
   - Every list has search, filters, saved views, and CSV/Excel export.
   - Every master list can be imported from CSV/Excel, with a preview and checks before saving.

## Questions to confirm before Phase 1
- Which contract types the client runs: depot pit line, platform return, Clean Train Station, OBHS, or all of them.
- How they are paid: per coach, per day, or a lump sum. Also a sample rate schedule and penalty schedule from their Letter of Acceptance.
- Whether the railway checker should get a login.

## Technical notes
- **Event model:** `rail_cleaning_events` (train, location, time window, `service_type_id`) is the parent of `rail_event_tasks`, `rail_task_photos`, `rail_inspections`, `rail_penalties`, `rail_consumption`, `rail_sustainability` and `rail_bill_lines`.
- **Masters:**
  - Trains and coaches: `rail_trains`, `rail_coaches`, `rail_coach_types`
  - Locations: `rail_locations` (pit line / platform / station)
  - Service setup: `rail_service_types`, `rail_checklists`
  - Dated values: `rail_rates`, `rail_penalty_rules`, `rail_norms`, `rail_emission_factors`
  - Operations setup: `rail_shifts`, `rail_alert_rules`, `rail_reason_codes`
  - Display and switches: `rail_labels`, `rail_feature_flags`
- **Columns on every table:** `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`. Every table has row-level security.
- **History:** `rail_audit_trail` is filled by database triggers and is append-only.
- **Access:**
  - A new `rail_permissions` table (role × module × action) uses the full action set; the existing `role_permissions` table stays for the older modules.
  - `rail_user_scopes` stores each person's data scope. A single helper `rail_can(module, action, scope_id)` is used in every policy.
- **Offline app:** the browser-installed app is the cleaner's offline mode. It never runs inside the editor preview.
- **Change log:** `logActivity` is called on every save.
