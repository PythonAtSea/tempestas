import type { ReactNode } from "react";

type SliderProps = {
  gradient?: string;
  start: number;
  end: number;
  dotPercent?: number | null;
  dotColor?: string;
  className?: string;
  pillPercent?: number | null;
  pillText?: ReactNode;
  pillBgColor?: string;
  pillTextColor?: string;
};

export default function Slider({
  gradient,
  start,
  end,
  dotPercent,
  dotColor = "#ffffff",
  className,
  pillPercent,
  pillText,
  pillBgColor = "#ffffff",
  pillTextColor = "#000000",
}: SliderProps) {
  const defaultGradient =
    "linear-gradient(to right, #00a000 0%, #ffff00 33%, #ff0000 66%, #800080 100%)";
  const bg = gradient ?? defaultGradient;
  const left = Math.max(0, Math.min(100, Math.min(start, end)));
  const right = Math.max(0, Math.min(100, Math.max(start, end)));
  const width = Math.max(0, right - left);
  const dot =
    dotPercent !== undefined
      ? Math.max(0, Math.min(100, dotPercent ?? 0))
      : undefined;
  const pill =
    pillPercent !== undefined
      ? Math.max(left, Math.min(right, pillPercent ?? 0))
      : undefined;

  const getPillBgColor = () => {
    if (pill === undefined) return pillBgColor;

    // Parse colors and stops from the gradient string (bg)
    // Expected format: linear-gradient(..., color stop%, color stop%, ...)
    const matches = [...bg.matchAll(/(#[0-9a-fA-F]{3,6})\s*(\d{1,3})%/g)];

    if (matches.length < 2) return pillBgColor;

    const colors = matches.map((m) => m[1]);
    const stops = matches.map((m) => parseInt(m[2]) / 100);
    const gradientPercent = width === 0 ? 0 : (pill - left) / width;

    if (gradientPercent <= stops[0]) return colors[0];
    if (gradientPercent >= stops[stops.length - 1])
      return colors[colors.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      const currentStop = stops[i];
      const nextStop = stops[i + 1];

      if (gradientPercent >= currentStop && gradientPercent <= nextStop) {
        const range = nextStop - currentStop;
        const position =
          range === 0 ? 0 : (gradientPercent - currentStop) / range;

        const color1 = colors[i];
        const color2 = colors[i + 1];

        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);

        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;

        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;

        const r = Math.round(r1 + (r2 - r1) * position);
        const g = Math.round(g1 + (g2 - g1) * position);
        const b = Math.round(b1 + (b2 - b1) * position);

        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
      }
    }

    return pillBgColor;
  };

  return (
    <div
      className={`relative w-full rounded-full h-2 border ${className ?? ""}`}
    >
      <div
        className="absolute top-0 h-full rounded-full"
        style={{
          left: `${left}%`,
          width: `${width}%`,
          background: bg,
        }}
      />
      {dot !== undefined && dotPercent !== null && (
        <div
          className="absolute top-1/2 rounded-full -translate-y-1/2 -translate-x-1/2 h-2.5 w-2.5 border-2 border-background"
          style={{ left: `${dot}%`, backgroundColor: dotColor }}
        />
      )}
      {pill !== undefined && pillPercent !== null && pillText != null && (
        <div
          className="absolute top-1/2 px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
          style={{
            left: `${pill}%`,
            backgroundColor: getPillBgColor(),
            color: pillTextColor,
            transform: `translateY(-50%) translateX(${
              width === 0 ? -50 : -((pill - left) / width) * 100
            }%)`,
          }}
        >
          {pillText}
        </div>
      )}
    </div>
  );
}
