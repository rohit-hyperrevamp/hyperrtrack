import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — HyperTrack" },
      {
        name: "description",
        content: "Your HyperTrack rail operations workspace.",
      },
      { property: "og:title", content: "Welcome — HyperTrack" },
      { property: "og:description", content: "Your HyperTrack rail operations workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WelcomePage,
});

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `+91 ••• ••• ${last4}`;
}

function WelcomePage() {
  const navigate = useNavigate();
  const { user, logout, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!user) navigate({ to: "/login", replace: true });
  }, [user, isReady, navigate]);

  function handleLogout() {
    logout();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-x-clip bg-background px-5 py-12">
      <div className="relative z-10 w-full max-w-xl text-center">
        <div className="p-8 sm:p-12">
          <div className="flex justify-center">
            <BrandMark className="justify-center" />
          </div>

          <Loader2 className="mx-auto mt-8 h-6 w-6 animate-spin text-brand" aria-label="Loading workspace" />

          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            You're signed in as{" "}
            <span className="font-semibold text-foreground">
              {user ? maskPhone(user.phone) : "—"}
            </span>
            . Preparing your workspace…
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="h-11 rounded-xl border-border bg-background px-6 font-semibold hover:bg-background hover:border-accent hover:text-accent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          HyperTrack rail operations
        </p>
      </div>
    </div>
  );
}
