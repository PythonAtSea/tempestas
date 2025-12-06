"use client";

import { AirQualityResponse } from "@/lib/types/weather";
import { getColorForTemp } from "@/lib/get-color-for-temp";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";
import { Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

const AQI_COLOR_STOPS = [
  { temp: 0, color: "#00e400" },
  { temp: 85, color: "#ffff00" },
  { temp: 170, color: "#ff7e00" },
  { temp: 250, color: "#ff0000" },
  { temp: 335, color: "#8f3f97" },
  { temp: 500, color: "#7e0023" },
];

interface AirQualityWidgetProps {
  airQualityData: AirQualityResponse | null;
}

export default function AirQualityWidget({
  airQualityData,
}: AirQualityWidgetProps) {
  const aqi = airQualityData?.hourly?.us_aqi?.[0] ?? 0;

  const chartData =
    airQualityData?.hourly.time
      .filter((time) => {
        const date = new Date(time);
        const now = new Date();
        return date.getDay() === now.getDay();
      })
      .map((time, index) => ({
        time: new Date(time),
        aqi: airQualityData.hourly.us_aqi[index] ?? 0,
      })) || [];

  const allAqi = chartData.map((d) => d.aqi);
  const minAqi = Math.min(...allAqi);
  const maxAqi = Math.max(...allAqi);

  const gradientStops: { offset: string; color: string }[] = [];

  if (chartData.length > 0) {
    gradientStops.push({
      offset: "0%",
      color: getColorForTemp(maxAqi, AQI_COLOR_STOPS),
    });

    [...AQI_COLOR_STOPS]
      .sort((a, b) => b.temp - a.temp)
      .forEach((stop) => {
        if (stop.temp < maxAqi && stop.temp > minAqi) {
          const offset = ((maxAqi - stop.temp) / (maxAqi - minAqi || 1)) * 100;
          gradientStops.push({
            offset: `${offset}%`,
            color: stop.color,
          });
        }
      });

    gradientStops.push({
      offset: "100%",
      color: getColorForTemp(minAqi, AQI_COLOR_STOPS),
    });
  }

  const getAQILabel = (value: number) => {
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for Some";
    if (value <= 200) return "Unhealthy";
    if (value <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  return (
    <GenericSliderWidget
      icon="wi-smog"
      title="Air Quality"
      dialogContent={
        <>
          <h3 className="text-xl font-bold">Air Quality Index: {aqi}</h3>
          <p className="text-muted-foreground mb-2 font-bold text-sm">
            {getAQILabel(aqi)}
          </p>
          <LineChart
            responsive
            data={chartData}
            className="w-full aspect-square select-none pointer-events-none"
          >
            <XAxis
              dataKey="time"
              tickFormatter={(time) => {
                const date = new Date(time);
                const hours = date.getHours();
                const period = hours >= 12 ? "pm" : "am";
                const displayHours = hours % 12 || 12;
                return `${displayHours}${period}`;
              }}
              interval={6}
            />
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                {gradientStops.map((stop, index) => (
                  <stop
                    key={index}
                    offset={stop.offset}
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            </defs>
            <YAxis
              domain={[0, 500]}
              allowDecimals={false}
              width="auto"
              tickCount={6}
              interval={0}
            />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="aqi"
              stroke="url(#aqiGradient)"
              strokeWidth={4}
              dot={false}
            />
            <ReferenceLine
              x={new Date().setMinutes(0, 0, 0)}
              stroke="currentColor"
              strokeOpacity={0.5}
              strokeWidth={3}
            />
          </LineChart>
        </>
      }
    >
      <h3 className="font-bold font-mono text-3xl relative mt-2">{aqi}</h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {getAQILabel(aqi)}
      </p>
      <Slider
        start={0}
        end={aqi / 5}
        dotPercent={aqi / 5}
        gradient="linear-gradient(to right, #00e400 0%, #ffff00 17%, #ff7e00 34%, #ff0000 50%, #8f3f97 67%, #7e0023 100%)"
        className="mt-auto mb-2"
        scaleGradient
      />
    </GenericSliderWidget>
  );
}
