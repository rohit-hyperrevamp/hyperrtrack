import { TrainFront } from "lucide-react";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  variant?: "default" | "inverse";
};

export function BrandMark({
  className = "",
  compact = false,
  variant = "default",
}: BrandMarkProps) {
  return (
    <div className={`flex items-center ${className}`} aria-label="HyperTrack">
      {compact ? (
        <span className="rail-dock-mark grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><TrainFront className="h-5 w-5" aria-hidden="true" /></span>
      ) : (
        <span className="hypertrack-wordmark inline-flex items-baseline whitespace-nowrap font-heading text-xl" aria-hidden="true"><span className={variant === "inverse" ? "text-primary-foreground" : "text-foreground"}>Hyper</span><span className="text-brand">Track</span></span>
      )}
    </div>
  );
}
