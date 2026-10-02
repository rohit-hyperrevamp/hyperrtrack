import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Fingerprint, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { resendLoginOtp, sendLoginOtp, verifyLoginOtp } from "@/lib/otp.functions";
import { OTP_LENGTH } from "@/lib/otp-config";
import {
  enableBiometric,
  getBiometricStatus,
  signInWithBiometric,
} from "@/lib/biometric";
import { markNativeAppSessionUnlocked } from "@/lib/native-app-lock";
import { BrandMark } from "@/components/BrandMark";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — HyperTrack" },
      {
        name: "description",
        content:
          "Sign in to HyperTrack with your phone number and verification code.",
      },
      { property: "og:title", content: "Sign in — HyperTrack" },
      {
        property: "og:description",
        content:
          "Sign in to HyperTrack with your phone number and verification code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Sign in — HyperTrack" },
      {
        name: "twitter:description",
        content:
          "Sign in to HyperTrack with your phone number and verification code.",
      },
    ],
  }),
  component: LoginPage,
});

type Step = "phone" | "otp";

function normalizeIndianMobile(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(-10);
}

function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const requestOtp = useServerFn(sendLoginOtp);
  const requestOtpAgain = useServerFn(resendLoginOtp);
  const checkOtp = useServerFn(verifyLoginOtp);
  const verifyInFlightRef = useRef(false);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [otpMode, setOtpMode] = useState<"sms" | "fixed">("sms");
  const [otpRequestId, setOtpRequestId] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSplashDone(true), 1900);
    const t2 = setTimeout(() => setSplashGone(true), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (user && !revealing) navigate({ to: "/", replace: true });
  }, [user, navigate, revealing]);

  useEffect(() => {
    void getBiometricStatus().then((status) => {
      setBioAvailable(status.available);
      setBioEnabled(status.enabled);
    });
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const phoneValid = /^\d{10}$/.test(phone);

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (!phoneValid || sending) return;
    setSending(true);
    setError(null);
    const isResend = step === "otp";
    let movedToOtp = false;
    try {
      const result = isResend
        ? await requestOtpAgain({ data: { phone } })
        : await requestOtp({ data: { phone } });
      setOtpMode(result.mode);

      // Once the phone has passed the server-side checks, show the OTP input
      // immediately. MSG91 may keep its callback pending while its own human
      // verification UI closes, which previously left this page on Send OTP.
      if (!isResend) {
        setStep("otp");
        setOtp("");
        movedToOtp = true;
      }

      setOtpRequestId(null);
      setResendIn(30);
      toast.success(
        result.mode === "sms"
          ? `OTP sent to +91 ••• ••• ${phone.slice(-4)}`
          : "Enter your access code to continue",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not send the code. Please try again.";
      // Only return to the phone step when the number itself was refused.
      // If the SMS provider fails after that, stay on the code screen so the
      // user can tap Resend instead of bouncing back and forth.
      if (!isResend && !movedToOtp) setStep("phone");
      if (movedToOtp) setResendIn(0);
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(value?: string) {
    const code = value ?? otp;
    if (code.length !== OTP_LENGTH || verifyInFlightRef.current) return;
    verifyInFlightRef.current = true;
    setVerifying(true);
    try {
      await checkOtp({
        data: {
          phone,
          otp: code,
          requestId: otpMode === "sms" ? otpRequestId ?? undefined : undefined,
        },
      });
      await login(`+91${phone}`);
      markNativeAppSessionUnlocked();
      toast.success("Signed in");
      // Offer to enable Face ID on first successful sign-in on a device.
      const biometricStatus = await getBiometricStatus();
      if (biometricStatus.available && !biometricStatus.enabled) {
        try {
          await enableBiometric(`+91${phone}`);
          setBioAvailable(true);
          setBioEnabled(true);
          toast.success("Face ID enabled for this device");
        } catch (bioErr) {
          console.warn("[biometric] enable failed", bioErr);
          toast.info(
            bioErr instanceof Error && bioErr.message
              ? `Face ID not enabled: ${bioErr.message}`
              : "Face ID not enabled (you can enable it later from Profile).",
          );
        }
      }
      setRevealing(true);
      setTimeout(() => navigate({ to: "/", replace: true }), 640);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start session. Try again.",
      );
      setOtp("");
    } finally {
      verifyInFlightRef.current = false;
      setVerifying(false);
    }
  }

  async function handleBiometricLogin() {
    if (!bioAvailable || bioBusy) return;
    setBioBusy(true);
    setError(null);
    try {
      const savedPhone = await signInWithBiometric();
      if (!savedPhone) {
        setBioBusy(false);
        return;
      }
      markNativeAppSessionUnlocked();
      await login(savedPhone);
      toast.success("Signed in with Face ID");
      setRevealing(true);
      setTimeout(() => navigate({ to: "/", replace: true }), 640);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Face ID sign-in failed. Use OTP instead.",
      );
      void getBiometricStatus().then((status) => {
        setBioAvailable(status.available);
        setBioEnabled(status.enabled);
      });
    } finally {
      setBioBusy(false);
    }
  }

  return (
    <div
      className="relative min-h-dvh w-full overflow-x-clip bg-background text-foreground"
    >
      {/* Splash entrance keyframes */}
      <style>{`
        @keyframes login-splash-fade {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes login-splash-out {
          from { opacity: 1; }
          to { opacity: 0; visibility: hidden; }
        }
        @keyframes login-panel-in {
          from { opacity: 0; transform: translateX(48px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes login-brand-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-loader-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      {/* Splash screen */}
      {!splashGone && (
        <div
          aria-hidden={splashDone}
          className={`fixed inset-0 z-50 grid place-items-center bg-background ${
            splashDone ? "[animation:login-splash-out_0.6s_ease_forwards]" : ""
          }`}
        >
          <div className="relative flex flex-col items-center gap-6 [animation:login-splash-fade_0.7s_ease-out_both]">
            <BrandMark className="[&>span]:text-3xl" />
            <div className="h-0.5 w-36 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-brand [animation:login-loader-bar_1.6s_ease-in-out_forwards]" />
            </div>
          </div>
        </div>
      )}

      {/* Sign-in keeps the existing phone verification flow. */}
      <div className={revealing ? "animate-slide-out-up" : ""}>
        <div className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 py-10 sm:px-8">
          <div
            className="relative flex w-full max-w-md flex-col justify-center rounded-lg border border-border/70 bg-card px-6 py-10 shadow-sm sm:px-10 sm:py-12"
            style={{ animation: splashDone ? "login-panel-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both" : "none", opacity: splashDone ? undefined : 0 }}
          >
            <div className="mx-auto w-full max-w-[380px]">
              <div className="flex flex-col items-center text-center">
                <BrandMark className="mb-8 [&>span]:text-2xl" />
                <h2 className="font-display text-[24px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[28px]">
                  {step === "phone" ? "Operator sign-in" : "Verify your number"}
                </h2>
                <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-muted-foreground">
                  {step === "phone"
                    ? "Access your rail operations workspace."
                    : `Code sent to +91 ••• ••• ${phone.slice(-4)}.`}
                </p>
              </div>

              <div className="mt-6 sm:mt-8">
                {step === "phone" ? (
                  <form onSubmit={sendOtp} className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Mobile number
                      </span>
                      <div className="flex h-13 w-full items-center overflow-hidden rounded-lg border border-border bg-background transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
                        <div className="flex items-center gap-3 pl-4 pr-3">
                          <span className="whitespace-nowrap text-[15px] font-semibold text-foreground">
                            +91
                          </span>
                          <span className="h-6 w-px bg-border" />
                        </div>
                        <input
                           id="mobile-number"
                           name="tel-national"
                          type="tel"
                          inputMode="numeric"
                           autoComplete="tel-national"
                          placeholder="98765 43210"
                          value={phone}
                           onChange={(e) => setPhone(normalizeIndianMobile(e.target.value))}
                           className="h-13 min-w-0 flex-1 bg-transparent pr-4 text-[16px] font-medium tracking-wide text-foreground placeholder:font-normal placeholder:text-muted-foreground/35 focus:outline-none"
                        />
                      </div>
                    </label>

                    {error && (
                      <p
                        role="alert"
                        className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] font-medium text-destructive"
                      >
                        {error}
                      </p>
                    )}


                    <Button
                      type="submit"
                      disabled={!phoneValid || sending}
                      className="group h-13 w-full rounded-lg bg-brand text-[15px] font-semibold text-brand-foreground transition-all hover:bg-brand/90 disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Send OTP
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </Button>

                    {bioAvailable && bioEnabled && (
                      <Button
                        type="button"
                        onClick={handleBiometricLogin}
                        disabled={bioBusy}
                        variant="outline"
                        className="h-12 w-full rounded-lg"
                      >
                        {bioBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Fingerprint className="h-4 w-4 text-brand" />
                            Sign in with Face ID
                          </>
                        )}
                      </Button>
                    )}
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className={error ? "animate-shake" : ""}>
                      {/* Plain native input: the multi-box OTP widget uses a hidden
                          overlay input that some Android keyboards (e.g. realme UI /
                          Android 13) refuse to type into. */}
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]*"
                        name="otp"
                        aria-label="One-time code"
                        autoFocus
                        maxLength={OTP_LENGTH}
                        value={otp}
                        placeholder={"•".repeat(OTP_LENGTH)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
                          setOtp(v);
                          setError(null);
                          if (v.length === OTP_LENGTH) handleVerify(v);
                        }}
                        className="h-14 w-full rounded-lg border border-border bg-background px-4 text-center text-2xl font-semibold tracking-[0.6em] tabular-nums text-foreground outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
                      />

                      {error ? (
                        <p className="mt-3 text-center text-sm font-medium text-destructive">
                          {error}
                        </p>
                      ) : (
                        <p className="mt-3 text-center text-[13px] text-muted-foreground">
                          Enter the {OTP_LENGTH}-digit code sent to your phone
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleVerify()}
                      disabled={otp.length !== OTP_LENGTH || verifying}
                      className="h-13 w-full rounded-lg bg-brand text-[15px] font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
                    >
                      {verifying ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Verify & sign in"
                      )}
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setStep("phone");
                          setOtp("");
                          setError(null);
                        }}
                        className="px-0 font-medium text-muted-foreground hover:text-foreground"
                      >
                        ← Change number
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={resendIn > 0 || sending}
                        onClick={() => sendOtp()}
                        className="px-0 font-semibold text-brand hover:opacity-80 disabled:cursor-not-allowed disabled:text-muted-foreground"
                      >
                        {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer credit */}
            <div className="mt-10 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground lg:absolute lg:inset-x-0 lg:bottom-6 lg:mt-0">
               Designed &amp; Developed by{" "}
               <a
                 href="https://hyperrevamp.com"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="font-semibold text-foreground underline underline-offset-2 hover:text-brand"
               >
                 HyperRevamp
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
