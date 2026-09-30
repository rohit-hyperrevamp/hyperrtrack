-- Reliever / management fee on CON16179 and CON16180 were saved on Gross only
-- (editor missed "total_ctc"). Total CTC = 17000 gross + 1950 ER EPF = 18950.
BEGIN;
UPDATE public.contract_resources cr
SET employer_contributions = (
  SELECT jsonb_agg(
    CASE
      WHEN e->>'name' ~* 'reliever' AND e->>'formulaExpression' ~ '/\s*6' THEN e || jsonb_build_object('amount', 3158.33)
      WHEN e->>'name' ~* 'reliever' THEN e || jsonb_build_object('amount', 3158.97)
      WHEN e->>'name' ~* 'management\s*fee' THEN e || jsonb_build_object('amount', 1326.50)
      ELSE e END ORDER BY ord)
  FROM jsonb_array_elements(cr.employer_contributions) WITH ORDINALITY t(e, ord)),
  updated_at = now()
WHERE cr.id IN ('04bf0623-55b6-4de0-ac82-abdd25fa635f','a2fd933a-b389-4cd9-bf2f-2bda818b08b9');
COMMIT;

-- Correction: the management fee name contains "Reliever", so set it explicitly.
UPDATE public.contract_resources cr
SET employer_contributions = (
  SELECT jsonb_agg(CASE WHEN e->>'name' ~* 'management\s*fee' THEN e || jsonb_build_object('amount', 1326.50) ELSE e END ORDER BY ord)
  FROM jsonb_array_elements(cr.employer_contributions) WITH ORDINALITY t(e, ord)),
  updated_at = now()
WHERE cr.id IN ('04bf0623-55b6-4de0-ac82-abdd25fa635f','a2fd933a-b389-4cd9-bf2f-2bda818b08b9');
