-- CLI511 Mumbai Unit-1 (CON14430): add Bouncer line (₹38,869.49, same card as CLI513) and put 44353 on it.
BEGIN;
CREATE TABLE IF NOT EXISTS _bkp_cli511_bouncer_20260927 AS
SELECT 'candidate_unit' src, id::text row_id, designation_id::text old_designation_id FROM candidate_units
 WHERE candidate_id='87522125-0fe8-4de0-baf5-ac0528f77fe9' AND unit_id='f3a705ad-e219-4dc8-8054-6a13338f1911'
UNION ALL
SELECT 'attendance_entry', id::text, designation_id::text FROM attendance_entries
 WHERE candidate_id='87522125-0fe8-4de0-baf5-ac0528f77fe9' AND unit_id='f3a705ad-e219-4dc8-8054-6a13338f1911';

INSERT INTO contract_resources (contract_id, designation_id, service_type_id, quantity, components, gross,
  sort_order, payroll_day_base_id, benefits, deductions, employer_contributions, role_key, shift_hours, billing_day_base_id)
SELECT '14fedb42-a7ba-4c3a-8e76-716409a811d2', b.designation_id, s.service_type_id, 1, b.components, b.gross,
  s.sort_order + 1, s.payroll_day_base_id, b.benefits, b.deductions, b.employer_contributions, NULL, s.shift_hours, s.billing_day_base_id
FROM contract_resources b, contract_resources s
WHERE b.id='413a404f-e4c5-4a74-9cec-1fbcff3bcbef' AND s.id='fb81f01f-14ea-494c-bec7-af7f4ceb71e2'
  AND NOT EXISTS (SELECT 1 FROM contract_resources WHERE contract_id='14fedb42-a7ba-4c3a-8e76-716409a811d2' AND designation_id=b.designation_id);

UPDATE candidate_units SET designation_id='0ec2821e-3d7a-47d5-b68c-d6e4daf378b4', updated_at=now()
 WHERE candidate_id='87522125-0fe8-4de0-baf5-ac0528f77fe9' AND unit_id='f3a705ad-e219-4dc8-8054-6a13338f1911';
UPDATE attendance_entries SET designation_id='0ec2821e-3d7a-47d5-b68c-d6e4daf378b4'
 WHERE candidate_id='87522125-0fe8-4de0-baf5-ac0528f77fe9' AND unit_id='f3a705ad-e219-4dc8-8054-6a13338f1911';
COMMIT;
