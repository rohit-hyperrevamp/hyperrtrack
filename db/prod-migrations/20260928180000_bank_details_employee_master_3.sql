-- Bank details from Employee_Master_Data_3.xlsx (13 employees)
BEGIN;
CREATE TABLE IF NOT EXISTS _bkp_bank_20260928 AS SELECT id,employee_code,bank_name,bank_branch,bank_account_number,bank_ifsc,bank_account_holder FROM candidates WHERE id IN ('7460ea70-9459-4fdd-a9a6-e721753c1f3c','44019bfa-fc67-403f-b3d3-674ba54a8de9','2c579e71-c2b7-42ef-a603-a31b6fecd5d9','4d92d032-17a3-4b32-bf13-75d05b31acd8','da079cbc-f868-4a78-93fb-25166b5a10cc','66371dd9-4057-4a54-a6fb-40e9f90e4b88','5d790961-0c36-44c0-9c3d-514df7bda6b1','c14d5538-b0b1-49ca-9a85-d0c0b85dca0d','23864a83-34bc-4bc1-b525-6ad4953c4c60','d8b0c773-a374-462f-a1d9-ab4f985e2326','a117b169-f4a0-4ea6-9922-a7895152a48e','a494ce1b-a8ad-45b2-842b-a9b9067ae4f5','bb1109fa-631f-4320-836e-27b76e94fe59');
UPDATE candidates SET bank_account_holder='SACHIN BALU RUPNAWAR' WHERE id='7460ea70-9459-4fdd-a9a6-e721753c1f3c';
UPDATE candidates SET bank_account_holder='MAHENDRA BALASO KHOMANE', bank_name='UNION BANK OF INDIA' WHERE id='44019bfa-fc67-403f-b3d3-674ba54a8de9';
UPDATE candidates SET bank_account_holder='SUSHAL HAUSRAO NANDIRE', bank_name='BANK OF INDIA' WHERE id='2c579e71-c2b7-42ef-a603-a31b6fecd5d9';
UPDATE candidates SET bank_account_holder='Mr. SAGAR HANUMANT SALAVE', bank_name='STATE BANK OF INDIA' WHERE id='4d92d032-17a3-4b32-bf13-75d05b31acd8';
UPDATE candidates SET bank_account_holder='Mrs SUVARNA SANJAY AWAD' WHERE id='da079cbc-f868-4a78-93fb-25166b5a10cc';
UPDATE candidates SET bank_name='INDIA POST PAYMENT BANK', bank_branch='CORPORATE OFFICE', bank_account_number='034210888990', bank_ifsc='IPOS0000001' WHERE id='66371dd9-4057-4a54-a6fb-40e9f90e4b88';
UPDATE candidates SET bank_account_holder='MANOJ BAMANIYA', bank_name='PUNJAB NATIONAL BANK', bank_branch='UDAIPUR-TOWN HALL', bank_account_number='0060100100011961', bank_ifsc='PUNB0006010' WHERE id='5d790961-0c36-44c0-9c3d-514df7bda6b1';
UPDATE candidates SET bank_account_holder='SURESH KUMAR PANNALAL JAISWAR', bank_name='IDBI BANK', bank_branch='PANVEL', bank_account_number='0023104000515504', bank_ifsc='IBKL0000023' WHERE id='c14d5538-b0b1-49ca-9a85-d0c0b85dca0d';
UPDATE candidates SET bank_account_holder='HEMANT SOPAN BANSODE', bank_name='BANK OF INDIA', bank_branch='SATARA ROAD', bank_account_number='050710110026218', bank_ifsc='BKID0000553' WHERE id='23864a83-34bc-4bc1-b525-6ad4953c4c60';
UPDATE candidates SET bank_account_holder='RUSHAB DATTATRAY PARDESHI', bank_name='HDFC BANK', bank_branch='MAAN', bank_account_number='50100342147428', bank_ifsc='HDFC0005389' WHERE id='d8b0c773-a374-462f-a1d9-ab4f985e2326';
UPDATE candidates SET bank_account_holder='SHIV SHANKAR KUMAR', bank_name='ICICI BANK LIMITED', bank_branch='FATIMA NAGAR, PUNE', bank_account_number='017201002246', bank_ifsc='ICIC0001475' WHERE id='a117b169-f4a0-4ea6-9922-a7895152a48e';
UPDATE candidates SET bank_account_holder='HARSHRAJ PRATAP KAMBLE', bank_name='ICICI BANK LIMITED', bank_branch='MUMBAI - SANTACRUZ', bank_account_number='020901531949', bank_ifsc='ICIC0000209' WHERE id='a494ce1b-a8ad-45b2-842b-a9b9067ae4f5';
UPDATE candidates SET bank_account_holder='RAVI RANJAN PRASAD', bank_name='KOTAK MAHINDRA BANK LIMITED', bank_branch='DOMBIVALI', bank_account_number='3345819412', bank_ifsc='KKBK0000628' WHERE id='bb1109fa-631f-4320-836e-27b76e94fe59';
COMMIT;
