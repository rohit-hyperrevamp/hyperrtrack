/**
 * Shared tile design language — mirrors the dashboard metric tiles so every
 * KPI/stat tile across the platform reads the same way:
 * vivid accent surface, quiet label, oversized numeral, solid accent icon chip.
 *
 * Named accents remain for compatibility; their surfaces use the HyperTrack
 * blue-led operational palette with purposeful good, caution and danger accents.
 */
export type Accent =
  | "rose"
  | "cyan"
  | "lime"
  | "violet"
  | "amber"
  | "emerald"
  | "sky"
  | "indigo";

export const ACCENTS: Accent[] = [
  "rose",
  "cyan",
  "amber",
  "lime",
  "violet",
  "emerald",
  "sky",
  "indigo",
];

/** Tile surfaces — noticeably richer than plain pastels, still corporate. */
export const ACCENT_TILE_BG: Record<Accent, string> = {
  rose: "bg-danger-soft dark:bg-danger/15 border-danger/10",
  cyan: "bg-brand/10 dark:bg-brand/20 border-brand/10",
  lime: "bg-good-soft dark:bg-good/15 border-good/10",
  violet: "bg-card border-border/70",
  amber: "bg-caution-soft dark:bg-caution/15 border-caution/10",
  emerald: "bg-good-soft dark:bg-good/15 border-good/10",
  sky: "bg-brand/10 dark:bg-brand/20 border-brand/10",
  indigo: "bg-card border-border/70",
};

/** Icon chips — solid accent discs with white glyphs for real contrast. */
export const ACCENT_CHIP: Record<Accent, string> = {
  rose: "bg-danger text-primary-foreground ring-danger/25",
  cyan: "bg-brand text-primary-foreground ring-brand/25",
  lime: "bg-good text-primary-foreground ring-good/25",
  violet: "bg-foreground text-background ring-foreground/20",
  amber: "bg-caution text-background ring-caution/25",
  emerald: "bg-good text-primary-foreground ring-good/25",
  sky: "bg-brand text-primary-foreground ring-brand/25",
  indigo: "bg-foreground text-background ring-foreground/20",
};

/** Stable accent derived from a tile label, so colours stay consistent per page. */
export function accentFromKey(key: string): Accent {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

/** Map semantic tones used by older stat components onto the tile palette. */
export function accentFromTone(
  tone?: "default" | "accent" | "success" | "warning" | "destructive",
): Accent | null {
  switch (tone) {
    case "success":
      return "emerald";
    case "warning":
      return "amber";
    case "destructive":
      return "rose";
    case "accent":
      return "sky";
    default:
      return null;
  }
}
