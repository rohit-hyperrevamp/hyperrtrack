import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Bell,
  BookOpen,
  Building2,
  Boxes,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Clock,

  Wallet,
  FileText,
  Files,
  Fuel,
  Gauge,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Car,
  CreditCard,
  MapPin,
  Menu,
  PackageOpen,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  UserPlus,
  Users,
  Warehouse,
  Wind,
  Wrench,
  Briefcase,
  Tag,
  UserCheck,
  Moon,
  Sun,
  Radio,
  TrendingUp,
  Search,
  History,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { RailDockPulse } from "@/components/RailDockPulse";
import { RAIL_TOPBAR_SLOT_ID } from "@/components/RailTopbar";
import { MobileBottomNav, type BottomNavItem, type BottomNavMoreItem } from "@/components/MobileBottomNav";
import { useT } from "@/lib/i18n";
import { NotificationBell } from "@/components/NotificationBell";
import { ImpersonationBanner, ViewAsUserButton } from "@/components/ImpersonationControls";
import { AppleNativeSetupCard } from "@/components/AppleNativeSetupCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { readStoredAuthUser, useAuth } from "@/lib/auth";
import { useMe } from "@/lib/use-me";
import { SaveConfirmGuard } from "@/components/SaveConfirmGuard";
import { useCurrentPermissions } from "@/lib/rbac";
import { RoutePermissionGuard } from "@/components/RoutePermissionGuard";
import { RBAC_MODULES } from "@/lib/rbac-modules";
import { TrainFront, ScanEye, Rows3, Smartphone, ClipboardCheck, Leaf, UsersRound, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/lib/use-theme";
import { isNativePlatform } from "@/lib/native";
import { toast } from "sonner";
import { isAdminConsoleRole, isFieldOfficerRole, OPERATIONS_ROLES } from "@/lib/role-keys";
import { RAIL_PAGE_MODULES, railHomeForAccess, useRailPageAccess } from "@/lib/rail-page-access";




export const Route = createFileRoute("/admin")({
  // The signed-in shell depends on the browser session, so server HTML can only
  // ever be a throwaway guess that React then has to discard and re-render.
  ssr: false,
  component: AdminLayout,
});

type LeafItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  search?: Record<string, unknown>;
  sub?: string; // optional sub-module key for RBAC filtering
  adminOnly?: boolean; // only super admins & inventory managers
};

type GroupItem = {
  key: string;
  label: string;
  sub?: string; // optional sub-module key for RBAC filtering on top-level entries
  icon: React.ComponentType<{ className?: string }>;
  module?: string;
  to?: string;
  children?: LeafItem[];
  activePrefixes?: string[];
  exact?: boolean;
};


const controlCenterChildren: LeafItem[] = [];

const railChildren: LeafItem[] = [
  { to: "/admin/rail/command", label: "Overview", icon: Gauge },
  { to: "/admin/rail/live", label: "Operations", icon: Rows3 },
  { to: "/admin/rail/me", label: "My Shift", icon: Smartphone },
  { to: "/admin/rail/checker", label: "Checks", icon: FileSignature },
  { to: "/admin/rail/quality", label: "Quality", icon: ClipboardCheck },
  { to: "/admin/rail/supplies", label: "Supplies", icon: Boxes },
  { to: "/admin/rail/sustainability", label: "Resources", icon: Leaf },
  { to: "/admin/rail/billing", label: "Billing", icon: Receipt },
  { to: "/admin/rail/people", label: "Team", icon: UsersRound },
  { to: "/admin/rail/settings", label: "Configuration Hub", icon: SlidersHorizontal },
  { to: "/admin/rail/ai-check", label: "Photo Check", icon: ScanEye },
];

const salesChildren: LeafItem[] = [
  { to: "/admin/sales/dashboard", label: "Sales Dashboard", icon: LayoutDashboard },
  { to: "/admin/sales/prospects", label: "Prospects", icon: Users },
  { to: "/admin/sales/quotes", label: "Quotes", icon: FileText },
];

const recruitmentChildren: LeafItem[] = [
  { to: "/admin/hr/recruitment/dashboard", label: "Recruitment Dashboard", icon: LayoutDashboard },
  { to: "/admin/hr/recruitment/candidates", label: "Candidates", icon: Users },
  { to: "/admin/hr/recruitment/openings", label: "Openings", icon: FileText },
  { to: "/admin/hr/recruitment/interviews", label: "My Interviews", icon: Clock },
  { to: "/admin/hr/recruitment/onboarding", label: "Onboarding Requests", icon: UserPlus },
];


