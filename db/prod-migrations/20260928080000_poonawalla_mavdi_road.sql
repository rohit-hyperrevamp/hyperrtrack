-- Poonawalla Fincorp: one client + one site (Mavdi Road, Rajkot) from
-- PFL_ATTENDENCE_SHEET_SEPTEMBER_2026_1.xlsx, sheet "1 SEPTEMBER 2026", data row 2.
-- Guard: Girish Sadhu, Emp ID 42359 (new — mobile 9723263161 in sheet collides with
-- 45992 Girishkumar Premdas Rathod, so mobile left blank on the new record).
-- FO: Vasant Parmar, new Emp ID 49504, home unit UN1 (Radiant Pune).
-- Contract CON16229: 1 Security Guard, 8h, Gujarat Zone I Urban rate 22,925.25/mo,
-- rate card copied from CON16082's guard line; 21-to-20 payroll window.

BEGIN;

CREATE TABLE IF NOT EXISTS _bkp_poonawalla_mavdi_20260928 AS SELECT NULL::text AS note WHERE false;

-- 1. Client
INSERT INTO customers (id, code, name, status, industry_type, created_at, updated_at)
VALUES (gen_random_uuid(), 'ORG387', 'Poonawalla Fincorp Ltd', 'active', 'NBFC', now(), now());

-- 2. Site (PUID P000003, Mavdi Road, Rajkot)
INSERT INTO units (id, code, name, customer_id, status, client_address, client_city, client_district, client_state, created_at, updated_at)
SELECT gen_random_uuid(), 'CLI9938', 'Poonawalla Fincorp - Mavdi Road, Rajkot', c.id, 'active',
       'Mavdi Road', 'Rajkot', 'Rajkot', 'Gujarat', now(), now()
FROM customers c WHERE c.code = 'ORG387';

-- 3. Contract on 21-to-20 payroll window
INSERT INTO client_contracts (id, contract_code, unit_id, start_date, end_date, payroll_window_id, status, approval_status, created_at, updated_at)
SELECT gen_random_uuid(), 'CON16229', u.id, '2026-08-21'::date, '2027-08-20'::date,
       '5e900b36-3cca-4137-a923-57bfe7910641', 'active', 'approved', now(), now()
FROM units u WHERE u.code = 'CLI9938';

-- 4. Contract line: copy the Gujarat Zone I Urban guard rate card from CON16082
INSERT INTO contract_resources (id, contract_id, designation_id, service_type_id, quantity, components, gross, sort_order, benefits, deductions, employer_contributions, role_key, shift_hours, payroll_day_base_id, billing_day_base_id, created_at, updated_at)
SELECT gen_random_uuid(), nc.id, cr.designation_id, cr.service_type_id, cr.quantity, cr.components, cr.gross, cr.sort_order, cr.benefits, cr.deductions, cr.employer_contributions, cr.role_key, cr.shift_hours, cr.payroll_day_base_id, cr.billing_day_base_id, now(), now()
FROM contract_resources cr
JOIN client_contracts oc ON oc.id = cr.contract_id AND oc.contract_code = 'CON16082'
CROSS JOIN client_contracts nc
WHERE nc.contract_code = 'CON16229'
  AND cr.designation_id = 'aad77ba7-98d2-44cb-a0f1-b598eed740f4'
LIMIT 1;

-- 5. Guard: Girish Sadhu, Emp ID 42359, Security Guard, primary unit CLI9938
INSERT INTO candidates (id, employee_code, full_name, status, designation_id, unit_id, preferred_joining_date, created_at, updated_at)
SELECT gen_random_uuid(), '42359', 'Girish Sadhu', 'active',
       'aad77ba7-98d2-44cb-a0f1-b598eed740f4', u.id, '2025-04-10'::date, now(), now()
FROM units u WHERE u.code = 'CLI9938';

INSERT INTO candidate_units (id, candidate_id, unit_id, is_primary, is_reliever, designation_id, shift_hours, sort_order, created_at, updated_at)
SELECT gen_random_uuid(), c.id, u.id, true, false, 'aad77ba7-98d2-44cb-a0f1-b598eed740f4', 8, 0, now(), now()
FROM candidates c, units u
WHERE c.employee_code = '42359' AND u.code = 'CLI9938';

-- 6. Field Officer: Vasant Parmar, Emp ID 49504, home UN1, assigned to CLI9938
INSERT INTO candidates (id, employee_code, full_name, mobile, status, designation_id, unit_id, created_at, updated_at)
VALUES (gen_random_uuid(), '49504', 'Vasant Parmar', '8956437324', 'active',
        '2f8ee013-4d76-4745-b30b-aac94e2b65d5', '0889cfb4-7fd6-44b4-bbac-7d7026e33f0f', now(), now());

INSERT INTO candidate_units (id, candidate_id, unit_id, is_primary, is_reliever, designation_id, sort_order, created_at, updated_at)
SELECT gen_random_uuid(), c.id, u.id, false, false, '2f8ee013-4d76-4745-b30b-aac94e2b65d5', 0, now(), now()
FROM candidates c, units u
WHERE c.employee_code = '49504' AND u.code = 'CLI9938';

COMMIT;
