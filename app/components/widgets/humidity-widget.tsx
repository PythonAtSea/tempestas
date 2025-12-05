"use client";

import { WeatherResponse } from "@/lib/types/weather";
import { getColorForTemp } from "@/lib/get-color-for-temp";
import GenericSliderWidget from "./generic-slider-widget";

import Slider from "../slider";
import { Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

const HUMIDITY_STOPS = [
  { temp: 0, color: "#e67a00" },
  { temp: 20, color: "#f5d66a" },
  { temp: 50, color: "#8bd67a" },
  { temp: 75, color: "#4da6ff" },
  { temp: 100, color: "#0057c8" },
];

interface HumidityWidgetProps {
  weatherData: WeatherResponse;
}

export default function Widget({ weatherData }: HumidityWidgetProps) {
  const getDewPoint = (
    temp = weatherData.current.temperature_2m ?? 32,
    humidity = weatherData.current.relative_humidity_2m ?? 0
  ) => {
    const T_F = temp;
    const T_C = ((T_F - 32) * 5) / 9;
    const RH = Math.max(humidity, 0.0001);
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * T_C) / (b + T_C) + Math.log(RH / 100);
    const dewPointC = (b * alpha) / (a - alpha);
    const dewPointF = (dewPointC * 9) / 5 + 32;
    return `Dew point ${Math.round(dewPointF)}°`;
  };

  const chartData =
    weatherData?.hourly.time
      .filter((time) => {
        const date = new Date(time);
        const now = new Date();
        return date.getDay() === now.getDay();
      })
      .map((time, index) => ({
        time: new Date(time),
        relativeHumidity: weatherData.hourly.relative_humidity_2m[index],
      })) || [];

  const allHumidity = chartData.map((d) => d.relativeHumidity);
  const minHumidity = Math.min(...allHumidity);
  const maxHumidity = Math.max(...allHumidity);

  const gradientStops: { offset: string; color: string }[] = [];

  if (chartData.length > 0) {
    gradientStops.push({
      offset: "0%",
      color: getColorForTemp(maxHumidity, HUMIDITY_STOPS),
    });

    [...HUMIDITY_STOPS]
      .sort((a, b) => b.temp - a.temp)
      .forEach((stop) => {
        if (stop.temp < maxHumidity && stop.temp > minHumidity) {
          const offset =
            ((maxHumidity - stop.temp) / (maxHumidity - minHumidity || 1)) *
            100;
          gradientStops.push({
            offset: `${offset}%`,
            color: stop.color,
          });
        }
      });

    gradientStops.push({
      offset: "100%",
      color: getColorForTemp(minHumidity, HUMIDITY_STOPS),
    });
  }

  return (
    <GenericSliderWidget
      icon="wi-humidity"
      title="Humidity"
      dialogContent={
        <>
          <h3 className="font-bold text-xl">
            Relative Humidity: {weatherData.current.relative_humidity_2m}%
          </h3>
          <p className="text-muted-foreground mb-2 font-bold text-sm">
            {getDewPoint()}
          </p>
          <LineChart
            responsive
            data={chartData}
            className="w-full aspect-square select-none pointer-events-none"
          >
            <defs>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                {gradientStops.map((stop, index) => (
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
              interval={6}
            />
            <YAxis domain={[0, 100]} allowDecimals={false} width="auto" />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="relativeHumidity"
              stroke="url(#humidityGradient)"
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
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {weatherData.current.relative_humidity_2m}%
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {getDewPoint()}
      </p>
      <Slider
        start={0}
        end={weatherData.current.relative_humidity_2m}
        dotPercent={weatherData.current.relative_humidity_2m}
        gradient="linear-gradient(to right, #e67a00 0%, #f5d66a 20%, #8bd67a 50%, #4da6ff 75%, #0057c8 100%)"
        className="mt-auto mb-2"
        scaleGradient
      />
    </GenericSliderWidget>
  );
}