const vehiclesChildren: LeafItem[] = [
  { to: "/admin/vehicles/inventory", label: "Vehicle Inventory", icon: Car, sub: "vehicle_inventory" },
  { to: "/admin/vehicles/fastags", label: "FastTag Manager", icon: CreditCard, sub: "fastag_manager" },
  { to: "/admin/vehicles/insurances", label: "Insurance Manager", icon: ShieldCheck, sub: "insurance_manager" },
  { to: "/admin/vehicles/pucs", label: "PUC Manager", icon: Wind, sub: "puc_manager" },
  { to: "/admin/vehicles/service-manager", label: "Service Manager", icon: Wrench, sub: "service_manager" },
  { to: "/admin/vehicles/expense-manager", label: "Expense Manager", icon: Fuel, sub: "expense_manager" },
];

const assetsChildren: LeafItem[] = [
  { to: "/admin/assets/inventory", label: "Asset Inventory", icon: Home, sub: "asset_inventory" },
  { to: "/admin/assets/loan-manager", label: "Loan Manager", icon: Banknote, sub: "loan_manager" },
  { to: "/admin/assets/expense-manager", label: "Expense Manager", icon: Receipt, sub: "expense_manager" },
];

const inventoryChildren: LeafItem[] = [
  { to: "/admin/inventory", label: "Uniform Command Center", icon: LayoutDashboard },
  { to: "/admin/inventory/items", label: "Products", icon: PackageOpen, sub: "item_master" },
  { to: "/admin/inventory/vendors", label: "Vendors", icon: ShoppingBag, sub: "vendors" },
  { to: "/admin/inventory/warehouses", label: "Warehouses", icon: Warehouse, sub: "warehouses" },
  { to: "/admin/inventory/purchase-orders", label: "Purchase Orders", icon: FileText, sub: "purchase_orders" },
  { to: "/admin/inventory/demands", label: "Demands", icon: Inbox, sub: "demands" },
  { to: "/admin/inventory/goods-receipts", label: "Delivery Challans", icon: ClipboardList, sub: "goods_receipts" },
  { to: "/admin/inventory/transfers", label: "Transfers", icon: Boxes, sub: "transfers" },
  { to: "/admin/inventory/issuances", label: "Issuances", icon: UserPlus, sub: "issuances" },
  { to: "/admin/inventory/collections", label: "Collections", icon: Inbox, sub: "collections" },

  { to: "/admin/inventory/stock", label: "Stock Report", icon: Wallet, sub: "stock_report" },
  { to: "/admin/inventory/stock-ledger", label: "Stock Ledger", icon: Banknote, sub: "stock_ledger" },
  { to: "/admin/inventory/rate-cards", label: "Vendor Rate Cards", icon: FileText, sub: "rate_cards" },
  { to: "/admin/inventory/caps", label: "Uniform Cap", icon: Gauge, adminOnly: true },
];




const fieldSenseChildren: LeafItem[] = [
  { to: "/admin/field-sense", label: "Dashboard", icon: LayoutDashboard, sub: "dashboard" },
  { to: "/admin/field-sense/team", label: "Day Patrol", icon: Users, sub: "day_patrol" },
  { to: "/admin/field-sense/expenses", label: "Expense Manager", icon: Wallet, sub: "expense_manager" },
  { to: "/admin/field-sense/reports", label: "Reports", icon: FileText, sub: "reports" },
  { to: "/admin/field-sense/attendance-rules", label: "Attendance Rules", icon: MapPin, sub: "day_patrol" },
];

const controlCenterRadarChildren: LeafItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/field-sense/team", label: "Day Patrol", icon: Users, sub: "day_patrol" },
  { to: "/admin/field-sense/expenses", label: "Expense Manager", icon: Wallet, sub: "expense_manager" },
  { to: "/admin/field-sense/reports", label: "Reports", icon: FileText, sub: "reports" },
  { to: "/admin/field-sense/attendance-rules", label: "Attendance Rules", icon: MapPin, sub: "day_patrol" },
];



function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `+91 ••• ••• ${d.slice(-4)}`;
}
// Derived path→(module,sub) map from the RBAC registry so any sub-module route
// can be gated by canSub without hand-maintaining a duplicate list.
const subPathList: { prefix: string; module: string; sub: string }[] = (() => {
  const list: { prefix: string; module: string; sub: string }[] = [];
  for (const m of RBAC_MODULES) {
    for (const s of m.subModules) {
      if (s.path) list.push({ prefix: s.path, module: m.key, sub: s.key });
    }
  }
  return list.sort((a, b) => b.prefix.length - a.prefix.length);
})();


