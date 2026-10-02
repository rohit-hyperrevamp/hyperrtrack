/**
 * Shared tile design language — mirrors the dashboard metric tiles so every
 * KPI/stat tile across the platform reads the same way:
 * vivid accent surface, quiet label, oversized numeral, solid accent icon chip.
 *
 * Named accents remain for compatibility; their surfaces use the HyperTrack
 * blue and monochrome palette.
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
  rose: "bg-secondary dark:bg-secondary",
  cyan: "bg-brand/10 dark:bg-brand/20",
  lime: "bg-secondary dark:bg-secondary",
  violet: "bg-brand/8 dark:bg-brand/15",
  amber: "bg-secondary dark:bg-secondary",
  emerald: "bg-brand/10 dark:bg-brand/20",
  sky: "bg-brand/12 dark:bg-brand/25",
  indigo: "bg-brand/8 dark:bg-brand/15",
};

/** Icon chips — solid accent discs with white glyphs for real contrast. */
export const ACCENT_CHIP: Record<Accent, string> = {
  rose: "bg-foreground text-background ring-foreground/20",
  cyan: "bg-brand text-primary-foreground ring-brand/25",
  lime: "bg-foreground text-background ring-foreground/20",
  violet: "bg-brand text-primary-foreground ring-brand/25",
  amber: "bg-foreground text-background ring-foreground/20",
  emerald: "bg-brand text-primary-foreground ring-brand/25",
  sky: "bg-brand text-primary-foreground ring-brand/25",
  indigo: "bg-brand text-primary-foreground ring-brand/25",
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
