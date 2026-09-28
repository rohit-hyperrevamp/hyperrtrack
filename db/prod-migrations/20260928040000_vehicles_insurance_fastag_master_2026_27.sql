-- Import Master Data: Vehicles + Insurance (2026-27) + Fastag
-- Source: Master_Data_Vehicles_Insurance_Fastag_update_2026-27.xls (as on 27 Sep 2026)

create table if not exists _bkp_vehicles_20260928 as select * from vehicles;
create table if not exists _bkp_vehicle_insurances_20260928 as select * from vehicle_insurances;
create table if not exists _bkp_vehicle_fastags_20260928 as select * from vehicle_fastags;

-- Remove stray test row
delete from vehicles where vehicle_number = '1213';

-- 1) Vehicles (upsert on vehicle_number)
insert into vehicles (vehicle_number, name, owner, type, fuel_type, brand, engine_number, chassis_number, registration_date, notes)
values
  ('MH12WK0058','Maruti Wagon - R LXI(O) CNG','Radiant Guard Services Pvt. Ltd','Car','CNG','Maruti','K10CNC445445','MA3JMTB1SPK984751','2024-01-23',''),
  ('MH12TD6860','Hyundai Venue','Radiant Guard Services Pvt. Ltd','Car','Petrol','Hyundai','G3LCMM18 2284','MALFC81AVMM186635','2021-02-18',''),
  ('MH12TD8447','Mahindra Bolero BS 6(O) BS-VI','Radiant Facilities','SUV','Diesel','Mahindra','XKM6A11525','MA1XK2XKXM5A24645','2021-02-26',''),
  ('MH12UC1185','S-Presso VXI(O) CNG','Radiant Guard Services Pvt. Ltd','Car','CNG','Maruti','K10BN2488477','MA3RFL41SNB-335102','2022-03-02',''),
  ('MH12WK7946','Maruti Ertiga-VXI (CNG)','Radiant Guard Services Pvt. Ltd','Car','CNG','Maruti','K15CN9436159','MA3BNC62SRB752619','2024-03-13',''),
  ('MH12UC2787','Honda JAZZ 1.2VX CVT(I-VTEC)','Radiant Guard Services Pvt. Ltd','Car','Petrol','Honda','L12B47411482','MAKGK787BN43 03012','2022-03-11',''),
  ('MH12LW0073','Harley Davidson DYNA FXDF FAT BOB (CKD)','Anshuman Singh - RF','Bike','Petrol','Harley Davidson','GY4F305603','MEG1GY4N9FN305603','2015-03-25',''),
  ('MH12WP3019','BMW-630i GT','Radiant Guard Services Pvt. Ltd. NSB','Car','Petrol','BMW','0043Y477','WBA27BP04RY432320','2024-04-06',''),
  ('GJ01VA6644','Hero Passion Pro','Tej Singh - Mumbai','Bike','Petrol','Hero','JA06EUJHK03796','MBLJAR145JHK01824','2020-02-21',''),
  ('MH12UN0917','Maruti Wagon - R LXI(O) CNG','Radiant Guard Services Pvt. Ltd','Car','CNG','Maruti','K10CNC125040','MA3JMTB1SNG7 28345','2022-08-13',''),
  ('MH12TN1267','Toyota Fortuner','Radiant GS Pvt. Ltd - RG','SUV','Diesel','Toyota','1GDA52 6182','MBJAA3GS900555256-0721','2021-08-24',''),
  ('MH14HG3690','Toyota Camry Hybrid','Tejwant Singh Bevli - RF','Car','Hybrid','Toyota','2AR1549574','MBJ53CK5006002676-0916','2018-12-14',''),
  ('MH12PN0829','BMW - X1','Radiant Facilities - Bevli','Car','Diesel','BMW','1997128','WBAHU1700H5J00839','2017-09-14',''),
  ('MH12PN0730','BMW - X3','Radiant Guard Services Pvt. Ltd - Anshuman Singh','Car','Diesel','BMW','0122Y109','WBAWZ5709H0T89507','2017-09-14',''),
  ('MH12UN7611','Mahindra THAR','Radiant Guard Services Pvt. Ltd','SUV','Diesel','Mahindra','ZBN4G443300','MA1UJ4ZB7N2G 26160','2022-09-22',''),
  ('MH12NL0653','Harley Davidson FAT BOY 103','Navinder Singh Bevli - RF','Bike','Petrol','Harley Davidson','BXVG013444','MEG1BXVN0GN013444','2016-09-30',''),
  ('KA01NA5845','S-Presso VXI(O) CNG','Radiant Guard Services Pvt. Ltd','Car','CNG','Maruti','K10CNC382255','MA3RFL61SPG465410','2023-10-17',''),
  ('MH12TS4356','Mahindra Bolero Neo N4','Radiant Guard Services Pvt. Ltd','SUV','Diesel','Mahindra','XJM6H63823','MA1NA2XJXM6H38632','2021-11-17',''),
  ('MH14FS1665','Mercedes E250','Anshuman Singh - RF','Car','Diesel','Mercedes','65192433100782','WDD2120036L058071','2016-08-02',''),
  ('MH12XH4356','Maruti Wagon - R VXI(O) CNG','Radiant Guard Services Pvt. Ltd','Car','CNG','Maruti','K10CNC686085','MA3JMTB1SRKB76510','2024-11-07',''),
  ('MH12XQ2623','BMW-IX-xDrive50-EV','Radiant Guard Services Pvt. Ltd. AS','Car','Electric','BMW','R590B628','WBY22CFG6RCT24928','2024-12-26',''),
  ('MH46CM6972','Mahindra Scorpio S MT 7S','Radiant Guard Services Pvt. Ltd','SUV','Diesel','Mahindra','YSP4M69206','MA1TA2Y52P2M18453','2024-01-15','Lodha vehicle'),
  ('MH46CM6973','Mahindra Scorpio S MT 7S','Radiant Guard Services Pvt. Ltd','SUV','Diesel','Mahindra','YSP4M68973','MA1TA2Y52P2M18451','2024-01-15','Lodha vehicle'),
  ('MH04LH6478','Mahindra Scorpio S MT 7S','Radiant Guard Services Pvt. Ltd','SUV','Diesel','Mahindra','YSN4L8 6764','MA1TA2YS2N2L28812','2022-12-22','Lodha vehicle'),
  ('MH04LH8903','Mahindra Scorpio S MT 7S','Radiant Guard Services Pvt. Ltd','SUV','Diesel','Mahindra','YSN4M60016','MA1TA2YS2P2A10626','2023-02-01','Lodha vehicle'),
  ('MH12XX3941','Mahindra Scorpio S MT 7S','Radiant Guard Services Pvt. Ltd','SUV','Diesel','Mahindra','YSS4C35145','MA1TA2YS2SC44785','2025-04-07','Lodha vehicle')
