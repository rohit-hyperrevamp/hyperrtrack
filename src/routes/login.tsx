import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Fingerprint, Loader2 } from "lucide-react";
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
import railVideo from "@/assets/hypertrack-rail-login.mp4.asset.json";

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

type Step = "phone" | "otp" | "welcome";

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
  const [splashProgress, setSplashProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setSplashDone(true), 1900);
    const t2 = setTimeout(() => setSplashGone(true), 2500);
    const started = Date.now();
    const progress = setInterval(() => {
      setSplashProgress(Math.min(100, Math.round(((Date.now() - started) / 1800) * 100)));
    }, 32);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(progress);
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

  function revealWorkspace() {
    setStep("welcome");
    setError(null);
    setTimeout(() => setRevealing(true), 1250);
    setTimeout(() => navigate({ to: "/", replace: true }), 1900);
  }

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
      revealWorkspace();
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
      revealWorkspace();
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
    <main className="login-scene relative min-h-dvh overflow-hidden bg-foreground text-foreground">
      <video
        className="login-film absolute inset-0 h-full w-full object-cover"
        src={railVideo.url}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="login-film-scrim absolute inset-0" aria-hidden="true" />

      {!splashGone && (
        <div className={`login-splash fixed inset-0 z-50 grid place-items-center bg-background ${splashDone ? "is-leaving" : ""}`} aria-hidden={splashDone}>
          <div className="flex flex-col items-center">
            <BrandMark className="[&>span]:text-3xl" />
            <div className="mt-9 flex items-baseline gap-1 font-heading text-5xl font-semibold tabular-nums text-foreground" aria-label={`Loading ${splashProgress} percent`}>
              <span aria-hidden="true">{String(splashProgress).padStart(2, "0")}</span>
              <span aria-hidden="true" className="text-lg font-medium text-brand">%</span>
            </div>
            <div className="mt-4 h-0.5 w-40 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
              <div className="h-full bg-brand transition-[width] duration-75" style={{ width: `${splashProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className={`login-content relative z-10 flex min-h-dvh flex-col ${revealing ? "is-revealing" : ""}`}>
        <header className="login-masthead px-6 py-6 sm:px-10 sm:py-8">
          <BrandMark variant="inverse" className="[&>span]:text-xl" />
        </header>

        <div className="login-layout flex flex-1 items-center justify-end px-4 pb-4 sm:px-8 sm:pb-8 lg:px-14">
          <section className="login-panel relative flex w-full max-w-[480px] flex-col justify-center overflow-hidden rounded-lg border border-border/70 bg-card px-7 py-9 shadow-xl sm:px-12 sm:py-12 lg:min-h-[590px]" aria-label="Sign in">
            {step === "welcome" ? (
              <div className="login-welcome flex flex-1 flex-col items-start justify-center" role="status">
                <span className="login-rise rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">ACCESS GRANTED</span>
                <div className="login-rise mt-7"><BrandMark className="[&>span]:text-3xl" /></div>
                <h1 className="login-rise mt-10 font-heading text-4xl font-semibold leading-tight text-foreground">Welcome aboard.</h1>
                <p className="login-rise mt-3 text-base text-muted-foreground">Your workspace is ready.</p>
                <div className="login-rise mt-10 h-1 w-full overflow-hidden rounded-full bg-secondary"><div className="login-welcome-progress h-full bg-brand" /></div>
              </div>
            ) : (
              <div key={step} className="login-step flex flex-1 flex-col justify-center">
                <div className="flex items-center justify-between">
                  <BrandMark className="[&>span]:text-2xl" />
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">0{step === "phone" ? "1" : "2"} / 02</span>
                </div>
                <div className="mt-11 flex gap-1.5" aria-hidden="true">
                  <span className="h-1 w-9 rounded-full bg-brand" />
                  <span className={`h-1 w-9 rounded-full ${step === "otp" ? "bg-brand" : "bg-secondary"}`} />
                </div>
                <h1 className="mt-9 font-heading text-[30px] font-semibold leading-tight text-foreground sm:text-[34px]">
                  {step === "phone" ? "Welcome to HyperTrack." : "Check your phone."}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step === "phone" ? "Sign in to your rail operations workspace." : `Enter the ${OTP_LENGTH}-digit code for +91 ••• ••• ${phone.slice(-4)}.`}
                </p>

                <div className="mt-9">
                  {step === "phone" ? (
                    <form onSubmit={sendOtp} className="space-y-5">
                      <label htmlFor="mobile-number" className="block text-sm font-medium text-foreground">Mobile number</label>
                      <div className="login-input flex h-14 w-full items-center rounded-lg border border-border bg-background focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <span className="border-r border-border px-4 text-base font-medium text-foreground">+91</span>
                        <input id="mobile-number" name="tel-national" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Enter your number" value={phone}
                          onChange={(e) => setPhone(normalizeIndianMobile(e.target.value))}
                          className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-foreground outline-none placeholder:text-muted-foreground/60" />
                      </div>
                      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
                      <Button type="submit" disabled={!phoneValid || sending} className="h-13 w-full rounded-lg bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90">
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                      </Button>
                      {bioAvailable && bioEnabled && (
                        <Button type="button" onClick={handleBiometricLogin} disabled={bioBusy} variant="outline" className="h-12 w-full rounded-lg">
                          {bioBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Fingerprint className="h-4 w-4 text-brand" /> Sign in with Face ID</>}
                        </Button>
                      )}
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <label htmlFor="login-otp" className="block text-sm font-medium text-foreground">Verification code</label>
                      <input id="login-otp" type="tel" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" name="otp" aria-label="One-time code" autoFocus maxLength={OTP_LENGTH} value={otp} placeholder={"•".repeat(OTP_LENGTH)}
                        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH); setOtp(v); setError(null); if (v.length === OTP_LENGTH) handleVerify(v); }}
                        className="login-input h-14 w-full rounded-lg border border-border bg-background px-4 text-center text-2xl font-semibold tracking-[0.5em] tabular-nums text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-brand focus:ring-4 focus:ring-brand/10" />
                      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
                      <Button onClick={() => handleVerify()} disabled={otp.length !== OTP_LENGTH || verifying} className="h-13 w-full rounded-lg bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90">
                        {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify & sign in <ArrowRight className="ml-2 h-4 w-4" /></>}
                      </Button>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <Button type="button" variant="ghost" onClick={() => { setStep("phone"); setOtp(""); setError(null); }} className="px-0 text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Change number</Button>
                        <Button type="button" variant="ghost" disabled={resendIn > 0 || sending} onClick={() => sendOtp()} className="px-0 font-semibold text-brand disabled:text-muted-foreground">{resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-10 text-xs text-muted-foreground">Designed &amp; developed by <a href="https://hyperrevamp.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-brand">HyperRevamp</a></div>
          </section>
        </div>
        <div className="login-caption px-10 pb-8 text-sm font-medium text-primary-foreground/90 lg:px-14">Rail operations, in motion.</div>
      </div>
    </main>
  );
}
