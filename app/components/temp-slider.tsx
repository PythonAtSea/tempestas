type TempSliderProps = {
  minTemp: number;
  maxTemp: number;
  lowTemp: number;
  highTemp: number;
  dotTemp?: number | null;
  className?: string;
};
type ColorStop = { temp: number; color: string };
const DEFAULT_TEMP_COLOR_STOPS: Array<ColorStop> = [
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
  //{ temp: 32, color: "#001F3F" },
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

function toPercentFromTemp(
  temp: number,
  minTemp: number,
  maxTemp: number
): number {
  const min = Math.min(minTemp, maxTemp);
  const max = Math.max(minTemp, maxTemp);
  const span = max - min || 1;
  const clamped = Math.max(min, Math.min(max, temp));
  return ((clamped - min) / span) * 100;
}

function buildTempGradientForSegment(
  minTemp: number,
  maxTemp: number,
  stops: Array<ColorStop>,
  leftPct: number,
  widthPct: number
): string {
  const sorted = [...stops].sort((a, b) => a.temp - b.temp);
  const width = Math.max(widthPct, 0.0001);
  const parts = sorted.map((s) => {
    const globalPct = toPercentFromTemp(s.temp, minTemp, maxTemp);
    const segPct = ((globalPct - leftPct) / width) * 100;
    const clamped = Math.max(0, Math.min(100, segPct));
    return `${s.color} ${clamped}%`;
  });
  return `linear-gradient(to right, ${parts.join(", ")})`;
}

export default function Component({
  minTemp,
  maxTemp,
  lowTemp,
  highTemp,
  dotTemp,
  className,
}: TempSliderProps) {
  const min = Math.min(minTemp, maxTemp);
  const max = Math.max(minTemp, maxTemp);
  const span = max - min || 1;

  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const toPercent = (v: number) => ((clamp(v) - min) / span) * 100;

  const left = Math.min(toPercent(lowTemp), toPercent(highTemp));
  const right = Math.max(toPercent(lowTemp), toPercent(highTemp));
  const width = right - left;
  const dot = dotTemp !== undefined ? toPercent(dotTemp || 0) : undefined;

  const gradientBackground = buildTempGradientForSegment(
    min,
    max,
    DEFAULT_TEMP_COLOR_STOPS,
    left,
    width
  );

  return (
    <div
      className={`relative w-full rounded-full h-2 border ${className ?? ""}`}
    >
      <div
        className="absolute top-0 h-full rounded-full"
        style={{
          left: `${left}%`,
          width: `${width}%`,
          background: gradientBackground,
        }}
      />
      {dot !== undefined && dotTemp !== null && (
        <div
          className="absolute top-1/2 rounded-full -translate-y-1/2 -translate-x-1/2 h-2.5 w-2.5 bg-white border-2 border-background"
          style={{ left: `${dot}%` }}
        />
      )}
    </div>
  );
}
