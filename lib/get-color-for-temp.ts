export type ColorStop = { temp: number; color: string };

export const DEFAULT_TEMP_COLOR_STOPS: Array<ColorStop> = [
  { temp: 150, color: "#7F0017" },
  { temp: 120, color: "#8B0000" },
  { temp: 115, color: "#B22222" },
  { temp: 110, color: "#CD5C5C" },
  { temp: 105, color: "#DC143C" },
  { temp: 100, color: "#FF69B4" },
  { temp: 95, color: "#FFA07A" },
  { temp: 90, color: "#FF8C00" },
  { temp: 85, color: "#FFA500" },
  { temp: 80, color: "#FFD700" },
  { temp: 75, color: "#F0E68C" },
  { temp: 70, color: "#EEE8AA" },
  { temp: 65, color: "#98FB98" },
  { temp: 60, color: "#90EE90" },
  { temp: 55, color: "#20B2AA" },
  { temp: 50, color: "#48D1CC" },
  { temp: 45, color: "#00CED1" },
  { temp: 40, color: "#1E90FF" },
  { temp: 30, color: "#6A8FBF" },
  { temp: 25, color: "#7FA3D1" },
  { temp: 20, color: "#90B0D6" },
  { temp: 15, color: "#A2BCD9" },
  { temp: 10, color: "#AFC5DF" },
  { temp: 5, color: "#B0C4DE" },
  { temp: 0, color: "#C7D6EB" },
  { temp: -5, color: "#D4DEEF" },
  { temp: -10, color: "#DEE6F3" },
  { temp: -15, color: "#E5EBF6" },
  { temp: -20, color: "#EAF0F8" },
  { temp: -25, color: "#EEF3FA" },
  { temp: -30, color: "#F1F5FB" },
  { temp: -35, color: "#F4F7FC" },
  { temp: -40, color: "#F6F9FD" },
  { temp: -45, color: "#F8FAFE" },
  { temp: -50, color: "#FAFBFE" },
  { temp: -55, color: "#FCFDFE" },
  { temp: -60, color: "#FDFEFF" },
  { temp: -100, color: "#FFFFFF" },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function getColorForTemp(
  temp: number,
  stops: Array<ColorStop> = DEFAULT_TEMP_COLOR_STOPS
): string {
  const sorted = [...stops].sort((a, b) => a.temp - b.temp);

  if (temp <= sorted[0].temp) return sorted[0].color;
  if (temp >= sorted[sorted.length - 1].temp)
    return sorted[sorted.length - 1].color;

  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (temp >= a.temp && temp <= b.temp) {
      lower = a;
      upper = b;
      break;
    }
  }

  if (lower.temp === upper.temp) {
    return lower.color;
  }

  const t = (temp - lower.temp) / (upper.temp - lower.temp);
  const lr = hexToRgb(lower.color);
  const ur = hexToRgb(upper.color);
  const mixed = {
    r: lr.r + (ur.r - lr.r) * t,
    g: lr.g + (ur.g - lr.g) * t,
    b: lr.b + (ur.b - lr.b) * t,
  };
  return rgbToHex(mixed);
}