on conflict (vehicle_number) do update set
  name = excluded.name,
  owner = excluded.owner,
  type = excluded.type,
  fuel_type = excluded.fuel_type,
  brand = excluded.brand,
  engine_number = excluded.engine_number,
  chassis_number = excluded.chassis_number,
  registration_date = excluded.registration_date,
  notes = excluded.notes;

-- 2) Insurance (replace existing rows per vehicle)
delete from vehicle_insurances where vehicle_id in (select id from vehicles);

insert into vehicle_insurances (vehicle_id, engine_number, chassis_number, insurance_company, policy_number, start_date, end_date, notes)
select v.id, x.engine_no, x.chassis_no, x.company, x.policy, x.start_dt, x.end_dt, x.renewal_month
from (values
  ('MH12WK0058','K10CNC445445','MA3JMTB1SPK984751','Bajaj Allianz','OG-25-1025-1870-00000025','2026-01-05','2027-01-04','Renewal: Jan'),
  ('MH12TD6860','G3LCMM18 2284','MALFC81AVMM186635','Go Digit','D250679452 / 11022026','2026-02-20','2027-02-19','Renewal: Feb'),
  ('MH12TD8447','XKM6A11525','MA1XK2XKXM5A24645','Go Digit','D249893002 / 11022026','2026-02-20','2027-02-19','Renewal: Feb'),
  ('MH12UC1185','K10BN2488477','MA3RFL41SNB-335102','Generali Central Insurance','132/02/11/0227/MTP/1010366196','2026-02-26','2027-02-25','Renewal: Feb'),
  ('MH12WK7946','K15CN9436159','MA3BNC62SRB752619','Bajaj Allianz','OG-26-1025-1870-00000048','2026-03-04','2027-03-03','Renewal: Mar'),
  ('MH12UC2787','L12B47411482','MAKGK787BN43 03012','Bajaj Allianz','OG-26-2001-1801-00010201','2026-03-08','2027-03-07','Renewal: Mar'),
  ('MH12LW0073','GY4F305603','MEG1GY4N9FN305603','Bajaj Allianz','OG-26-2001-1802-00011475','2026-03-31','2027-03-30','Renewal: Mar'),
  ('MH12WP3019','0043Y477','WBA27BP04RY432320','Bajaj Allianz','OG-27-1025-1872-00000001','2026-04-02','2027-04-01','Renewal: Mar/Apr'),
  ('GJ01VA6644','JA06EUJHK03796','MBLJAR145JHK01824','Bajaj Allianz','12-1806-0005029395-02','2026-04-15','2027-04-14','Renewal: Apr'),
  ('MH12UN0917','K10CNC125040','MA3JMTB1SNG7 28345','Tata AIG','6206609856 00 00','2026-08-10','2027-08-09','Renewal: Aug'),
  ('MH12TN1267','1GDA52 6182','MBJAA3GS900555256-0721','Tata AIG','6206609895 00 00','2026-08-21','2027-08-20','Renewal: Aug'),
  ('MH14HG3690','2AR1549574','MBJ53CK5006002676-0916','Go Digit','D292564067 / 31082026','2026-09-04','2027-09-03','Renewal: Sept'),
  ('MH12PN0829','1997128','WBAHU1700H5J00839','Go Digit','D292461920 / 31082026','2026-09-07','2027-09-06','Renewal: Sept'),
  ('MH12PN0730','0122Y109','WBAWZ5709H0T89507','ICICI Lombard','3001/453816532/00/000','2026-09-11','2027-09-10','Renewal: Sep'),
  ('MH12UN7611','ZBN4G443300','MA1UJ4ZB7N2G 26160','Go Digit','D292938986 / 02092026','2026-09-20','2027-09-19','Renewal: Sept'),
  ('MH12NL0653','BXVG013444','MEG1BXVN0GN013444','Tata AIG','6108048685 00 00','2026-10-12','2027-10-11','Renewal: Oct'),
  ('KA01NA5845','K10CNC382255','MA3RFL61SPG465410','Go Digit','D297437464 / 26092026','2026-10-04','2027-10-03','Renewal: Oct'),
  ('MH12TS4356','XJM6H63823','MA1NA2XJXM6H38632','Bajaj Allianz','OG-26-1025-1801-00000143','2025-11-02','2026-11-01','Renewal: Nov'),
  ('MH14FS1665','65192433100782','WDD2120036L058071','Bajaj Allianz','OG-26-1025-1801-00000144','2025-11-07','2026-11-06','Renewal: Nov'),
  ('MH12XH4356','K10CNC686085','MA3JMTB1SRKB76510','Bajaj Allianz','OG-26-1025-1870-00000031','2025-11-04','2026-11-03','Renewal: Nov'),
  ('MH12XQ2623','R590B628','WBY22CFG6RCT24928','ICICI Lombard','3001/O/421893783/00/000','2025-12-23','2026-12-22','Renewal: Dec'),
  ('MH46CM6972','YSP4M69206','MA1TA2Y52P2M18453','Bajaj Allianz','OG-25-1025-1870-00000024','2026-01-10','2027-01-09','Renewal: Jan'),
  ('MH46CM6973','YSP4M68973','MA1TA2Y52P2M18451','Bajaj Allianz','OG-26-1025-1870-00000042','2026-01-10','2027-01-09','Renewal: Jan'),
  ('MH04LH6478','YSN4L8 6764','MA1TA2YS2N2L28812','Reliance Gen','170122623110001466','2026-01-14','2027-01-13','Renewal: Jan'),
  ('MH04LH8903','YSN4M60016','MA1TA2YS2P2A10626','Reliance Gen','170122623110001478','2026-01-14','2027-01-13','Renewal: Jan'),
  ('MH12XX3941','YSS4C35145','MA1TA2YS2SC44785','Tata AIG','62060291280000','2026-04-03','2027-04-02','Renewal: Apr')
) as x(veh_no, engine_no, chassis_no, company, policy, start_dt, end_dt, renewal_month)
join vehicles v on v.vehicle_number = x.veh_no;

