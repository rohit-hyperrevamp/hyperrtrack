import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  OTP_LENGTH,
  SUPER_ADMIN_OTP,
  SUPER_ADMIN_OTP_PHONE as SUPER_ADMIN_PHONE,
} from "@/lib/otp-config";
type OtpMode = "sms" | "fixed";

/**
 * Phone OTP for sign-in.
 *
 * - Real OTPs use MSG91's configured Widget process, which owns the account
 *   default DLT template, SMS channel, four-digit length, retry, and expiry.
 * - The super admin always signs in with the fixed code 2503 (never SMS).
 * - When real OTP is unavailable, regular users cannot sign in. There is no
 *   shared or phone-derived fallback code.
 */


export const sendLoginOtp = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ phone: z.string().regex(/^\d{10}$/) }).parse(input))
  .handler(async ({ data }): Promise<{ mode: OtpMode }> => {
    const { resolveOtpMode } = await import("@/lib/otp.server");
    return { mode: await resolveOtpMode(data.phone) };
  });

export const resendLoginOtp = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ phone: z.string().regex(/^\d{10}$/) }).parse(input))
  .handler(async ({ data }): Promise<{ mode: OtpMode }> => {
    const { resolveOtpMode } = await import("@/lib/otp.server");
    return { mode: await resolveOtpMode(data.phone) };
  });

export const verifyLoginOtp = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        phone: z.string().regex(/^\d{10}$/),
        otp: z.string().regex(/^\d{4}$/),
        requestId: z.string().min(3).optional(),
        accessToken: z.string().min(10).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    if (data.phone === SUPER_ADMIN_PHONE) {
      if (data.otp !== SUPER_ADMIN_OTP) throw new Error("Wrong code. Please try again.");
      return { ok: true };
    }

    const { resolveOtpMode, verifyMsg91Otp, verifyMsg91WidgetAccessToken } = await import("@/lib/otp.server");

    // The fixed code is restricted to the super admin branch above. Regular
    // users must always present an OTP that MSG91 verifies.
    if ((await resolveOtpMode(data.phone)) === "fixed") {
      throw new Error("SMS sign-in is temporarily unavailable. Please contact an administrator.");
    }

    if (data.requestId) {
      await verifyMsg91Otp(data.requestId, data.otp);
    } else if (data.accessToken) {
      await verifyMsg91WidgetAccessToken(data.accessToken);
    } else {
      throw new Error("OTP session expired. Request a new code.");
    }
    return { ok: true };
  });
