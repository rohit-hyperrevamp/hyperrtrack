# HyperTrack roadmap

- [x] Explain the current Supplies and Resources accounting flow to the user, including whether cleaner task completion actually decrements stock and how usage is logged. Current stock depletion on issue/usage is not implemented.
- [ ] Reconcile actual cleaner consumption, kit returns and batch stock with an authorized, auditable decrement flow; currently job norms only estimate consumption and kit issue does not deduct stock (blocked by unavailable production connection).
- [x] Integrate camera and advisory cleanliness score directly into My Day task completion: show score/retake before completing, remove standalone Photo Check navigation and redirect its old URL. Private evidence upload still awaits a production bucket.
- [x] Remove dummy cleaner Overview tiles and redirect cleaner Overview to My Day; preserve existing Profile/photo and Notifications. Other role home refinements remain pending.
- [ ] Combine Candidate and Team into one People navigation entry: new and returning applicants stay Candidates until approved; onboarded people appear in Team. Remove interview/opening recruitment surfaces from that entry.
- [ ] Align contextual top-bar date selectors and filters in Resources, Supplies, Finance & Payroll and Billing; move Recruitment and Attendance filters into the top space and avoid crowded controls on narrow screens.
- [ ] Require task-linked after-cleaning photos and AI scores with private retained history, supervisor review and worker feedback; secure database/storage and live verification are blocked by the unavailable production connection.

- [ ] Soften rail summary tiles across pages, remove colored edge stripes, use solid circular icons with white glyphs; move page search/filters into the shared contextual top bar without duplicating controls.
- [ ] Align the Operations coach-detail section, repair cleaner selector arrow and empty cleaner list, and explain job/task statuses and the complete operations workflow. Selector now uses the location- and permission-checked cleaner recommendations, with loading/error/empty states; live authenticated verification remains blocked by the unavailable production connection.
- [x] Scope Photo Check choices and submission to the signed-in cleaner's assigned coaches, while allowing authorized managers and super admins to choose a depot, train and coach; make the dashboard's colored tiles restrained and professional. Authenticated live visual verification remains unavailable because the production page returns 404.
- [ ] Fix mobile Finance & Payroll density, payslip estimate feedback and worker selector; mobile Operations/Quality overlap; overview control; More background; dark overlays; show available staff photos without inventing real employee portraits; deliver an updated illustrated workflow PDF.
- [ ] Trace Quality penalties from proposal to confirmation, bill and finance; make ledger status and destination explicit without treating railway penalties as automatic employee payroll deductions.
- [ ] Simplify Recruitment into intake → review → onboard → document-completion, preserve private uploads and show outstanding documents on the worker's own dashboard.
- [ ] Add Aadhaar/PAN numbers and photo to candidate intake with verified private storage and record-level permissions; create the approved worker/payroll link in the production database. Position/designation now select independently of openings and the candidate screen shows matching pay structure, but no automatic payroll assignment is claimed (production connection remains unavailable).
- [x] Apply bright blue, green, red and yellow semantic tile accents to shared rail summaries, including Quality and Supplies; keep text readable on yellow.

- [x] Color the seven-day cleaning graph by completed jobs against planned jobs (green ≥90%, blue 60–89%, red below 60%) and give colored dashboard tiles and selected controls restrained gradients.

- [ ] Finish Recruitment intake fields for Aadhaar, PAN, address, dates, role, location and private documents once the production database connection is available; never put identity numbers in notes or general candidate fields.
- [ ] Verify the revised Recruitment and Operations screens on the authenticated live site; the current production database URL is a placeholder.