-- 3) Fastag (replace existing rows per vehicle)
delete from vehicle_fastags where vehicle_id in (select id from vehicles);

insert into vehicle_fastags (vehicle_id, bank_name, login_type, login_id, login_password, registered_email, account_number, notes)
select v.id, x.bank, x.login_type, x.login_id, x.pw, x.email, x.mobile, ''
from (values
  ('MH12TD6860','Axis Bank','individual','190005918151','Radiant@123','wID-19000013617427','9822061900'),
  ('MH12TN1267','ICICI Bank','corporate','radiant1267','Radiant@jul2026','shahid@radiantguards.com','9881904805'),
  ('MH14HG3690','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH12PN0829','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH12PN0730','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH14FS1665','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH12XQ2623','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH12WK0058','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH12WK7946','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH12UN0917','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH12TD8447','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9881904805'),
  ('MH12TS4356','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9156453030'),
  ('MH12XH4356','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9156453030'),
  ('MH12XX3941','ICICI Bank','corporate','11466687','Radiant@aug2026','shahid@radiantguards.com','9156453030'),
  ('MH12UN7611','IDFC Bank','corporate','Radiant','Radthar@7611 (OTP: 9156453030)','shahid@radiantguards.com','9156453030'),
  ('MH12UC2787','IDFC Bank','corporate','Radiant','Radthar@7611 (OTP: 9156453030)','shahid@radiantguards.com','9156453030'),
  ('MH12WP3019','IDFC Bank','corporate','Radiant','Radthar@7611 (OTP: 9156453030)','shahid@radiantguards.com','9156453030'),
  ('MH12UC1185','IDFC Bank','corporate','Radiant','Radthar@7611 (OTP: 9156453030)','shahid@radiantguards.com','9156453030')
) as x(veh_no, bank, login_type, login_id, pw, email, mobile)
join vehicles v on v.vehicle_number = x.veh_no;
