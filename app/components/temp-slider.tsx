import {
  DEFAULT_TEMP_COLOR_STOPS,
  type ColorStop,
} from "@/lib/get-color-for-temp";
import Slider from "./slider";

type TempSliderProps = {
  minTemp: number;
  maxTemp: number;
  lowTemp: number;
  highTemp: number;
  dotTemp?: number | null;
  className?: string;
};

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
    <Slider
      gradient={gradientBackground}
      start={left}
      end={right}
      dotColor="white"
      dotPercent={dotTemp !== null ? dot : undefined}
      className={className}
    />
  );
}
