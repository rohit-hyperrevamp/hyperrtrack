// Coach-wise bill annexure rows (shared by billing and checker screens).
import { db, rows } from "@/lib/rail-ui";

export async function buildAnnexure(billId: string) {
  const lines = await rows<{ description: string; billing_unit: string; qty: number; rate: number; amount: number; event_coach_id: string | null }>(
    db.from("rail_bill_lines").select("description,billing_unit,qty,rate,amount,event_coach_id").eq("bill_id", billId).is("deleted_at", null).order("description"));
  const ids = lines.map((l) => l.event_coach_id).filter(Boolean);
  const insp = ids.length ? await rows<{ event_coach_id: string; result: string; score: number | null }>(db.from("rail_inspections").select("event_coach_id,result,score").in("event_coach_id", ids)) : [];
  const tasks = ids.length ? await rows<{ event_coach_id: string; task_name: string; photo_path: string | null; status: string }>(db.from("rail_event_tasks").select("event_coach_id,task_name,photo_path,status").in("event_coach_id", ids)) : [];
  return lines.map((l) => ({
    line: l.description, unit: l.billing_unit, qty: l.qty, rate: l.rate, amount: l.amount,
    tasks: tasks.filter((t) => t.event_coach_id === l.event_coach_id && t.status === "done").map((t) => t.task_name).join("; "),
    inspection: insp.filter((i) => i.event_coach_id === l.event_coach_id).map((i) => i.result).join(" → "),
    photos: tasks.filter((t) => t.event_coach_id === l.event_coach_id && t.photo_path).map((t) => t.photo_path).join(" "),
  }));
}

