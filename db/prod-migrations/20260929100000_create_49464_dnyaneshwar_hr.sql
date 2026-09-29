-- Create employee 49464 Dnyaneshwar Vitthal Suryawanshi (Manager Payroll)
-- with the same access as Shalini (48433): role_key 'hr', same home unit,
-- reporting to Atul Popat Katre (41497).

-- Designation "Manager Payroll" (create if missing)
INSERT INTO designations (id, name)
SELECT gen_random_uuid(), 'Manager Payroll'
WHERE NOT EXISTS (SELECT 1 FROM designations WHERE name = 'Manager Payroll');

INSERT INTO candidates (
  employee_code,
  full_name,
  mobile,
  email,
  gender,
  date_of_birth,
  marital_status,
  role_key,
  status,
  unit_id,
  designation_id,
  reports_to,
  permanent_address1,
  permanent_address2,
  permanent_city,
  permanent_state,
  permanent_pincode,
  present_address1,
  present_address2,
  present_city,
  present_state,
  present_pincode
)
SELECT
  '49464',
  'Dnyaneshwar Vitthal Suryawanshi',
  '8451800202',
  '49464@radiantguards.com',
  'male',
  DATE '1988-01-23',
  'married',
  'hr',
  'active',
  c.unit_id,
  d.id,
  c.reports_to,
  'Flat no 303, Sai Leela Building, Near Radhai Macchi Market',
  'Loni Kalbhor',
  'Pune City',
  'Maharashtra',
  '412201',
  'Flat no 303, Sai Leela Building, Near Radhai Macchi Market',
  'Loni Kalbhor',
  'Pune City',
  'Maharashtra',
  '412201'
FROM candidates c
CROSS JOIN designations d
WHERE c.employee_code = '48433'
  AND d.name = 'Manager Payroll'
  AND NOT EXISTS (SELECT 1 FROM candidates WHERE employee_code = '49464');
