-- Extend CON16260 (CLI4422 Umrala) and CON16261 (CLI4490 Vishrantwadi) to the
-- standard Poonawalla renewal window, matching the other renewed Poonawalla contracts.
UPDATE client_contracts
SET start_date = '2026-08-21',
    end_date = '2027-08-20',
    original_start_date = '2026-08-21',
    updated_at = now()
WHERE contract_code IN ('CON16260', 'CON16261');
