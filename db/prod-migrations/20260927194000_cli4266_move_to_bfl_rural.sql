-- CLI4266 Bhandara Gandhi Chowk (CON15908) was under Bajaj Electricals (ORG165); BFL MIS never picked it up.
CREATE TABLE IF NOT EXISTS _bkp_cli4266_org_20260927 AS SELECT id, customer_id FROM units WHERE code='CLI4266';
UPDATE units SET customer_id=(SELECT id FROM customers WHERE code='ORG163') WHERE code='CLI4266';
