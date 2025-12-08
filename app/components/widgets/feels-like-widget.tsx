"use client";

import { WeatherResponse } from "@/lib/types/weather";
import {
  getColorForTemp,
  DEFAULT_TEMP_COLOR_STOPS,
} from "@/lib/get-color-for-temp";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";
import { Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

interface FeelsLikeWidgetProps {
  weatherData: WeatherResponse;
}

export default function FeelsLikeWidget({ weatherData }: FeelsLikeWidgetProps) {
  const actualTemp = weatherData.current.temperature_2m;
  const apparentTemp = weatherData.current.apparent_temperature;

  const isColder = apparentTemp < actualTemp;

  const sliderValue = isColder
    ? 100 - ((actualTemp - apparentTemp) / 15) * 100
    : ((apparentTemp - actualTemp) / 15) * 100;

  const apparentColor = getColorForTemp(apparentTemp);
  const actualColor = getColorForTemp(actualTemp);
  const gradient = isColder
    ? `linear-gradient(to right, ${apparentColor} 0%, ${actualColor} 100%)`
    : `linear-gradient(to right, ${actualColor} 0%, ${apparentColor} 100%)`;

  const chartData = weatherData.minutely_15.time
    .filter((time) => {
      const date = new Date(time);
      const now = new Date();
      return date.getDay() === now.getDay();
    })
    .map((time, index) => ({
      time: new Date(time),
      feelsLike: weatherData.minutely_15.apparent_temperature[index],
      actual: weatherData.minutely_15.temperature_2m[index],
    }));

  const allFeelsLikeTemps = chartData.map((d) => d.feelsLike);
  const minTemp = Math.min(...allFeelsLikeTemps);
  const maxTemp = Math.max(...allFeelsLikeTemps);

  const sortedStops = [...DEFAULT_TEMP_COLOR_STOPS].sort(
    (a, b) => b.temp - a.temp
  );
  const gradientStops = sortedStops
    .filter((stop) => stop.temp >= minTemp - 10 && stop.temp <= maxTemp + 10)
    .map((stop) => {
      const percent = ((maxTemp - stop.temp) / (maxTemp - minTemp || 1)) * 100;
      return {
        offset: `${Math.max(0, Math.min(100, percent))}%`,
        color: stop.color,
      };
    });

  return (
    <GenericSliderWidget
      icon="wi-thermometer"
      title="Feels like"
      dialogContent={
        <>
          <h3 className="font-bold text-xl">
            Feels like {Math.round(apparentTemp)}º
          </h3>
          <p className="text-muted-foreground mb-2 font-bold text-sm">
            Actual: {Math.round(actualTemp)}º
          </p>
          <LineChart
            responsive
            className="w-full aspect-square select-none pointer-events-none"
            data={chartData}
          >
            <defs>
              <linearGradient
                id="feelsLikeGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
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
              dataKey="feelsLike"
              stroke="url(#feelsLikeGradient)"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              name="Feels Like"
            />
            <Line
              type="monotone"
              dataKey="actual"
              strokeWidth={3}
              stroke="currentColor"
              strokeOpacity={0.5}
              dot={false}
              isAnimationActive={false}
              name="Actual"
            />
          </LineChart>
        </>
      }
    >
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {Math.round(apparentTemp)}º
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        Actual: {Math.round(actualTemp)}º
      </p>
      <Slider
        start={Math.min(isColder ? 100 : 0, sliderValue)}
        end={Math.max(isColder ? 100 : 0, sliderValue)}
        dotPercent={isColder ? 100 : 0}
        dotColor="white"
        pillPercent={sliderValue}
        pillText={
          <span className="flex items-center">
            <i
              className={`-ml-1 wi wi-fw wi-direction-${
                isColder ? "down" : "up"
              } scale-150`}
            />
            <span className="font-bold font-mono">
              {Math.round(Math.abs(apparentTemp - actualTemp))}º
            </span>
          </span>
        }
        gradient={gradient}
        className="mt-auto mb-2"
      />
    </GenericSliderWidget>
  );
}
