import logo from "@/assets/hypertrack-logo-b.png";

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
  const titleClass =
    variant === "inverse" ? "text-primary-foreground" : "text-foreground";
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="HyperTrack"
        width={1152}
        height={576}
        className="h-10 w-44 max-w-full object-contain object-left"
      />
    </div>
  );
}
