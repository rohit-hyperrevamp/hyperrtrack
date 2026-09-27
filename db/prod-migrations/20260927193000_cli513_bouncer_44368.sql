-- CLI513 Thane Urban (CON14432): add Bouncer line at ₹38,869.49 and move 44368 onto it.
CREATE TABLE IF NOT EXISTS _bkp_cli513_bouncer_20260927 AS
SELECT 'candidate_unit' src, id::text row_id, designation_id::text old_designation_id FROM candidate_units
 WHERE candidate_id='72e7f6cd-4909-419b-9b45-44f6e1212e9c' AND unit_id='9531a17b-9031-4c64-8c16-c8d8d35e32b9'
UNION ALL
SELECT 'attendance_entry', id::text, designation_id::text FROM attendance_entries
 WHERE candidate_id='72e7f6cd-4909-419b-9b45-44f6e1212e9c' AND unit_id='9531a17b-9031-4c64-8c16-c8d8d35e32b9';

INSERT INTO contract_resources (contract_id, designation_id, service_type_id, quantity, components, gross,
  sort_order, payroll_day_base_id, benefits, deductions, employer_contributions, role_key, shift_hours, billing_day_base_id)
SELECT contract_id, '0ec2821e-3d7a-47d5-b68c-d6e4daf378b4', service_type_id, 1, components, gross,
  sort_order + 1, payroll_day_base_id, benefits, deductions,
  (SELECT jsonb_agg(CASE WHEN e->>'costComponentId'='baf10000-0001-4001-8001-000000000004'
            THEN jsonb_set(e,'{amount}','5459.72'::jsonb) ELSE e END ORDER BY ord)
     FROM jsonb_array_elements(employer_contributions) WITH ORDINALITY t(e,ord))
  || '[{"name": "Bouncer Skill Allowance", "state": "N/A", "amount": 4000.0, "calcType": "fixed", "capAmount": null, "percentage": 0.0, "formulaMode": "preset", "capFlatAmount": null, "baseComponents": [], "formulaVersion": 1, "costComponentId": "cc990000-0001-4001-8001-000000000001", "fixedCalcMethod": "flat", "fixedDutyDivisor": null, "deductionCalcType": "fixed_amount", "formulaExpression": null, "fixedDutyComponents": []}]'::jsonb,
  NULL, shift_hours, billing_day_base_id
FROM contract_resources WHERE id='6a3a2c78-e4b3-42e7-a5bf-cff5cb3dcdcc';

UPDATE candidate_units SET designation_id='0ec2821e-3d7a-47d5-b68c-d6e4daf378b4'
 WHERE candidate_id='72e7f6cd-4909-419b-9b45-44f6e1212e9c' AND unit_id='9531a17b-9031-4c64-8c16-c8d8d35e32b9';
UPDATE attendance_entries SET designation_id='0ec2821e-3d7a-47d5-b68c-d6e4daf378b4'
 WHERE candidate_id='72e7f6cd-4909-419b-9b45-44f6e1212e9c' AND unit_id='9531a17b-9031-4c64-8c16-c8d8d35e32b9';
