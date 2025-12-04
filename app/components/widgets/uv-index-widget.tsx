"use client";

import { WeatherResponse } from "@/lib/types/weather";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";

interface UVIndexWidgetProps {
  weatherData: WeatherResponse;
}

export default function UVIndexWidget({ weatherData }: UVIndexWidgetProps) {
  const uvIndex = weatherData.daily.uv_index_max[0];

  const getUVLabel = (uv: number) => {
    if (uv < 3) return "Low";
    if (uv < 6) return "Moderate";
    if (uv < 8) return "High";
    if (uv < 11) return "Very High";
    return "Extreme";
  };

  const getUVTextClass = (uv: number) => {
    if (uv < 3) return "text-green-400";
    if (uv < 6) return "text-yellow-300";
    if (uv < 8) return "text-orange-400";
    if (uv < 11) return "text-red-400";
    return "text-purple-500";
  };

  return (
    <GenericSliderWidget
      icon="wi-day-sunny"
      title="UV Index"
      dialogContent={
        <>
          <h3 className="text-xl font-bold">UV Index: {uvIndex.toFixed(1)}</h3>
          <p className={`mb-2 font-bold text-sm ${getUVTextClass(uvIndex)}`}>
            {getUVLabel(uvIndex)}
          </p>
          {weatherData.daily.uv_index_max
            .map((uv, index) => ({
              uv,
              date: new Date(weatherData.daily.time[index]),
              index,
            }))
            .filter(({ date }) => {
              const today = new Date();
              today.setHours(23, 59, 59, 999);
              return date >= today;
            })
            .slice(0, 8)
            .map(({ uv, date, index }) => (
              <div key={index}>
                <p className="text-muted-foreground text-xs font-mono -mb-1">
                  {date.getDate() === new Date().getDate()
                    ? "Today"
                    : date.toLocaleDateString(undefined, {
                        weekday: "short",
                      })}
                  :{" "}
                  <span className={`font-bold ${getUVTextClass(uv)}`}>
                    {getUVLabel(uv)}
                  </span>
                </p>
                <div className="flex flex-row gap-2 items-center justify-center mb-2">
                  <span className="text-primary font-bold text-sm">
                    {uv.toFixed(1)}
                  </span>
                  <Slider
                    start={0}
                    end={(Math.max(0, Math.min(11, uv)) / 11) * 100}
                    dotPercent={(Math.max(0, Math.min(11, uv)) / 11) * 100}
                    scaleGradient
                  />
                </div>
              </div>
            ))}
        </>
      }
    >
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {Math.round(uvIndex)}
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {getUVLabel(uvIndex)}
      </p>
      <Slider
        start={0}
        end={
          (Math.max(0, Math.min(11, weatherData.daily.uv_index_max[0])) / 11) *
          100
        }
        dotPercent={
          (Math.max(0, Math.min(11, weatherData.daily.uv_index_max[0])) / 11) *
          100
        }
        className="mt-auto mb-2"
        scaleGradient
      />
    </GenericSliderWidget>
  );
}