function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout, isReady } = useAuth();
  const me = useMe();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { can, canSub, isLoading: permsLoading, isSuperAdmin: isRbacSuperAdmin, roleKey } = useCurrentPermissions();
  // useAuth and RBAC hydrate in separate hook instances. Preserve the explicit
  // authenticated role during that hand-off so the route guard cannot issue a
  // one-way frontline redirect before RBAC catches up.
  const isSuperAdmin = user?.role === "super_admin" || isRbacSuperAdmin;
  // Rail staff sign in with a candidates row whose role_key is "rail_<role>".
  // Their access is decided by rail roles in the database, not the legacy RBAC matrix.
  const isRailRole = !!roleKey && roleKey.startsWith("rail_");
  const { data: railPageAccess } = useRailPageAccess(isRailRole && !isSuperAdmin);
  const isGuardRole = !isSuperAdmin && !isRailRole && !can("rail_ops");

  const dashboardHref =
    isRailRole && !isSuperAdmin
      ? railHomeForAccess(railPageAccess, roleKey)
      : isGuardRole || (!isSuperAdmin && !can("rail_ops"))
        ? "/admin/dashboard"
        : "/admin/rail/command";


  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [nativeShell, setNativeShell] = useState(false);
  const { theme, toggle: toggleTheme, mounted: themeMounted } = useTheme();

  useEffect(() => {
    setNativeShell(isNativePlatform());
  }, []);

  // One-time backfill of stored public URLs → signed URLs after buckets were privatized.
  useEffect(() => {
    if (!isSuperAdmin) return;
    const key = "radiant.backfill.signed-urls.v1";
    if (typeof window === "undefined" || window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "running");
    (async () => {
      try {
        const mod = await import("@/lib/backfill-signed-urls.functions");
        const res = await mod.backfillSignedUrls();
        window.localStorage.setItem(key, JSON.stringify({ done: true, at: Date.now(), res }));
        console.info("[backfill] signed URLs", res);
      } catch (e) {
        window.localStorage.removeItem(key);
        console.error("[backfill] failed", e);
      }
    })();
  }, [isSuperAdmin]);

  const pathToModule: { prefix: string; module: string }[] = [
    { prefix: "/admin/customers", module: "organizations" },
    { prefix: "/admin/contracts", module: "contracts" },
    { prefix: "/admin/sales", module: "sales_marketing" },
    { prefix: "/admin/rail", module: "rail_ops" },
    { prefix: "/admin/employees", module: "employees" },
    { prefix: "/admin/deductions", module: "payroll" },
    { prefix: "/admin/additions", module: "payroll" },
    { prefix: "/admin/deduction-type-manager", module: "control_center" },
    { prefix: "/admin/addition-type-manager", module: "control_center" },
    { prefix: "/admin/vehicles", module: "vehicles" },
    { prefix: "/admin/assets", module: "assets" },
    { prefix: "/admin/inventory", module: "inventory" },
    { prefix: "/admin/attendance", module: "attendance" },
    { prefix: "/admin/payroll", module: "payroll" },
    { prefix: "/admin/invoice", module: "invoice" },
    { prefix: "/admin/rbac", module: "rbac" },
    { prefix: "/admin/control-center", module: "control_center" },
    { prefix: "/admin/professional-tax-manager", module: "control_center" },
    { prefix: "/admin/lwf-manager", module: "control_center" },
    { prefix: "/admin/duty-manager", module: "control_center" },
    { prefix: "/admin/service-type-manager", module: "control_center" },
    { prefix: "/admin/payroll-manager", module: "control_center" },
    { prefix: "/admin/payroll-days-manager", module: "control_center" },
    { prefix: "/admin/allowance-manager", module: "control_center" },
    { prefix: "/admin/billing-type-manager", module: "control_center" },
    { prefix: "/admin/invoice-numbering", module: "control_center" },
    { prefix: "/admin/designation-manager", module: "control_center" },
    { prefix: "/admin/department-manager", module: "control_center" },
    { prefix: "/admin/platform-settings", module: "control_center" },
    { prefix: "/admin/cost-component-manager", module: "control_center" },
    { prefix: "/admin/ex-service-manager", module: "control_center" },
    { prefix: "/admin/offboarding-reason-manager", module: "control_center" },
    { prefix: "/admin/language-manager", module: "control_center" },
    { prefix: "/admin/company-documents", module: "control_center" },
    { prefix: "/admin/policy-manager", module: "control_center" },
    { prefix: "/admin/system-logs", module: "control_center" },
    { prefix: "/admin/asset-manager", module: "control_center" },
    { prefix: "/admin/attendance-code-manager", module: "control_center" },
    { prefix: "/admin/public-holiday-manager", module: "control_center" },
    { prefix: "/admin/esic-branch-manager", module: "control_center" },
    { prefix: "/admin/mis-manager", module: "control_center" },
    { prefix: "/admin/migration-utility", module: "control_center" },
    { prefix: "/admin/org-settings", module: "control_center" },
  ];
  useEffect(() => {
    if (!isReady || permsLoading || !user) return;
    // Re-read the verified login snapshot at effect execution time. An effect
    // queued by the pre-RBAC render must not redirect a restored administrator
    // to the employee dashboard after the correct dashboard navigation.
    if (readStoredAuthUser()?.role === "super_admin") return;
    if (!isRailRole && (pathname === "/admin/hr/recruitment/interviews" || /^\/admin\/hr\/recruitment\/candidates\/[^/]+$/.test(pathname))) return;
    // Accounts without rail access see an access message, not legacy security tools.
    if (isGuardRole) {
      if (pathname === "/admin/dashboard" || pathname === "/admin/profile" || pathname === "/admin/notifications") return;
      navigate({ to: "/admin/dashboard", replace: true });
      return;
    }
    if (isRailRole && !isSuperAdmin && !pathname.startsWith("/admin/rail") && pathname !== "/admin/profile" && !pathname.startsWith("/admin/notifications")) {
      navigate({ to: dashboardHref, replace: true });
      return;
    }
    const hit = pathToModule.find((p) => pathname === p.prefix || pathname.startsWith(p.prefix + "/"));
    if (!hit) return;
    if (hit.module === "rail_ops" && isRailRole) return;
    if (isRailRole && !isSuperAdmin) {
      navigate({ to: dashboardHref, replace: true });
      return;
    }
    if (!can(hit.module)) {
      // Never hop to an unrelated module: a denied page returns the user to
      // their own dashboard, so a link never appears to open a different tool.
      navigate({ to: dashboardHref, replace: true });
      return;
    }
    // Sub-module gating: enforce canSub for any known sub-module path.
    const subHit = subPathList.find((p) => pathname === p.prefix || pathname.startsWith(p.prefix + "/"));
    if (subHit) {
      if (subHit.module === "inventory" && ["demands", "goods_receipts", "collections", "issuances"].includes(subHit.sub) && roleKey === "field_officer") return;
      if (!canSub(subHit.module, subHit.sub)) {
        // Return to the actual module hub. Never choose the first child route,
        // which previously sent denied Control Center links to Deduction Types.
        const modulePath = RBAC_MODULES.find((m) => m.key === subHit.module)?.path;
        const dest = modulePath && can(subHit.module) ? modulePath : dashboardHref;
        navigate({ to: dest, replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, permsLoading, isSuperAdmin, isReady, roleKey]);


  useEffect(() => {
    if (!isReady) return;
    if (!user) navigate({ to: "/login", replace: true });
  }, [user, isReady, navigate]);

  // Offboarding gate: if a signed-in employee is deactivated, sign them out.
  useEffect(() => {
    if (!isReady || !user || isSuperAdmin) return;
    let alive = true;
    let strikes = 0;
    const check = async () => {
      try {
        const { data } = await supabase.rpc("is_current_employee_active" as never);
        if (!alive) return;
        if (data === false) {
          // Two consecutive definite "disabled" answers before signing out, so a
          // single flaky call can never log an active user out.
          strikes += 1;
          if (strikes < 2) return;
          toast.error("Your access has been disabled. Signing you out.");
          logout();
        } else if (data === true) {
          strikes = 0;
        }
      } catch { /* ignore transient */ }
    };
    void check();
    const t = setInterval(check, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, [isReady, user, isSuperAdmin, logout]);

  // Session hydration is handled once by the root shell. This listener only
  // tears down signed-in data on logout; duplicating sign-in invalidation here
  // caused every expensive screen query to start again.
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.clear();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);


  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    navigate({ to: "/login", replace: true });
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");
  const visibleGroups: GroupItem[] = (() => {
    if (isRailRole || isSuperAdmin || can("rail_ops")) {
      const links = isSuperAdmin ? railChildren : railChildren.filter((c) => {
        const section = c.to.split("/")[3];
        return section && railPageAccess?.[RAIL_PAGE_MODULES[section]] === true;
      });
      const accessible = isSuperAdmin ? [...links, { to: "/admin/system-logs", label: "Activity Log", icon: History }] : links;
      return accessible.map((c) => ({ key: c.to, label: c.label, icon: c.icon, to: c.to, activePrefixes: [c.to], exact: true }));
    }
    return [];
  })();


  const isGroupActive = (g: GroupItem) =>
    (g.activePrefixes ?? []).some((p) => {
      if (g.exact) return pathname === p;
      return pathname === p || pathname.startsWith(p + "/");
    });

  const sidebarWidth = collapsed ? "lg:w-[72px]" : "lg:w-[244px]";
  const mainOffset = nativeShell ? "" : collapsed ? "lg:ml-24" : "lg:ml-[260px]";
  // One HyperTrack shell for every signed-in page (profile, notifications, etc.).
  const railWorkspace = true;

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={100}>
    <div data-rail-shell={railWorkspace ? "" : undefined} data-rail-collapsed={collapsed ? "" : undefined} className={cn(
      "relative flex min-h-[100dvh] min-w-0 flex-col lg:block lg:min-h-screen",
    )}>
      <AppleNativeSetupCard autoStart nativeOnly className="hidden" />
      <ImpersonationBanner />
      {/* Soft tinted canvas — clean glass backdrop, no grid */}
      <div className="pointer-events-none fixed inset-0 z-0 app-canvas" />





      {/* Desktop rail dock: every accessible destination is a direct link. */}
      <aside
        className={cn(
          "fixed inset-y-3 left-3 z-30 hidden flex-col rounded-lg border border-dock-foreground/10 bg-dock text-dock-foreground shadow-lg transition-[width] duration-300 lg:flex animate-slide-in-left",
          nativeShell && "lg:hidden",
          sidebarWidth,
        )}
        data-hyper-dock
      >
        {/* Brand */}
          <div className={cn("flex items-center px-2.5 pt-5 pb-5", collapsed && "justify-center px-2")}>
          {collapsed ? (
            <Link
              to={dashboardHref}
              aria-label="HyperTrack home"
               className="mx-auto grid h-11 w-11 place-items-center rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&>div>span]:h-11 [&>div>span]:w-11"
            >
              <BrandMark compact />
            </Link>
          ) : (
            <Link to={dashboardHref} aria-label="HyperTrack home" className="rail-brand-link flex h-12 w-full min-w-0 items-center gap-2.5 px-2.5 text-foreground">
              <BrandMark compact />
              <BrandMark />
            </Link>
          )}
        </div>

        {!collapsed && railWorkspace && <div className="rail-dock-intro px-4 pb-5 pt-2"><div className="font-heading text-2xl font-medium leading-tight">Welcome back,<br />{me.fullName?.split(" ")[0] || "team"}.</div><div className="mt-1 text-xs text-muted-foreground">Rail operations at a glance</div></div>}

        {/* Nav — grouped like the reference portal (Menu / Operations / Finance / Admin) */}
        <nav className={cn("scrollbar-hide flex-1 overflow-y-auto pb-3", collapsed ? "px-2" : "px-2.5")}>
          {(() => {
            const sections: Array<{ label: string; keys: string[] }> = [
              { label: "Rail operations", keys: visibleGroups.map((g) => g.key) },
            ];
            const used = new Set<string>();
            return (
              <div className={collapsed ? "space-y-1.5" : "space-y-3"}>
                {sections.map((s) => {
                  const items = visibleGroups.filter((g) => s.keys.includes(g.key));
                  if (items.length === 0) return null;
                  items.forEach((g) => used.add(g.key));
                  return (
                    <div key={s.label} className="space-y-[3px]">
                      {!collapsed && s.label && (
                         <div className="px-2.5 pt-1 pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-dock-foreground/40">
                          {s.label}
                        </div>
                      )}
                      {items.map((g) => (
                        <SidebarGroup key={g.key} group={g} collapsed={collapsed} isActive={isActive} groupActive={isGroupActive(g)} />
                      ))}
                    </div>
                  );
                })}
                {(() => {
                  const rest = visibleGroups.filter((g) => !used.has(g.key));
                  if (rest.length === 0) return null;
                  return (
                    <div className="space-y-[3px]">
                      {!collapsed && (
                         <div className="px-2.5 pt-1 pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-dock-foreground/40">More</div>
                      )}
                      {rest.map((g) => (
                        <SidebarGroup key={g.key} group={g} collapsed={collapsed} isActive={isActive} groupActive={isGroupActive(g)} />
                      ))}
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </nav>

        {!collapsed && railWorkspace && visibleGroups.some((g) => g.to === "/admin/rail/command") && <RailDockPulse />}

        {/* Footer: user + collapse */}
        <div className={cn("rail-dock-account mt-4 p-3 pt-5", collapsed ? "space-y-3" : "space-y-2")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                aria-label="Account menu"
                 className={cn(
                   "flex h-12 w-full items-center justify-start gap-2.5 rounded-lg border-0 bg-transparent p-2 text-sm font-semibold text-dock-foreground hover:bg-muted",
                  collapsed && "mx-auto h-11 w-11 justify-center rounded-full p-0",
                )}
              >
                <span className={cn(
                  "relative grid shrink-0 place-items-center overflow-hidden bg-brand text-primary-foreground text-[11px] font-bold",
                   collapsed ? "h-11 w-11 rounded-full" : "h-9 w-9 rounded-full",
                )}>
                  {me.photoUrl ? (
                    <img src={me.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
                  ) : (
                    me.initials
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-[13px] font-semibold leading-tight">
                        {me.fullName || (user?.phone ? maskPhone(user.phone) : "Account")}
                      </span>
                      {me.designation && (
                        <span className="block truncate text-[11px] font-medium capitalize text-muted-foreground">
                          {me.designation}
                        </span>
                      )}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" sideOffset={10} className="w-60 rounded-2xl">
              <DropdownMenuLabel>
                <div className="text-sm font-semibold">
                  {me.fullName || (user?.phone ? maskPhone(user.phone) : "Account")}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {me.designation || user?.role?.replace("_", " ")}
                </div>
                {user?.phone && (
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground/80">
                    {maskPhone(user.phone)}
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/profile" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme} className="gap-2">
                {themeMounted && theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {themeMounted && theme === "dark" ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isSuperAdmin && <div className={cn("flex items-center gap-2 px-2 text-xs font-medium text-dock-foreground", collapsed && "justify-center px-0")}>
            <ViewAsUserButton className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-foreground hover:bg-brand hover:text-primary-foreground" />
            {!collapsed && <span>View as user</span>}
          </div>}

          <Button
            type="button"
            variant="ghost"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
               "flex h-10 w-full items-center justify-start gap-2.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "mx-auto h-11 w-11 justify-center rounded-full p-0",
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
          </Button>

        </div>
      </aside>

      {/* Contextual top bar: page title + controls the current page portals in (date, filters, actions). */}
      {railWorkspace && <div className="rail-topbar flex">
        <div className="rail-topbar-title hidden min-w-0 shrink-0 lg:block">
          <div className="truncate text-sm font-semibold">{railChildren.find((c) => pathname === c.to || pathname.startsWith(c.to + "/"))?.label ?? (pathname.split("/").filter(Boolean).pop() ?? "").replace(/[-_]/g, " ").replace(/^./, (s) => s.toUpperCase())}</div>
        </div>
        <div id={RAIL_TOPBAR_SLOT_ID} className="rail-topbar-slot scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto" />
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Button type="button" variant="ghost" size="icon" title="Search (Ctrl+K)" aria-label="Search" onClick={() => window.dispatchEvent(new Event("rail-search-toggle"))} className="rail-topbar-icon"><Search className="h-4 w-4" /></Button>
          <NotificationBell triggerClassName="rail-topbar-icon" />
        </div>
      </div>}

      {/* Mobile top bar — compact native-app chrome */}
      <header data-app-header className={cn(
         "sticky top-0 z-20 grid min-h-[48px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-1 animate-slide-in-top safe-top safe-x",
         "border-b border-border/50 bg-card/90",
        !nativeShell && "lg:hidden",
      )}>
        <Link to={dashboardHref} className="flex min-w-0 items-center gap-2">
          <div className="relative shrink-0 [&>div>span]:h-7 [&>div>span]:w-7 [&>div>span]:text-[10px]">
            <BrandMark compact />
          </div>
          <BrandMark className="min-w-0 [&>span]:text-[14px]" />
        </Link>
        <div className="flex shrink-0 items-center">
           {pathname.startsWith("/admin/rail/") && <Button type="button" variant="ghost" size="icon" title="Search" aria-label="Search" onClick={() => window.dispatchEvent(new Event("rail-search-toggle"))} className="h-10 w-10 rounded-full bg-muted text-foreground"><Search className="h-5 w-5" /></Button>}
          {isSuperAdmin && <ViewAsUserButton />}
          <NotificationBell />
          <Link
            to="/admin/profile"
            aria-label="Profile"
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-foreground outline-none transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15"
          >
            {me.photoUrl ? (
              <img
                src={me.photoUrl}
                alt={me.fullName || "Profile"}
                className="absolute inset-1.5 h-8 w-8 rounded-full object-cover object-center ring-1 ring-border/60"
              />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-[12px] font-bold ring-1 ring-border/60">{me.initials || "U"}</span>
            )}
          </Link>
        </div>
      </header>





      {/* Main */}
      <main data-admin-scroll data-rail-workspace={railWorkspace ? "" : undefined} className={cn("relative z-10 min-h-0 min-w-0 flex-1 overflow-y-visible safe-x py-2 !pb-[calc(82px+env(safe-area-inset-bottom))] transition-[margin] duration-300 sm:px-6 sm:py-6 lg:min-h-[calc(100dvh-3.5rem)] lg:py-8 lg:pr-6 lg:!pb-8", mainOffset)}>


        <div className={cn("min-w-0", !pathname.startsWith("/admin/rail") && "mx-auto max-w-[1500px]")}>
          <div
            key={pathname}
            className={cn(!pathname.startsWith("/admin/payroll/") && "page-enter")}
          >
            {isReady && user && !permsLoading ? (
              <RoutePermissionGuard>
                <SaveConfirmGuard />
                <Outlet />
              </RoutePermissionGuard>
            ) : (
              <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile bottom tab bar — primary destinations + More opens full drawer */}
      {(() => {
        const bottomItems: BottomNavItem[] = visibleGroups.slice(0, 4).map((g) => ({
            key: g.key,
            label: g.label,
            icon: g.icon,
            to: g.to,
            active: isGroupActive(g),
        }));
        const moreItems: BottomNavMoreItem[] = visibleGroups.flatMap((g) => {
              const to = g.to ?? g.children?.[0]?.to;
              return to ? [{ key: g.key, to, label: g.label, icon: g.icon, active: isGroupActive(g) }] : [];
            });
        const addMoreItem = (item: BottomNavMoreItem) => {
          if (!moreItems.some((entry) => entry.to === item.to)) moreItems.push(item);
        };
        return (
          <MobileBottomNav
            items={bottomItems}
            onMore={() => setMobileOpen((open) => !open)}
            moreActive={mobileOpen}
            moreItems={moreItems}
            railStyle={railWorkspace}
          />
        );
      })()}
    </div>
    </TooltipProvider>
  );
}

function SidebarGroup({
  group,
  collapsed,
  isActive,
  groupActive,
}: {
  group: GroupItem;
  collapsed: boolean;
  isActive: (p: string) => boolean;
  groupActive: boolean;
}) {
  const [open, setOpen] = useState(groupActive);
  const Icon = group.icon;
  const t = useT();

  useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive]);

  const itemBase =
     "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-[background-color,color] duration-200";
   const itemIdle = "text-foreground hover:bg-muted hover:text-foreground";
  const itemActive =
      "bg-brand text-primary-foreground shadow-sm hover:bg-brand hover:text-primary-foreground";

   const iconSpanBase = "grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors";
    const iconSpanActive = "bg-primary-foreground text-brand";
     const iconSpanIdle = "bg-muted text-foreground group-hover:bg-border group-hover:text-foreground";
  // Collapsed rail: neutral until selected, when the icon turns solid blue.
  const collapsedItem = "h-11 w-11 mx-auto justify-center rounded-full p-0";
  const collapsedIcon =
    "grid h-11 w-11 place-items-center rounded-full transition-all duration-200";
   const collapsedIconActive =
       "bg-brand text-primary-foreground shadow-sm";
   const collapsedIconIdle =
       "bg-muted text-foreground hover:bg-muted-foreground/25";

  if (!group.children || group.children.length === 0) {
    const link = (
      <Link
        to={group.to!}
        aria-label={collapsed ? group.label : undefined}
        data-no-tip
       className={
          collapsed
              ? cn(collapsedIcon, "mx-auto", groupActive ? collapsedIconActive : collapsedIconIdle)
            : cn(itemBase, groupActive ? itemActive : itemIdle)
        }
      >
        {collapsed ? (
          <Icon className="h-[18px] w-[18px]" />
        ) : (
          <>
              <span className={cn(iconSpanBase, groupActive ? iconSpanActive : iconSpanIdle)}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="truncate">{t(group.label)}</span>
          </>
        )}
      </Link>
    );
    if (!collapsed) return link;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="font-medium">
          {t(group.label)}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (collapsed) {
    return (
      <CollapsedGroupPopover
        group={group}
        groupActive={groupActive}
        isActive={isActive}
        itemBase={itemBase}
        itemIdle={itemIdle}
        itemActive={itemActive}
        iconSpanBase={iconSpanBase}
        iconSpanIdle={iconSpanIdle}
        iconSpanActive={iconSpanActive}
        Icon={Icon}
      />
    );
  }

  return (
    <div>
      {group.to ? (
        <div className={cn(itemBase, "gap-1 pr-1", groupActive ? itemActive : itemIdle)}>
          <Link
            to={group.to}
            className="flex flex-1 items-center gap-2.5 min-w-0"
          >
            <span className={cn(iconSpanBase, groupActive ? iconSpanActive : iconSpanIdle)}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 truncate text-left">{t(group.label)}</span>
          </Link>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
            aria-label={open ? "Collapse" : "Expand"}
            className="grid h-6 w-6 place-items-center rounded-md hover:bg-white/10"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition-transform", open ? "rotate-0" : "-rotate-90")} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(itemBase, groupActive ? itemActive : itemIdle)}
        >
          <span className={cn(iconSpanBase, groupActive ? iconSpanActive : iconSpanIdle)}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="flex-1 truncate text-left">{t(group.label)}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 opacity-50 transition-transform", open ? "rotate-0" : "-rotate-90")} />
        </button>
      )}
      {open && (
        <div className="mt-0.5 ml-[22px] space-y-0.5 border-l border-border pl-3">
          {group.children.map((c) => {
            const a = isActive(c.to);
            return (
              <Link
                key={c.to}
                to={c.to}
                search={c.search as never}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                  a
                    ? "bg-brand text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
               <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md", a ? "bg-brand text-primary-foreground" : "bg-brand/20 text-brand")}><c.icon className="h-3.5 w-3.5" /></span>
                <span className="truncate">{t(c.label)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileGroup({
  group,
  isActive,
  isGroupActive,
}: {
  group: GroupItem;
  isActive: (p: string) => boolean;
  isGroupActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = group.icon;
  const t = useT();
  if (!group.children || group.children.length === 0) {
    return (
      <Link
        to={group.to!}
        className={cn(
          "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
          isGroupActive
            ? "bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-accent ring-1 ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]"
            : "text-foreground hover:bg-accent/10 hover:text-accent",
        )}
      >
        <Icon className="h-4 w-4" />
        {t(group.label)}
      </Link>
    );
  }
  return (
    <div>
      {group.to ? (
        <div
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isGroupActive
              ? "bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-accent ring-1 ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]"
              : "text-foreground hover:bg-accent/10 hover:text-accent",
          )}
        >
          <Link to={group.to} className="flex flex-1 items-center gap-2.5 min-w-0">
            <Icon className="h-4 w-4" />
            <span className="flex-1 truncate text-left">{t(group.label)}</span>
          </Link>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
            aria-label={open ? "Collapse" : "Expand"}
            className="grid h-7 w-7 place-items-center rounded-md hover:bg-foreground/10"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-0" : "-rotate-90")} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isGroupActive
              ? "bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-accent ring-1 ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]"
              : "text-foreground hover:bg-accent/10 hover:text-accent",
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="flex-1 text-left">{t(group.label)}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-0" : "-rotate-90")} />
        </button>
      )}
      {open && (
        <div className="mt-1 space-y-0.5 pl-4">
          {group.children.map((c) => {
            const a = isActive(c.to);
            return (
              <Link
                key={c.to}
                to={c.to}
                search={c.search as never}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  a
                    ? "bg-[color-mix(in_oklab,var(--accent)_10%,white)] text-accent ring-1 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]"
                    : "text-foreground/80 hover:bg-accent/10 hover:text-accent",
                )}
              >
                <c.icon className="h-4 w-4 opacity-80" />
                <span className="truncate">{t(c.label)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CollapsedGroupPopover({
  group,
  groupActive,
  isActive,
  itemBase,
  itemIdle,
  itemActive,
  iconSpanBase,
  iconSpanIdle,
  iconSpanActive,
  Icon,
}: {
  group: GroupItem;
  groupActive: boolean;
  isActive: (p: string) => boolean;
  itemBase: string;
  itemIdle: string;
  itemActive: string;
  iconSpanBase: string;
  iconSpanIdle: string;
  iconSpanActive: string;
  Icon: GroupItem["icon"];
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t(group.label)}
          aria-expanded={open}
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
          onFocus={() => {
            cancelClose();
            setOpen(true);
          }}
          onBlur={scheduleClose}
          className={cn(
            "mx-auto grid h-11 w-11 place-items-center rounded-full transition-all duration-200",
            groupActive
              ? "bg-brand text-primary-foreground shadow-sm"
              : "bg-muted text-foreground hover:bg-brand/10 hover:text-brand",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </button>
      </PopoverTrigger>
      {group.children && (
        <PopoverContent
          side="right"
          align="start"
          sideOffset={12}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-60 rounded-2xl border border-border/50 bg-card/95 p-2 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {t(group.label)}
          </div>
          <div className="space-y-0.5">
            {group.children.map((c) => {
              const a = isActive(c.to);
              return (
                <Link
                  key={c.to}
                  to={c.to}
                  search={c.search as never}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    a
                      ? "bg-accent/10 text-accent"
                      : "text-foreground/80 hover:bg-accent/10 hover:text-accent",
                  )}
                >
                  <c.icon className="h-4 w-4" />
                  <span className="truncate">{t(c.label)}</span>
                </Link>
              );
            })}
          </div>
        </PopoverContent>
      )}
    </Popover>

  );
}
