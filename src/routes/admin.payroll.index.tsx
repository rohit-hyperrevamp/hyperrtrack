import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/PageHeader";
import { RailTopbarSlot } from "@/components/RailTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "@/components/Skeletons";
import { FinanceCharter } from "@/components/FinanceCharter";
import { PayrollWindowPeriodPicker } from "@/components/PayrollWindowPeriodPicker";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import { CHARTER_UNITS_QK, fetchCharterUnits } from "@/lib/charter-units";
import { usePayrollWindowSelection } from "@/lib/use-payroll-window-selection";
import { useOperationalUnitScope } from "@/lib/use-manager-scope";
import { Kpi, num, railHead } from "@/lib/rail-ui";
import type { MoneyStatus } from "@/lib/period-status";

const searchSchema = z.object({ window: z.string().optional(), month: z.coerce.number().min(0).max(11).optional(), year: z.coerce.number().min(2000).max(2100).optional(), status: z.enum(["open", "ready", "approved", "processed"]).optional() });

export const Route = createFileRoute("/admin/payroll/")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => railHead("Payroll", "Period-to-date payroll by unit, from approved attendance."),
  component: PayrollUnitsPage,
});

function PayrollUnitsPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MoneyStatus>(search.status ?? "all");

  const { data, isLoading, error } = useQuery({
    queryKey: CHARTER_UNITS_QK,
    queryFn: fetchCharterUnits,
  });

  const foScope = useOperationalUnitScope();
  const rawUnits = data?.units ?? [];
  const units = useMemo(
    () => (foScope.isScoped ? rawUnits.filter((u) => foScope.unitIds.has(u.id)) : rawUnits),
    [rawUnits, foScope.isScoped, foScope.unitIds],
  );
  const periodSelection = usePayrollWindowSelection(units.map((unit) => unit.id), search);
  const { monthIdx, year, selectedKey, windowsByUnit, unitIdsForWindow } = periodSelection;
  const windowUnits = useMemo(() => units.filter((unit) => unitIdsForWindow.has(unit.id)), [units, unitIdsForWindow]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return windowUnits.filter((u) => {
      if (unitFilter && u.id !== unitFilter) return false;
      if (term) {
        const hay = [u.customer_name, u.customer_code, u.name, u.code, u.location, ...u.contract_codes]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [q, unitFilter, windowUnits]);

  const anyFilter = unitFilter !== "" || statusFilter !== "all" || q.trim().length > 0;
  const activeEmployees = windowUnits.reduce((s, r) => s + r.active_employee_count, 0);

  return (
    <div className="space-y-5">
      <RailTopbarSlot>
        <div className="flex min-w-0 items-center gap-2">
          <PayrollWindowPeriodPicker options={periodSelection.options} selectedKey={selectedKey} onWindowChange={periodSelection.selectWindow} />
          <MonthYearPicker
            value={`${year}-${String(monthIdx + 1).padStart(2, "0")}`}
            onChange={(ym) => {
              const [y, m] = ym.split("-").map(Number);
              periodSelection.setPeriod(y, m - 1);
            }}
          />
        </div>
      </RailTopbarSlot>

      <PageHeader title="Payroll" description="Period-to-date payroll by unit, from approved attendance. Open a unit for the full register." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kpi label="Units in period" value={num(windowUnits.length)} tone="brand" />
        <Kpi label="Active staff" value={num(activeEmployees)} />
        <Kpi label="Shown below" value={num(filtered.length)} hint={anyFilter ? "Filters on" : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search unit, code, place…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-10 w-full sm:w-64"
          aria-label="Search units"
        />
        <select
          aria-label="Unit"
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="h-10 min-w-44 max-w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground"
        >
          <option value="">All units ({windowUnits.length})</option>
          {windowUnits.map((u) => (
            <option key={u.id} value={u.id}>{u.name || u.code}{u.customer_name ? ` · ${u.customer_name}` : ""}</option>
          ))}
        </select>
        {anyFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={() => {
              setQ("");
              setUnitFilter("");
              setStatusFilter("all");
            }}
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <div className="rounded-2xl border bg-card px-5 py-12 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load payroll units right now."}
        </div>
      ) : (
        <FinanceCharter
          mode="payroll"
          units={filtered}
          monthIdx={monthIdx}
          year={year}
          query={q}
          onQueryChange={setQ}
          windowsByUnit={windowsByUnit}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      )}
    </div>
  );
}
