import { evaluateExpression, validateExpression } from "@/lib/formula-engine";

export type SalaryComponent = {
  id: string; structure_id: string; code: string; label: string;
  kind: "earning" | "deduction" | "employer"; formula: string;
  area_class: string | null; sort_order: number; enabled: boolean;
  effective_from: string; effective_to: string | null;
};
export type PayInputs = { days: number; rate: number; ed_hours: number; days_in_month: number };
export type SalaryLine = SalaryComponent & { amount: number; error?: string };

export const SALARY_VARIABLES = [
  ["days", "Days present this month"],
  ["rate", "Day rate (Basic + VDA from wage rules)"],
  ["ed_hours", "Extra Duty hours"],
  ["days_in_month", "Calendar days in month"],
  ["gross", "Sum of earnings (use in deductions/employer)"],
] as const;
export const SALARY_FUNCTIONS = "min(a,b) · max(a,b) · round(x) · ceil(x) · floor(x) · if(cond, yes, no) · lte(a,b) · gte(a,b)";

export const checkFormula = validateExpression;

/** Components valid on `onDate`; an area-specific row replaces the all-areas row with the same code. */
export function pickComponents(all: SalaryComponent[], area: string, onDate: string): SalaryComponent[] {
  const live = all.filter((c) => c.effective_from <= onDate && (!c.effective_to || c.effective_to >= onDate) && (!c.area_class || c.area_class === area));
  const byCode = new Map<string, SalaryComponent>();
  for (const c of live) { const prev = byCode.get(c.code); if (!prev || (c.area_class && !prev.area_class)) byCode.set(c.code, c); }
  return [...byCode.values()].filter((c) => c.enabled).sort((a, b) => a.sort_order - b.sort_order);
}

const order = { earning: 0, deduction: 1, employer: 2 } as const;

export function computeSalary(components: SalaryComponent[], inputs: PayInputs) {
  const ctx: Record<string, number> = { ...inputs };
  const lines: SalaryLine[] = [];
  let gross = 0;
  const sorted = [...components].sort((a, b) => order[a.kind] - order[b.kind] || a.sort_order - b.sort_order);
  for (const c of sorted) {
    if (c.kind !== "earning" && ctx.gross === undefined) ctx.gross = gross;
    let amount = 0; let error: string | undefined;
    try { amount = Math.round(evaluateExpression(c.formula, ctx) * 100) / 100; } catch (e) { error = e instanceof Error ? e.message : "Invalid formula"; }
    ctx[c.code] = amount;
    if (c.kind === "earning") gross += amount;
    lines.push({ ...c, amount, error });
  }
  if (ctx.gross === undefined) ctx.gross = gross;
  const sum = (k: SalaryComponent["kind"]) => lines.filter((l) => l.kind === k).reduce((s, l) => s + l.amount, 0);
  const deductions = sum("deduction"); const employer = sum("employer");
  return { lines, gross, deductions, net: gross - deductions, employer, ctc: gross + employer };
}
