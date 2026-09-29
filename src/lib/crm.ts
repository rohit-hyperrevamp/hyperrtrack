// Sales & Marketing CRM data layer (prospects pipeline, activities, quotes).
// Tables are gated by RLS (`current_user_can_crm()`): Super Admin only, plus any
// role later granted the `sales_marketing` RBAC module.
import { supabase } from "@/integrations/supabase/client";

// The CRM tables are newer than the generated client types; use a loose handle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const crmDb = supabase as unknown as { from: (table: string) => any };

export const CRM_MODULE = "Sales & Marketing";

export type CrmStage = {
  key: string;
  label: string;
  sort_order: number;
  probability: number;
  is_won: boolean;
  is_lost: boolean;
  is_active: boolean;
};

export type CrmLead = {
  id: string;
  lead_code: string;
  company_name: string;
  customer_id: string | null;
  unit_id: string | null;
  contact_name: string;
  contact_title: string;
  contact_phone: string;
  contact_email: string;
  source: string;
  industry: string;
  service_type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  stage_key: string;
  owner_name: string;
  estimated_monthly_value: number;
  probability: number | null;
  expected_close_date: string | null;
  next_follow_up_at: string | null;
  lost_reason: string;
  notes: string;
  converted_contract_id: string | null;
  converted_at: string | null;
  stage_changed_at: string;
  created_at: string;
  updated_at: string;
};

export type CrmActivity = {
  id: string;
  lead_id: string;
  activity_type: string;
  subject: string;
  details: string;
  scheduled_at: string | null;
  completed: boolean;
  created_by_name: string;
  created_at: string;
};

export type CrmRequirement = {
  id: string;
  lead_id: string;
  designation_id: string | null;
  designation_label: string;
  quantity: number;
  shift_hours: number;
  notes: string;
};

export type CrmQuote = {
  id: string;
  lead_id: string;
  quote_no: string;
  version: number;
  status: "draft" | "sent" | "signed" | "rejected";
  valid_until: string | null;
  notes: string;
  total_monthly: number;
  sent_at: string | null;
  signed_at: string | null;
  created_at: string;
};

export type CrmQuoteLine = {
  id: string;
  quote_id: string;
  designation_id: string | null;
  designation_label: string;
  quantity: number;
  shift_hours: number;
  paid_days: number;
  gross_salary: number;
  billing_rate: number;
  notes: string;
  sort_order: number;
};

export const LEAD_SOURCES = ["Referral", "Website", "Cold Call", "Email Campaign", "Tender", "Existing Client", "Walk-in", "Other"];
export const ACTIVITY_TYPES: { value: string; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "site_visit", label: "Site Visit" },
  { value: "email", label: "Email" },
  { value: "note", label: "Note" },
];

export const QK = {
  stages: ["crm", "stages"] as const,
  leads: ["crm", "leads"] as const,
  lead: (id: string) => ["crm", "lead", id] as const,
  activities: (id: string) => ["crm", "activities", id] as const,
  requirements: (id: string) => ["crm", "requirements", id] as const,
  quotes: ["crm", "quotes"] as const,
  quoteLines: (id: string) => ["crm", "quote-lines", id] as const,
  lostReasons: ["crm", "lost-reasons"] as const,
};

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export async function fetchStages(): Promise<CrmStage[]> {
  return unwrap<CrmStage[]>(await crmDb.from("crm_stages").select("*").eq("is_active", true).order("sort_order"));
}
export async function fetchLostReasons(): Promise<{ id: string; label: string }[]> {
  return unwrap(await crmDb.from("crm_lost_reasons").select("id,label").eq("is_active", true).order("sort_order"));
}
export async function fetchLeads(): Promise<CrmLead[]> {
  const out: CrmLead[] = [];
  for (let from = 0; ; from += 1000) {
    const rows = unwrap<CrmLead[]>(
      await crmDb.from("crm_leads").select("*").order("created_at", { ascending: false }).range(from, from + 999),
    );
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}
export async function fetchLead(id: string): Promise<CrmLead | null> {
  const res = await crmDb.from("crm_leads").select("*").eq("id", id).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return (res.data as CrmLead) ?? null;
}
export async function fetchActivities(leadId: string): Promise<CrmActivity[]> {
  return unwrap(await crmDb.from("crm_activities").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }));
}
export async function fetchRequirements(leadId: string): Promise<CrmRequirement[]> {
  return unwrap(await crmDb.from("crm_lead_requirements").select("*").eq("lead_id", leadId).order("created_at"));
}
export async function fetchQuotes(leadId?: string): Promise<CrmQuote[]> {
  let q = crmDb.from("crm_quotes").select("*").order("created_at", { ascending: false });
  if (leadId) q = q.eq("lead_id", leadId);
  return unwrap(await q);
}
export async function fetchQuoteLines(quoteId: string): Promise<CrmQuoteLine[]> {
  return unwrap(await crmDb.from("crm_quote_lines").select("*").eq("quote_id", quoteId).order("sort_order"));
}

export function stageTone(stage: CrmStage | undefined): string {
  if (!stage) return "bg-muted text-muted-foreground";
  if (stage.is_won) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (stage.is_lost) return "bg-destructive/15 text-destructive";
  if (stage.key === "on_hold") return "bg-muted text-muted-foreground";
  if (stage.sort_order >= 70) return "bg-primary/15 text-primary";
  if (stage.sort_order >= 40) return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-secondary text-secondary-foreground";
}

export function inr(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function leadProbability(lead: CrmLead, stages: CrmStage[]): number {
  if (lead.probability != null) return lead.probability;
  return stages.find((s) => s.key === lead.stage_key)?.probability ?? 0;
}

export function quoteLineMonthly(l: Pick<CrmQuoteLine, "quantity" | "billing_rate">): number {
  return Number(l.quantity || 0) * Number(l.billing_rate || 0);
}

export const QUOTE_TONE: Record<CrmQuote["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/15 text-primary",
  signed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-destructive/15 text-destructive",
};
