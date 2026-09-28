-- Property insurance master 2025-26 & 2026-27 (from Property_Insurance_Details_RG-2026-27.xlsx)
BEGIN;

CREATE TABLE IF NOT EXISTS _bkp_properties_20260928 AS SELECT * FROM properties;
CREATE TABLE IF NOT EXISTS _bkp_property_expenses_20260928 AS SELECT * FROM property_expenses;

-- Properties (one row per insured location)
INSERT INTO properties (id, house_number, name, owner, address1, city, state, pincode, notes) VALUES
 (gen_random_uuid(), 'Shop No 6', 'Grow More Tower, Sector 2, Kharghar', 'Anshuman Singh & Bevli Tejwant Singh', 'Grow More Tower, Shop No 6, Sector 2, Kharghar', 'Navi Mumbai', 'Maharashtra', '410210', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'Office No 815, 816, 817 & 723', 'Clover Hills Plaza, NIBM Road', 'Radiant Guard Services Pvt Ltd', 'Office No 815, 816, 817 & 723 Clover Hills Plaza, NIBM Road, Kondhwa Khurd', 'Pune', 'Maharashtra', '411048', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'Office No 818 & 821', 'Clover Hills Plaza, NIBM Road', 'Tejwant Singh Bevli', 'Office No 818 & 821, Clover Hills Plaza, NIBM Road, Kondhwa Khurd', 'Pune', 'Maharashtra', '411048', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'Office No 819, 820 & 822', 'Clover Hills Plaza, NIBM Road', 'Anshuman Singh', 'Office No 819, 820 & 822, Clover Hills Plaza, NIBM Road, Kondhwa Khurd', 'Pune', 'Maharashtra', '411048', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'C-39', 'Cloud-9, Mohammedwadi', 'Tejwant Singh Bevli', 'C-39, Cloud-9, S.No. 46/1/3, 46/1/1, Plot No 63, Mohammedwadi', 'Pune', 'Maharashtra', '411060', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'B-44', 'Clover Hills, NIBM Road', 'Anshuman Singh', 'B-44 Clover Hills, Svy No 27 NIBM Road, Kondhwa Khurd', 'Pune', 'Maharashtra', '411048', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'F/201', 'Marval Isola, Mohamadwadi', 'Tejwant Singh Bevli', 'F/201, Marval Isola, S.No 16/2/1+16/2/2+16/2/3, 2nd Flr, Mohamadwadi', 'Pune', 'Maharashtra', '411060', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'Unit 23', 'Sacred World, Wanawadi', 'Anshuman Singh', 'Unit 23, 2nd Floor, S.No 75/2/2B, Wing-B South Block, Sacred World, Wanawadi', 'Pune', 'Maharashtra', '411040', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'Unit 24', 'Sacred World, Wanawadi', 'Tejwant Singh Bevli', 'Unit 24, 2nd Floor, S.No 75/2/2B, Wing-B South Block, Sacred World, Wanawadi', 'Pune', 'Maharashtra', '411040', 'Imported from property insurance master 2026-27'),
 (gen_random_uuid(), 'Flat No 2', 'Silver Stone Bldg, Kondhwa Khurd', NULL, 'Flat No 2, Silver Stone Bldg, Kondhawa Khurd', 'Pune', 'Maharashtra', '411048', 'Imported from property insurance master 2025-26'),
 (gen_random_uuid(), 'Shop No 1 & 2', 'Silver Stone Bldg, Kondhwa Khurd', NULL, 'Shop No 1 & 2, Svy No 40/5, Silver Stone Bldg, Kondhawa Khurd', 'Pune', 'Maharashtra', '411048', 'Imported from property insurance master 2025-26'),
 (gen_random_uuid(), 'Flat No 1', 'Silver Stone Bldg, Kondhwa Khurd', NULL, 'Flat No 1, Svy No 40/5, Silver Stone Bldg, Kondhawa Khurd', 'Pune', 'Maharashtra', '411048', 'Imported from property insurance master 2025-26'),
 (gen_random_uuid(), 'Shop No 3 & 4', 'Silver Stone Bldg, Kondhwa Khurd', NULL, 'Shop No 3 & 4, Svy No 40/5, Silver Stone Bldg, Kondhawa Khurd', 'Pune', 'Maharashtra', '411048', 'Imported from property insurance master 2025-26');

-- Insurance premium expenses, one per policy (2026-27 then 2025-26)
INSERT INTO property_expenses (property_id, expense_date, category, amount, vendor_name, notes)
SELECT p.id, v.expense_date, 'Insurance', v.premium, v.insurer,
       'Policy ' || v.policy_no || ' | ' || v.policy_type || ' | Insured: ' || v.insured_name
       || ' | Validity: ' || v.valid_from || ' to ' || v.valid_to || ' | Sum insured: ₹' || v.sum_insured
