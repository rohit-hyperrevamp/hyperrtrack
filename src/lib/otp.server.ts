import { SUPER_ADMIN_OTP_PHONE } from "@/lib/otp-config";
import { WIDGET_ID, WIDGET_TOKEN } from "@/lib/otp-widget";

const MSG91_API = "https://control.msg91.com/api/v5";
export type OtpMode = "sms" | "fixed";

export async function resolveOtpMode(phone: string): Promise<OtpMode> {
  if (phone === SUPER_ADMIN_OTP_PHONE) return "fixed";
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("inv_settings" as never)
      .select("value")
      .eq("key", "msg91_otp_enabled")
      .maybeSingle();
    if (error || !data) return "sms";
    const value = (data as unknown as { value?: { enabled?: boolean } }).value;
    return Boolean(value?.enabled ?? true)
      ? "sms"
      : "fixed";
  } catch {
    return "sms";
  }
}

type WidgetVerificationResponse = {
  type?: string;
  status?: string;
  message?: string;
};

export async function verifyMsg91WidgetAccessToken(accessToken: string): Promise<void> {
  const authKey = process.env["MSG91_AUTH_KEY"];
  if (!authKey) throw new Error("SMS service is not configured on this deployment.");

  const response = await fetch(`${MSG91_API}/widget/verifyAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authkey: authKey, "access-token": accessToken }),
  });
  const payload = (await response.json().catch(() => ({}))) as WidgetVerificationResponse;
  if (
    !response.ok ||
    payload.type?.toLowerCase() === "error" ||
    payload.status?.toLowerCase() === "error"
  ) {
    throw new Error(payload.message || "OTP verification failed. Please try again.");
  }
}

export async function verifyMsg91Otp(requestId: string, otp: string): Promise<void> {
  const response = await fetch(`${MSG91_API}/widget/verifyOtp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgetId: WIDGET_ID, tokenAuth: WIDGET_TOKEN, reqId: requestId, otp }),
  });
  const payload = (await response.json().catch(() => ({}))) as WidgetVerificationResponse;
  if (!response.ok || payload.type?.toLowerCase() !== "success") {
    throw new Error(payload.message || "Wrong code. Please try again.");
  }
}