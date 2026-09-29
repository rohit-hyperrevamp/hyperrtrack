import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const allowedCallers = new Set([
  "https://radiant.hyperrevamp.com",
  "https://radiant-guard-services.lovable.app",
]);

const requestSchema = z.object({
  action: z.enum(["send", "verify"]),
  phone: z.string().regex(/^\d{10}$/),
  otp: z.string().regex(/^\d{4}$/).optional(),
});

export const Route = createFileRoute("/api/public/otp-relay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        const caller = request.headers.get("x-radiant-caller");
        if ((!origin || !allowedCallers.has(origin)) && caller !== "radiant-production-shell") {
          return Response.json({ message: "Not allowed" }, { status: 403 });
        }

        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ message: "Invalid request" }, { status: 400 });
        }

        const { assertRegisteredPhone, sendMsg91Otp, verifyMsg91PhoneOtp } = await import(
          "@/lib/otp.server"
        );
        await assertRegisteredPhone(parsed.data.phone);
        if (parsed.data.action === "send") {
          await sendMsg91Otp(parsed.data.phone, false);
        } else {
          if (!parsed.data.otp) {
            return Response.json({ message: "Code is required" }, { status: 400 });
          }
          await verifyMsg91PhoneOtp(parsed.data.phone, parsed.data.otp, false);
        }
        return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});