- [x] Scope task assignment to authorized managers and cleaner acceptance to the assignee, hide My Shift from super admins, and use full-width layout (authenticated UI test pending)
- [x] Insert labelled 30-day synthetic cleaning history into the connected production database: 90 jobs, 360 coaches, 1,440 tasks, 360 inspections, 600 resource readings, 1,800 supply entries and 90 attendance records
- [ ] Verify every graph and form with authenticated manager, checker and cleaner accounts; local authenticated routes redirect to login and the limited database role cannot call rail_kpis
- [x] Deliver a concise PDF guide to every rail section and a truthful test report
- [x] Rebuild phone dock and header as circular controls; optimize mobile Photo Check, tables, form spacing, and restore Configuration Hub label (authenticated mobile visual review unavailable)
- [x] Use the HyperTrack train symbol as favicon, remove visible Lovable branding, move View as User below Activity Log, and remove today's shift dock card (service identifiers retained for integrations)
- [x] Separate dock brand and account controls; replace text-like HT badge with a recognizable symbol and make search a centered slide-down panel without an overlay (live rail visual verification awaits publication)
- [x] Align colored dashboard tiles to white text/icons, refresh bright status colors, notifications, dialogs and dark dock; simplify global rail navigation labels (authenticated visual comparison still pending)
- [x] Surface existing activity logs for super admins and confirm sign-in/out and rail edits are captured in code and migrations; production verification blocked by placeholder database connection
- [x] Center rail search; unify simple centered rail forms and Live Board coach review; switch dock to white and remove footer dividers; replace yellow/dull KPI colors with blue, black, white, red and selective green
- [x] Refine expanded dock icon visibility and selected state, remove brown accents, rebuild Configuration Hub as rectangular catalog, and add depot-aware filters to rail pages
- [x] Replace green dashboard/rail KPI accents with blue, red and yellow; redesign Live Board as a color-coded, filterable job list instead of hard-to-read timeline bars
- [x] Replace Command Centre's pale, striped tiles with strong solid blue, charcoal and yellow feature cards plus status-aware colored icons; show the train-film tagline on the login screen at desktop and mobile sizes
- [x] Refine login input and left-side copy, replace train film with 1080p footage, align collapsed dock and Command Centre cards, add focused drop-down search, and center rail/recruitment entry panels with mobile-fit spacing
- [ ] Extend staged entry to every complex form beyond People and multi-field Configuration Hub masters; verify authenticated visual flows on the live site after publication
- [x] Rename Rail Settings to Configuration Hub; redesign its master catalog and add role creation, permission editing, page-aware navigation, circular icons and glass editors (production verification blocked by unavailable production database connection)
- [x] Redesign splash with percentage loader and login with rail film, frosted white phone/OTP steps, and staggered welcome-to-workspace transition
- [x] Remove repeated notification, account and theme controls; replace the top-right red unread badge with a blue dot; make collapsed dock icons neutral until selected, selected icons blue with white symbols, and dock icons circular; simplify My Profile and keep its content full-width
- [ ] (in review) Match the uploaded Fingoals reference across HyperTrack, updated to the requested full-screen canvas: circular blue sidebar brand and icons, consistent rounded bento cards with blue/green/red/yellow accents, top controls and chart textures on all devices; review against the reference (live authenticated comparison blocked until publication)
- [x] Make dock icons identifiable by color, align and strengthen the wordmark, use Apple system typography, and redesign role-relevant rail dashboards
- [x] Refresh solid-black navigation, semantic colored tiles/icons, Depot map, Rail Settings categories, and shared rail screens across devices
- [x] HyperTrack identity, rail-only navigation and Industrial Precision shared styling
- [x] Direct rail dock destinations, HT circular compact identity, and legacy dashboard redirect for rail accounts
- [ ] Verify the new dock and dashboard on the live site after publication (blocked until the updated site is published)
- [x] Unify HyperTrack wordmark, splash, full-width rail workspace, dashboard spacing, and shared Apple-inspired controls
- [x] Normalize rail colors, corners, icons, glass surfaces and motion across the workspace
- [x] Apply the HyperTrack blue, white, charcoal and neutral palette to legacy status colors and shared tiles; simplify command-centre exceptions and refine mobile dock and overlays
- [ ] Review the updated authenticated screens on the live site (blocked until publication)

- [x] Phase 1: masters, Settings hub, scoped access, audit trail, sample data, AI photo check
- [x] Phase 2: day planning, rake placement, tasks, offline cleaner app, live board
- [x] Phase 3: checker review, rework, penalties, complaints, alerts, trust score
- [x] Phase 4: consumables, kit issue, norms, variance, purchase → GRN, assets, custody, maintenance, PPE
- [x] Phase 5: meters, resource ledger, sustainability dashboard, ESG report
- [x] Phase 6: monthly bill, annexure, checker OTP sign, compliance pack, wage floor
- [x] Phase 7: command centre, depot/checker/cleaner views, scorecards, Ctrl+K
- [x] End-to-end test script (37/37 passing)
- [ ] Real contract rates, penalties and 1 Oct 2026 wage rates (waiting on user)
- [ ] Real SMS OTP (waiting on SMS provider key; test mode uses last 4 digits)
- [ ] Not done yet: coach-order editor, multilingual offline install, undo toasts
- [x] Overview side panel on every rail page (place filter, required vs present staff, page-specific figures), simpler Resources page, My Pay, Profit view, and People & Pay links in the sidebar
- [ ] Link each depot to a site and each rail worker to an employee record so rail attendance flows into the formal payroll register (waiting on real mapping and salary data)
- [x] Overview panel on extreme right; dock grouped by category, most-used first, no duplicate links
- [x] Remove separate Employees link (Team covers it); Rehire/onboard/offboard under People; salary parts/deductions/contributions/payroll/invoices under one Finance page
- [ ] Attendance on sign-in prompt for workers; fix dropdown arrow alignment

- [x] Command Centre (super admin + leadership only): half-circle gauges for chemical stock vs capacity, chemical and water use per coach vs norm, water saved
- [x] Kits: issue to a person at the chosen store, items from that store only, return dialog that puts stock back
- [ ] Record verified starting quantities and historical chemical consumption for VIOARR products. Blocked: production database connection is a placeholder, and no source quantities, dated receipts or usage records were supplied; do not fabricate inventory or emissions.
- [x] Show chemical products even before first use, flag low stock, add leadership chemical/CO₂e gauges and segmented gradient D gauges without pointers, and stripe filled dashboard bars.
