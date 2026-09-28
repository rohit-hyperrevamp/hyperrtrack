-- Poonawalla Fincorp: recreate one client + one site (Mavdi Road, Rajkot) from
-- PFL_ATTENDENCE_SHEET_SEPTEMBER_2026_1.xlsx, sheet "1 SEPTEMBER 2026", data row 2.
-- Guard: Girish Sadhu (sheet Emp Id 42359, mobile 9723263161) — see open question:
-- that mobile already belongs to Girishkumar Premdas Rathod (45992).
-- FO: Vasant Parmar (mobile 8956437324) — not in system yet.
-- Contract rate: PENDING user confirmation.

BEGIN;

-- 1. Client (organization)
INSERT INTO customers (id, code, name, status, industry_type, created_at, updated_at)
VALUES (gen_random_uuid(), 'ORG387', 'Poonawalla Fincorp Ltd', 'active', 'NBFC', now(), now());

-- 2. Site: Mavdi Road, Rajkot, Gujarat (PUID P000003)
INSERT INTO units (id, code, name, customer_id, status, client_address, client_city, client_district, client_state, created_at, updated_at)
SELECT gen_random_uuid(), 'CLI9938', 'Poonawalla Fincorp - Mavdi Road, Rajkot', c.id, 'active',
       'Mavdi Road', 'Rajkot', 'Rajkot', 'Gujarat', now(), now()
FROM customers c WHERE c.code = 'ORG387';

-- 3. Contract on 21-to-20 payroll window, 1 Security Guard post, 8 hours
--    Rate: PENDING — fill from user confirmation before applying.
INSERT INTO client_contracts (id, contract_code, unit_id, start_date, end_date, payroll_window_id, status, approval_status, created_at, updated_at)
SELECT gen_random_uuid(), 'CON16229', u.id, '2026-08-21', '2027-08-20',
       '5e900b36-3cca-4137-a923-57bfe7910641', 'active', 'approved', now(), now()
FROM units u WHERE u.code = 'CLI9938';

COMMIT;
