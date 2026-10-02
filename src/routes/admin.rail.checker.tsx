import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileSignature, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { logActivity } from "@/lib/activity-log";
import { db, Empty, inr, Kpi, railHead, rows, rpc, sha256Hex, StatusPill, toCsv, today } from "@/lib/rail-ui";
import { buildAnnexure } from "@/lib/rail-annexure";

export const Route = createFileRoute("/admin/rail/checker")({
  head: () => railHead("Railway Checker", "Sign-off queue for cleaned coaches and monthly bill annexures awaiting railway signature."),
  component: CheckerPage,
});

type C = { id: string; position: number; status: string; rework_count: number; rail_coaches: { coach_number: string } | null; rail_coach_types: { code: string } | null;
  rail_events: { event_date: string; rail_trains: { number: string } | null; rail_locations: { code: string } | null } | null };
type Bill = { id: string; bill_no: string; bill_month: string; status: string; net_total: number; gross: number; penalty_total: number; rail_contracts: { loa_number: string } | null };

function CheckerPage() {
  const qc = useQueryClient();
  const [signing, setSigning] = useState<Bill | null>(null);
  const [otp, setOtp] = useState("");

  const { data: queue = [] } = useQuery({
    queryKey: ["rail-checker-queue"],
    queryFn: () => rows<C>(db.from("rail_event_coaches").select("id,position,status,rework_count,rail_coaches(coach_number),rail_coach_types(code),rail_events!inner(event_date,rail_trains(number),rail_locations(code))").eq("status", "done").order("updated_at").limit(200)),
  });
  const { data: counts } = useQuery({
    queryKey: ["rail-checker-counts"],
    queryFn: async () => {
      const i = await rows<{ result: string }>(db.from("rail_inspections").select("result").gte("created_at", today()));
      return { pass: i.filter((x) => x.result === "pass").length, fail: i.filter((x) => x.result === "fail").length };
    },
  });
  const { data: bills = [] } = useQuery({
    queryKey: ["rail-checker-bills"],
    queryFn: () => rows<Bill>(db.from("rail_bills").select("id,bill_no,bill_month,status,net_total,gross,penalty_total,rail_contracts(loa_number)").eq("status", "submitted").order("bill_month")),
  });

  async function review(id: string, pass: boolean) {
    const remarks = pass ? null : window.prompt("Reason for rejection?") ?? "Not clean";
    const r = await rpc("rail_review_coach", { _coach: id, _pass: pass, _remarks: remarks }, pass ? "Approved" : "Rejected — sent for rework");
    if (r !== null) {
      void logActivity({ module: "Rail Checker", action: pass ? "approve_coach" : "reject_coach", entityType: "rail_event_coaches", entityId: id });
      qc.invalidateQueries({ queryKey: ["rail-checker-queue"] }); qc.invalidateQueries({ queryKey: ["rail-checker-counts"] });
    }
  }

  async function sign() {
    if (!signing) return;
    const data = await buildAnnexure(signing.id);
    const csv = toCsv(data);
    const hash = await sha256Hex(csv);
    const r = await rpc("rail_bill_advance", { _bill: signing.id, _to: "checker_verified", _otp: otp, _sha256: hash }, "Bill signed");
    if (r !== null) {
      void logActivity({ module: "Rail Checker", action: "sign_bill", entityType: "rail_bills", entityId: signing.id, details: { sha256: hash } });
      setSigning(null); setOtp("");
      qc.invalidateQueries({ queryKey: ["rail-checker-bills"] });
    }
  }

  return (
    <div className="space-y-5">
       <PageHeader title="Railway Checker" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Awaiting sign-off" value={queue.length} tone={queue.length ? "warn" : "default"} />
        <Kpi label="Approved today" value={counts?.pass ?? 0} tone="good" />
        <Kpi label="Rejected today" value={counts?.fail ?? 0} tone={counts?.fail ? "bad" : "default"} />
        <Kpi label="Bills to sign" value={bills.length} />
      </div>

      <section className="space-y-2">
        <h2 className="font-medium">Coaches awaiting sign-off</h2>
        {!queue.length ? <Empty title="Nothing to inspect right now" hint="Coaches appear here as soon as cleaners finish all tasks." /> : (
           <div className="divide-y rounded-lg border bg-card">
            {queue.map((c) => (
               <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-medium">Train {c.rail_events?.rail_trains?.number} · Coach {c.position} {c.rail_coach_types?.code} <span className="text-muted-foreground">{c.rail_coaches?.coach_number}</span></div>
                  <div className="text-xs text-muted-foreground">{c.rail_events?.rail_locations?.code} · {c.rail_events?.event_date}{c.rework_count ? ` · rework ×${c.rework_count}` : ""}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => review(c.id, true)}><CheckCircle2 className="mr-1 h-4 w-4" />Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => review(c.id, false)}><XCircle className="mr-1 h-4 w-4" />Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Bill annexures awaiting signature</h2>
        {!bills.length ? <Empty title="No bills waiting" hint="Submitted monthly bills appear here for your OTP signature." /> : (
           <div className="divide-y rounded-lg border bg-card">
            {bills.map((b) => (
               <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-medium">{b.bill_no}</div>
                  <div className="text-xs text-muted-foreground">{b.rail_contracts?.loa_number} · {b.bill_month.slice(0, 7)} · Gross {inr(b.gross)} − penalties {inr(b.penalty_total)} · Net {inr(b.net_total)}</div>
                </div>
                <div className="flex items-center gap-2"><StatusPill s={b.status} /><Button size="sm" onClick={() => setSigning(b)}><FileSignature className="mr-1 h-4 w-4" />Sign</Button></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!signing} onOpenChange={(o) => !o && setSigning(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sign {signing?.bill_no}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Enter the 4-digit OTP (currently the last four digits of your registered mobile). A fingerprint of the coach-wise annexure is stored with your signature.</p>
          <Input inputMode="numeric" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="OTP" aria-label="OTP" />
          <Button onClick={sign} disabled={otp.length !== 4}>Sign annexure</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
