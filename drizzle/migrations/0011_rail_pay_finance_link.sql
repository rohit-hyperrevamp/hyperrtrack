ALTER TABLE public.rail_people ADD COLUMN IF NOT EXISTS candidate_id uuid;
ALTER TABLE public.rail_locations ADD COLUMN IF NOT EXISTS unit_id uuid;

-- Worker's own pay for a month: attendance days x daily wage. Only the signed-in worker's row.
CREATE OR REPLACE FUNCTION public.rail_my_pay(_month date)
RETURNS TABLE(full_name text, role_key text, skill text, mobile text, daily_wage numeric, days bigint, hours numeric, gross numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.full_name, p.role_key, p.skill, p.mobile, coalesce(p.daily_wage,0),
         count(a.id), coalesce(sum(a.hours),0), coalesce(p.daily_wage,0) * count(a.id)
  FROM rail_people p
  LEFT JOIN rail_attendance a ON a.person_id = p.id AND a.deleted_at IS NULL
       AND a.work_date >= date_trunc('month', _month)::date
       AND a.work_date < (date_trunc('month', _month) + interval '1 month')::date
  WHERE p.deleted_at IS NULL AND p.mobile = public.rail_my_mobile()
  GROUP BY p.id;
$$;
REVOKE ALL ON FUNCTION public.rail_my_pay(date) FROM public;
GRANT EXECUTE ON FUNCTION public.rail_my_pay(date) TO authenticated;

-- Profit view per month: billed vs wage cost vs penalties. Billing viewers only.
CREATE OR REPLACE FUNCTION public.rail_finance_summary(_month date)
RETURNS TABLE(location_id uuid, location_name text, staff bigint, man_days bigint, wage_cost numeric, penalties numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT l.id, l.name, count(DISTINCT a.person_id), count(a.id),
         coalesce(sum(p.daily_wage),0),
         coalesce((SELECT sum(pe.amount) FROM rail_penalties pe WHERE pe.location_id = l.id AND pe.deleted_at IS NULL
                   AND pe.status IN ('confirmed','proposed')
                   AND pe.penalty_date >= date_trunc('month', _month)::date
                   AND pe.penalty_date < (date_trunc('month', _month) + interval '1 month')::date),0)
  FROM rail_locations l
  LEFT JOIN rail_attendance a ON a.location_id = l.id AND a.deleted_at IS NULL
       AND a.work_date >= date_trunc('month', _month)::date
       AND a.work_date < (date_trunc('month', _month) + interval '1 month')::date
  LEFT JOIN rail_people p ON p.id = a.person_id
  WHERE l.deleted_at IS NULL AND l.type = 'depot' AND public.rail_can('rail_billing','view')
  GROUP BY l.id, l.name;
$$;
REVOKE ALL ON FUNCTION public.rail_finance_summary(date) FROM public;
GRANT EXECUTE ON FUNCTION public.rail_finance_summary(date) TO authenticated;

-- Side panel: people present today at a place (or all), with required staff from norms.
CREATE OR REPLACE FUNCTION public.rail_presence(_location uuid DEFAULT NULL)
RETURNS TABLE(person_id uuid, full_name text, role_key text, location_name text, check_in timestamptz, check_out timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name, p.role_key, l.name, a.check_in, a.check_out
  FROM rail_attendance a JOIN rail_people p ON p.id = a.person_id
  LEFT JOIN rail_locations l ON l.id = a.location_id
  WHERE a.deleted_at IS NULL AND a.work_date = current_date
    AND (_location IS NULL OR a.location_id = _location OR a.location_id IN (SELECT id FROM rail_locations WHERE parent_id = _location))
    AND public.rail_can('rail_ops','view')
  ORDER BY a.check_in DESC NULLS LAST;
$$;
REVOKE ALL ON FUNCTION public.rail_presence(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.rail_presence(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.rail_required_staff(_location uuid DEFAULT NULL)
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(sum(n.min_count),0)::bigint FROM rail_deployment_norms n
  JOIN rail_contract_sites s ON s.id = n.contract_site_id
  WHERE n.deleted_at IS NULL AND n.effective_from <= current_date AND (n.effective_to IS NULL OR n.effective_to >= current_date)
    AND (_location IS NULL OR s.location_id = _location)
    AND public.rail_can('rail_ops','view');
$$;
REVOKE ALL ON FUNCTION public.rail_required_staff(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.rail_required_staff(uuid) TO authenticated;