FROM (VALUES
 -- 2026-27
 ('Grow More Tower, Sector 2, Kharghar','OG-27-1025-4056-00000009','Bajaj Allianz Gen Ins Coy Ltd','Anshuman Singh & Bevli Tejwant Singh','Property - Bharat Sookshma Udyam Suraksha Policy',date '2026-08-06',date '2027-07-06',9000000,5311,date '2026-08-06'),
 ('Clover Hills Plaza, NIBM Road','21000000006750300000','HDFC Ergo','Radiant Guard Services Pvt Ltd','Property - Bharat Sookshma Udyam Suraksha Policy',date '2026-07-06',date '2027-06-06',17538678,2706,date '2026-07-06'),
 ('Clover Hills Plaza, NIBM Road','21000000006749700000','HDFC Ergo','Tejwant Singh Bevli','Property - Bharat Sookshma Udyam Suraksha Policy',date '2026-07-06',date '2027-06-06',6000456,1026,date '2026-07-06'),
 ('Clover Hills Plaza, NIBM Road','21000000006749800000','HDFC Ergo','Anshuman Singh','Property - Bharat Sookshma Udyam Suraksha Policy',date '2026-07-06',date '2027-06-06',9070656,1583,date '2026-07-06'),
 ('Cloud-9, Mohammedwadi','2111208902494900000','HDFC Ergo','Tejwant Singh Bevli','Property - Bharat Griha Raksha Policy',date '2026-08-30',date '2027-08-29',15820216,4655,date '2026-08-30'),
 ('Clover Hills, NIBM Road','2111208902213000000','HDFC Ergo','Anshuman Singh','Property - Bharat Griha Raksha Policy',date '2026-08-30',date '2027-08-29',34738123,10222,date '2026-08-30'),
 ('Marval Isola, Mohamadwadi','2111208902562300000','HDFC Ergo','Tejwant Singh Bevli','Property - Bharat Griha Raksha Policy',date '2026-08-30',date '2027-08-29',27262383,8023,date '2026-08-30'),
 ('Sacred World, Wanawadi','2100000008467800000','HDFC Ergo','Anshuman Singh','Property - Bharat Sookshma Udyam Suraksha Policy',date '2026-01-09',date '2027-08-31',7500000,3611,date '2026-01-09'),
 ('Sacred World, Wanawadi','2100000008445900000','HDFC Ergo','Tejwant Singh Bevli','Property - Bharat Sookshma Udyam Suraksha Policy',date '2026-01-09',date '2027-08-31',7500000,3611,date '2026-01-09'),
 -- 2025-26
 ('Cloud-9, Mohammedwadi','OG-26-1025-4056-00000002','Bajaj Allianz Gen Ins Coy Ltd','Tejwant Singh Bevli','Property - Bharat Sookshma Udyam Suraksha Policy',date '2025-08-30',date '2026-08-29',15556800,4808,date '2025-08-30'),
 ('Clover Hills, NIBM Road','OG-26-1025-4056-00000003','Bajaj Allianz Gen Ins Coy Ltd','Anshuman Singh','Property - Bharat Sookshma Udyam Suraksha Policy',date '2025-08-30',date '2026-08-29',34175800,10562,date '2025-08-30'),
 ('Marval Isola, Mohamadwadi','OG-26-1025-4056-00000004','Bajaj Allianz Gen Ins Coy Ltd','Tejwant Singh Bevli','Property - Bharat Sookshma Udyam Suraksha Policy',date '2025-08-30',date '2026-08-29',26820000,7539,date '2025-08-30'),
 ('Grow More Tower, Sector 2, Kharghar','OG-26-1025-4056-00000006','Bajaj Allianz Gen Ins Coy Ltd','Anshuman Singh & Bevli Tejwant Singh','Property - Bharat Sookshma Udyam Suraksha Policy',date '2025-08-06',date '2026-07-06',9000000,5311,date '2025-08-06'),
 ('Sacred World, Wanawadi','OG-26-1025-4056-00000008','Bajaj Allianz Gen Ins Coy Ltd','Tejwant Singh Bevli','Property - Bharat Sookshma Udyam Suraksha Policy',date '2025-01-09',date '2026-08-31',7500000,4165,date '2025-01-09'),
 ('Silver Stone Bldg, Kondhwa Khurd','OG-26-1025-4056-00000009','Bajaj Allianz Gen Ins Coy Ltd','','Property - Bharat Sookshma Udyam Suraksha Policy',date '2025-01-09',date '2026-08-31',8500000,8247,date '2025-01-09'),
 ('Silver Stone Bldg, Kondhwa Khurd','OG-26-1025-4056-00000011','Bajaj Allianz Gen Ins Coy Ltd','','Property - Bharat Sookshma Udyam Suraksha Policy',date '2025-01-09',date '2026-08-31',8500000,8058,date '2025-01-09'),
 ('Sacred World, Wanawadi','OG-26-1025-4056-00000010','Bajaj Allianz Gen Ins Coy Ltd','Anshuman Singh','Property - Bharat Sookshma Udyam Suraksha Policy',date '2025-01-09',date '2026-08-31',7500000,4118,date '2025-01-09')
) AS v(prop_name, policy_no, insurer, insured_name, policy_type, valid_from, valid_to, sum_insured, premium, expense_date)
JOIN properties p ON p.name LIKE '%' || v.prop_name || '%'
WHERE (v.policy_no <> '21000000006749700000' OR p.house_number = 'Office No 818 & 821')
  AND (v.policy_no <> '21000000006749800000' OR p.house_number = 'Office No 819, 820 & 822')
  AND (v.policy_no <> '21000000006750300000' OR p.house_number = 'Office No 815, 816, 817 & 723')
  AND (v.policy_no <> '2100000008467800000' OR p.house_number = 'Unit 23')
  AND (v.policy_no <> '2100000008445900000' OR p.house_number = 'Unit 24')
  AND (v.policy_no <> 'OG-26-1025-4056-00000008' OR p.house_number = 'Unit 24')
  AND (v.policy_no <> 'OG-26-1025-4056-00000010' OR p.house_number = 'Unit 23')
  AND (v.policy_no <> 'OG-26-1025-4056-00000009' OR p.house_number = 'Flat No 2')
  AND (v.policy_no <> 'OG-26-1025-4056-00000011' OR p.house_number = 'Flat No 1');

COMMIT;
