ALTER TABLE public.rail_pay_structures
  ADD COLUMN IF NOT EXISTS conveyance_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS special_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ed_shift_hours numeric NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS ed_multiplier numeric NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS pt_gross_threshold numeric NOT NULL DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS edli_er_pct numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS admin_er_pct numeric NOT NULL DEFAULT 0.5;

CREATE OR REPLACE FUNCTION public.rail_payslip_preview(_person uuid, _month date DEFAULT (date_trunc('month', CURRENT_DATE))::date)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE p record; s record; w record; days int; ed_hours numeric; rate numeric; base numeric; hra numeric; conv numeric; spl numeric; bonus numeric; uni numeric; lv numeric; ed numeric; gross numeric; pfw numeric; pf numeric; pfer numeric; edli numeric; adm numeric; esic numeric; esicer numeric; pt numeric; lwf numeric; is_self boolean; is_mgr boolean; sh numeric;
BEGIN
  SELECT rp.*, l.area_class AS loc_area INTO p FROM rail_people rp LEFT JOIN rail_locations l ON l.id=rp.home_location_id WHERE rp.id=_person;
  IF NOT FOUND THEN RETURN NULL; END IF;
  is_self := EXISTS (SELECT 1 FROM auth.users u WHERE u.id=auth.uid() AND u.email='phone-'||p.mobile||'@radiantguard.local');
  is_mgr := public.rail_can('rail_billing','view');
  IF NOT is_self AND NOT is_mgr THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO s FROM rail_pay_structures WHERE role_key=p.role_key AND deleted_at IS NULL
    AND effective_from <= (_month + interval '1 month - 1 day')::date AND (effective_to IS NULL OR effective_to >= _month)
    ORDER BY effective_from DESC LIMIT 1;
  IF NOT FOUND THEN SELECT * INTO s FROM rail_pay_structures WHERE role_key=p.role_key AND deleted_at IS NULL ORDER BY effective_from DESC LIMIT 1; END IF;
  SELECT * INTO w FROM rail_wage_rules WHERE skill=coalesce(p.skill, s.skill, 'unskilled') AND area_class=coalesce(nullif(p.loc_area,''),'A') AND deleted_at IS NULL AND effective_from<=_month AND (effective_to IS NULL OR effective_to>=_month) ORDER BY effective_from DESC LIMIT 1;
  sh := greatest(coalesce(s.ed_shift_hours,8), 1);
  SELECT count(*), coalesce(sum(greatest(coalesce(hours,0) - sh, 0)),0) INTO days, ed_hours FROM rail_attendance WHERE person_id=_person AND deleted_at IS NULL AND check_in IS NOT NULL AND work_date>=_month AND work_date<(_month + interval '1 month');
  rate := greatest(coalesce(w.total_per_day,0), coalesce(p.daily_wage,0));
  base := round(days*rate,2);
  hra := round(base*coalesce(s.hra_pct,0)/100,2);
  conv := round(base*coalesce(s.conveyance_pct,0)/100,2);
  spl := round(base*coalesce(s.special_pct,0)/100,2);
  bonus := round(base*coalesce(s.bonus_pct,0)/100,2);
  uni := round(base*coalesce(s.uniform_pct,0)/100,2);
  lv := round(base*coalesce(s.leave_pct,0)/100,2);
  ed := round(ed_hours*(rate/sh)*coalesce(s.ed_multiplier,2),2);
  gross := base+hra+conv+spl+bonus+uni+lv+ed;
  pfw := least(base, coalesce(s.pf_wage_cap,15000));
  pf := round(pfw*coalesce(s.pf_emp_pct,12)/100,0); pfer := round(pfw*coalesce(s.pf_er_pct,13)/100,0);
  edli := round(pfw*coalesce(s.edli_er_pct,0)/100,0); adm := round(pfw*coalesce(s.admin_er_pct,0)/100,0);
  esic := CASE WHEN gross>0 AND gross<=coalesce(s.esic_gross_limit,21000) THEN ceil(gross*coalesce(s.esic_emp_pct,0.75)/100) ELSE 0 END;
  esicer := CASE WHEN gross>0 AND gross<=coalesce(s.esic_gross_limit,21000) THEN ceil(gross*coalesce(s.esic_er_pct,3.25)/100) ELSE 0 END;
  pt := CASE WHEN gross>=coalesce(s.pt_gross_threshold,10000) THEN coalesce(s.pt_monthly,200) ELSE 0 END;
  lwf := CASE WHEN days>0 THEN coalesce(s.lwf_monthly,0) ELSE 0 END;
  RETURN jsonb_build_object('name',p.full_name,'role',p.role_key,'structure',s.label,'days',days,'day_rate',rate,'ed_hours',ed_hours,'ed_rate',round((rate/sh)*coalesce(s.ed_multiplier,2),2),
    'basic_da',base,'hra',hra,'conveyance',conv,'special',spl,'bonus',bonus,'uniform',uni,'leave',lv,'ed',ed,'gross',gross,
    'pf',pf,'esic',esic,'pt',pt,'lwf',lwf,'deductions',pf+esic+pt+lwf,'net',gross-(pf+esic+pt+lwf),
    'employer_pf',CASE WHEN is_mgr THEN pfer END,'employer_edli',CASE WHEN is_mgr THEN edli END,'employer_admin',CASE WHEN is_mgr THEN adm END,
    'employer_esic',CASE WHEN is_mgr THEN esicer END,'ctc',CASE WHEN is_mgr THEN gross+pfer+edli+adm+esicer END,
    'rates', jsonb_build_object('hra',s.hra_pct,'conveyance',s.conveyance_pct,'special',s.special_pct,'bonus',s.bonus_pct,'uniform',s.uniform_pct,'leave',s.leave_pct,
      'pf_emp',s.pf_emp_pct,'pf_er',s.pf_er_pct,'pf_cap',s.pf_wage_cap,'edli',s.edli_er_pct,'admin',s.admin_er_pct,'esic_emp',s.esic_emp_pct,'esic_er',s.esic_er_pct,'esic_limit',s.esic_gross_limit,
      'pt',s.pt_monthly,'pt_threshold',s.pt_gross_threshold,'ed_mult',s.ed_multiplier,'shift',sh),
    'placeholder',coalesce(s.is_placeholder,true));
END $function$;