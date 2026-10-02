# HyperTrack: audit, gap fixes and product upgrade

## 1. Create the missing pay structure (you said "create it yourself")
- Set up a default salary structure for each rail role: Cleaner, Senior Cleaner, Supervisor, Checker, Depot Manager.
- Each role gets Basic + DA, HRA, bonus and uniform from the existing formula masters, plus PF, ESIC, PT and LWF deductions and the employer contributions.
- Use clearly labelled **placeholder** minimum wages (Maharashtra unskilled/semi-skilled/skilled). You replace them with the official 1 Oct 2026 notification later.
- Link each depot to a payroll site, and each rail worker to an employee record, so attendance feeds payroll and invoices automatically.
- Set staff-required counts for each depot and shift so the side panel shows real gaps instead of 0.

## 2. Find and fix loopholes
- **Login:** replace the test "last 4 digits" code with real SMS codes, behind a switch. Add limits on code attempts and lock out after repeated failures.
- **Data access:** work through the ~94 critical security findings. Lock down old tables that are open too widely, and confirm workers can only see their own pay and tasks.
- **Process gaps:**
  - Nobody can approve their own penalty, bill or purchase.
  - A task can't be marked done without a photo and an accepted assignment.
  - A bill can't be issued twice for the same month.
  - Wages can't be paid below the minimum.
  - Attendance can't be dated in the future.
- **Data quality:** enforce the required fields shown on each form at save time too. Block duplicate trains and coaches, and keep a full audit trail for every change.
- Write a findings report: each issue, how serious it is, and whether it's fixed.

## 3. Smarter product
- **Morning briefing** on the Command Centre: "3 trains late, 2 depots short-staffed, 1 bill awaiting sign-off", each with a one-tap action.
- **Auto-assign:** suggest the best free cleaner for each task based on depot, shift, skill and workload. The manager approves in one tap.
- **Predictive alerts:** warn about likely stock-outs (from usage rate), expiring compliance documents, rising penalties at a depot, and a falling cleanliness score.
- **Trust score trend** for each depot and cleaner, with the reasons shown.
- **Bulk actions** on lists (assign, approve, export) and saved filters.

## 4. Easier for each role
- **Cleaner phone app:** one big "Next task" card, then Accept, Photo and Done. Voice-friendly Hindi/English labels, works offline with automatic sync.
- **Supervisor view:** team totals, who is idle or late, and reassign by drag or tap. This was the open item from last time.
- **Undo** after delete or approve, keyboard shortcuts, and helpful empty states everywhere.
- **Coach-order editor** (drag to reorder) and a real depot map.

## 5. Re-audit and report
- Run the full day-to-month-end flow again with the sample data: assign, accept, inspect, penalise, bill, payroll, profit.
- Check every page on desktop and phone.
- Update the PDF guide with the new features and a short "industry-standard checklist" showing what is done and what is still pending.

## Needs you later
- The real minimum wage values.
- Contract rates and penalty amounts.
- An SMS provider key.
- Publishing, so the live site can be checked.

## Technical notes
- Pay structures go in `allowance_types`, `cost_components` and contract lines. Mapping uses `rail_locations.unit_id` and `rail_people.candidate_id`. Staffing uses `rail_deployment_norms`.
- New rules are enforced through triggers and `rail_can` checks in the database, not in the UI.
- Auto-assign and briefing use security-definer RPCs. AI wording goes through the existing gateway.
- Activity logging is included for every new admin action.
