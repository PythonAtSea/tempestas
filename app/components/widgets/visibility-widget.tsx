import { WeatherResponse } from "@/lib/types/weather";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";
import { Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

interface VisibilityWidgetProps {
  weatherData?: WeatherResponse;
}

export default function VisibilityWidget({
  weatherData,
}: VisibilityWidgetProps) {
  const visibilityMeters =
    weatherData?.hourly.visibility[
      weatherData?.hourly.time.findIndex((time) => {
        const date = new Date(time);
        const now = new Date();
        return (
          date.getHours() === now.getHours() && date.getDate() === now.getDate()
        );
      }) || 0
    ];

  const visibility = visibilityMeters ? visibilityMeters / 1609.34 : 0;

  function getVisibilityLabel(miles: number): string {
    if (miles < 0.5) return "Dense Fog";
    if (miles < 1) return "Foggy";
    if (miles < 3) return "Hazy";
    if (miles < 5) return "Fair";
    if (miles < 10) return "Clear";
    if (miles < 20) return "Very Clear";
    return "Ultra Clear";
  }

  const visibilityLabel = getVisibilityLabel(visibility);

  const visibilityPercent = Math.min((visibility / 25) * 100, 100);

  const visibilityGradient = `linear-gradient(to right,
    #b4b4b4 0%,
    #b4b4b4 2%,
    #d0d0d0 4%,
    #e8e2c6 12%,
    #d6e8ff 20%,
    #9fd3ff 40%,
    #5bb7ff 80%,
    #2f9aff 100%
  )`;

  const chartData =
    weatherData?.minutely_15.time
      .filter((time) => {
        const date = new Date(time);
        const now = new Date();
        return date.getDay() === now.getDay();
      })
      .map((time, index) => ({
        time: new Date(time),
        visibility: weatherData?.minutely_15.visibility[index]
          ? weatherData.minutely_15.visibility[index] / 1609.34
          : 0,
      })) || [];

  const allVisibilities = chartData.map((d) => d.visibility);
  const minVisibility = Math.min(...allVisibilities);
  const maxVisibility = Math.max(...allVisibilities);

  const visibilityGradientStops = [
    { offset: "0%", color: "#b4b4b4" },
    { offset: "2%", color: "#b4b4b4" },
    { offset: "4%", color: "#d0d0d0" },
    { offset: "12%", color: "#e8e2c6" },
    { offset: "20%", color: "#d6e8ff" },
    { offset: "40%", color: "#9fd3ff" },
    { offset: "80%", color: "#5bb7ff" },
    { offset: "100%", color: "#2f9aff" },
  ]
    .filter(
      (stop) =>
        parseFloat(stop.offset) >= ((minVisibility - 5) / 25) * 100 &&
        parseFloat(stop.offset) <= ((maxVisibility + 5) / 25) * 100
    )
    .map((stop) => {
      const visAtPercent = (parseFloat(stop.offset) / 100) * 25;
      const percent =
        ((maxVisibility - visAtPercent) /
          (maxVisibility - minVisibility || 1)) *
        100;
      return {
        offset: `${Math.max(0, Math.min(100, percent))}%`,
        color: stop.color,
      };
    });

  return (
    <GenericSliderWidget
      icon="wi-horizon"
      title="Visibility"
      dialogContent={
        <>
          <h3 className="font-bold text-xl">{visibility.toFixed(1)} MI</h3>
          <p className="text-muted-foreground mb-2 font-bold text-sm">
            {visibilityLabel}
          </p>
          <LineChart
            responsive
            className="w-full aspect-square select-none pointer-events-none"
            data={chartData}
          >
            <defs>
              <linearGradient
                id="visibilityGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                {visibilityGradientStops.map((stop, index) => (
                  <stop
                    key={index}
                    offset={stop.offset}
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickFormatter={(time) => {
                const date = new Date(time);
                const hours = date.getHours();
                const period = hours >= 12 ? "pm" : "am";
                const displayHours = hours % 12 || 12;
                return `${displayHours}${period}`;
              }}
              interval={24}
            />
            <YAxis
              width="auto"
              domain={["dataMin - 2", "dataMax + 2"]}
              allowDecimals={false}
              tickCount={10}
            />
            <ReferenceLine
              x={new Date().setMinutes(0, 0, 0)}
              stroke="currentColor"
              strokeOpacity={0.5}
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="visibility"
              stroke="url(#visibilityGradient)"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              name="Visibility"
            />
          </LineChart>
        </>
      }
    >
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {visibility.toFixed(1)}
        <span className="text-lg text-muted-foreground">MI</span>
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {visibilityLabel}
      </p>
      <Slider
        gradient={visibilityGradient}
        start={0}
        end={100}
        dotPercent={visibilityPercent}
        className="mt-auto mb-2"
        scaleGradient
      />
    </GenericSliderWidget>
  );
}
