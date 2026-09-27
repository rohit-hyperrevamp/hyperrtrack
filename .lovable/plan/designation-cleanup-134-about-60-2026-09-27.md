# Designation cleanup (134 → about 60)

## What the audit found
- 134 designations; 23 have nobody using them; about 60 have exactly one person.
- Office titles have the department baked into the name ("Assistant Manager - Payroll", "Executive - HR", "Manager - Accounts & Finance").
- There are duplicates and typos: "Bodyguard"/"Body Guard", "CIVIL Armed Gurad", "Asst Manager HR", "Sr. Executive", "EXC", "CCT", "CAHOT", "TSM (CAHOT)", "Facility Attendant F", "Surveillance More".
- Only 13 departments exist. Payroll, Finance and Compliance are missing.

## Rules
1. **Office staff:** designation = rank only; the area of work moves to Department.
   Ranks: Intern, Junior Executive, Executive, Senior Executive, Assistant Manager, Manager, Senior Manager, Assistant General Manager, Deputy General Manager, General Manager, Assistant Vice President, Vice President, Senior Vice President, Director, CEO, plus Branch Head, Regional Head, Head (of department).
2. **Site roles on client contracts** (Security Guard, Armed Guard, Lady Guard, CCTV Operator, Fireman, Facility Attendant, etc.) keep their names, because contracts and invoices bill by them. Only true duplicates and typos get merged.
3. Every merge moves employees, their site postings and contract lines to the surviving designation before the old one is deleted. Billable flags stay the same.

## Office mappings (examples, full list applied)
| Current | New designation | Department |
|---|---|---|
| Assistant Manager - Payroll | Assistant Manager | Payroll (new) |
| Manager - Payroll / Payroll & Compliance | Manager | Payroll |
| Executive - Payroll | Executive | Payroll |
| Account Executive / Accounts Executive / Executive Accounts | Executive | Accounts |
| Accounts - Intern | Intern | Accounts |
| Billing Executive / Assistant Billing Executive | Executive / Junior Executive | Accounts |
| Manager - Accounts & Finance | Manager | Finance (new) |
| AGM - Account & Finance | Assistant General Manager | Finance |
| Executive - HR, Senior/Junior HR Executive, Senior Executive - HR | Executive / Senior / Junior Executive | HR |
| Asst Manager HR | Assistant Manager | HR |
| Manager - HR & Compliance | Manager | Compliance (new) |
| HR Head | Head | HR |
| Manager - Training | Manager | Training |
| Operations Manager, AM/AGM/DGM - Operations, Ops. & Training Manager, Operations Executive | matching rank | Operations |
| Assistant Manager - Operations & Marketing, Senior Executive - Sales | Assistant Manager / Senior Executive | Sales & Marketing |
| Senior Manager - Admin | Senior Manager | Admin |
| Head - Control Center, Lead Control, Control/Control Room/Senior Control Executive | Head / Executive / Senior Executive | Control Center |
| Legal Officer | Executive | Legal |
| Regional Head (AP & Telangana) | Regional Head | Operations |
| Sr. Executive, EXC | Senior Executive / Executive | kept as-is (existing department) |

## Site-role merges
- Body Guard → Bodyguard; CIVIL Armed Gurad → Armed Guard; Facility Attendant F → Facility Attendant; CCT → CCTV Operator; Surveillance More → Surveillance Executive; CAHOT and TSM (CAHOT) → Trust & Safety Manager; Data Entry Operator → Computer Operator.
- Field Officer, Senior Field Officer and Assistant Field Officer stay (the app uses them for Field Officer rules).
- Unused designations that no contract uses are deleted. Unused ones still on a contract are kept.

## Checks before applying
- I will send the final list (person → new designation + department) for any unclear title, such as EXC, CAHOT, Assignment Manager, Operations Consultant, before running anything.
- Saved backup of all old designations and assignments.

## Technical details
- One production migration under db/prod-migrations/: insert Payroll/Finance/Compliance into departments; set candidates.department_id; remap candidates/candidate_units/candidate_designations/contract_resources designation_id; delete orphaned designations.
- Check the app's designation-name keyword rules (Field Officer / guard matching in src/lib/attendance.ts and role logic) so renamed titles do not change who counts as billable.
- Log the change through activity logging under "Designation Manager".
