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
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary text-sm font-bold text-primary-foreground">HT</span>
      ) : (
        <span className="inline-flex items-baseline whitespace-nowrap font-heading text-lg font-semibold" aria-hidden="true"><span className={variant === "inverse" ? "text-primary-foreground" : "text-foreground"}>Hyper</span><span className="text-brand">Track</span></span>
      )}
    </div>
  );
}
