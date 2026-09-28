-- CON16229 (Poonawalla Mavdi Road) was created approved but left as record_type 'prospect'
UPDATE public.client_contracts SET record_type='client', updated_at=now()
WHERE contract_code='CON16229' AND record_type='prospect';
