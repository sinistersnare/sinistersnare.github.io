// Shared tack utilities: color mapping and SVG generation

export const TACK_COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
};

/**
 * Resolve a tack color string to a fill hex, with a sensible default.
 */
export function tackFill(
  color: string | null | undefined,
  defaultColor: keyof typeof TACK_COLOR_MAP = "green"
): string {
  const key = (color || "").toLowerCase();
  return TACK_COLOR_MAP[key] || TACK_COLOR_MAP[defaultColor];
}

/**
 * Build the SVG markup string for a tack with the given fill color.
 * Optionally add a class attribute for component-level styling hooks.
 */
export function buildTackSVG(fill: string, className?: string): string {
  const cls = className ? ` class="${className}"` : "";
  // A slightly taller pushpin: round head, short neck, and a metallic needle
  // Note: keep shadows via CSS filters in each component to avoid duplicate SVG filter IDs.
  return `
    <svg${cls} viewBox="0 0 24 28" aria-hidden="true">
      <g>
        <!-- head -->
        <circle cx="12" cy="8" r="6" fill="${fill}" />
        <!-- rim highlight -->
        <circle cx="12" cy="8" r="6.8" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="0.8" />
        <!-- neck -->
        <rect x="10" y="13.2" width="4" height="3.2" rx="1.2" fill="${fill}" />
        <!-- needle (slight gradient via stroke opacity) -->
        <path d="M12 16.4 L12 26" stroke="#9aa1a8" stroke-width="1.4" stroke-linecap="round" />
        <path d="M12 16.4 L12 26" stroke="#6b7280" stroke-width="0.6" stroke-linecap="round" />
      </g>
    </svg>
  `;
}
