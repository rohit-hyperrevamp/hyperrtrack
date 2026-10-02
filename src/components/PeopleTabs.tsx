import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Two-option switch shown at the top of every People page: Candidates ↔ Employees. */
export function PeopleTabs({ active }: { active: "candidates" | "employees" }) {
  const base = "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors";
  const on = "bg-primary text-primary-foreground";
  const off = "text-muted-foreground hover:text-foreground";
  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card p-1" role="tablist" aria-label="People">
      <Link to="/admin/hr/recruitment/candidates" role="tab" aria-selected={active === "candidates"} className={cn(base, active === "candidates" ? on : off)}>Candidates</Link>
      <Link to="/admin/rail/people" role="tab" aria-selected={active === "employees"} className={cn(base, active === "employees" ? on : off)}>Employees</Link>
    </div>
  );
}
