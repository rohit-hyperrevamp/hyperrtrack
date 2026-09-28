-- Set GPS coordinates for CLI9938 (Poonawalla Fincorp - Mavdi Road, Rajkot)
-- Source: average of 10 guard punch coordinates from AlertCheckin (Sep 2026),
-- all within ~35 m of each other. The AlertCheckin site record itself holds a
-- wrong location (Haryana), so punch data is used as ground truth.
UPDATE public.units
SET latitude = 22.2674960,
    longitude = 70.7868129,
    coordinates_source = 'alertcheckin_punches',
    coordinates_accuracy_m = 35,
    coordinates_captured_at = now()
WHERE code = 'CLI9938';
