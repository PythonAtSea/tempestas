"use client";

import { useRef, useState } from "react";
import { ChevronsLeft } from "lucide-react";
import { WeatherResponse } from "@/lib/types/weather";
import { getWeatherCodeDescription } from "@/lib/weather-code";

interface HourlyForecastProps {
  weatherData: WeatherResponse;
}

export default function HourlyForecast({ weatherData }: HourlyForecastProps) {
  const [showScrollReset, setShowScrollReset] = useState(false);
  const hourlyScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full p-6 pt-0">
      <div className="relative">
        <div
          ref={hourlyScrollRef}
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            setShowScrollReset(scrollLeft > 50);
          }}
          className="w-full border overflow-x-auto overflow-y-hidden bg-muted/20"
        >
          <div className="flex w-max gap-4 px-4 py-4">
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="relative pb-3">
                <span className="text-sm text-muted-foreground block text-center mt-1.5 -mb-1.5 font-bold">
                  Now
                </span>
              </div>
              <i
                className={`wi wi-fw scale-125 ${
                  getWeatherCodeDescription(
                    weatherData?.current.weather_code ?? -1,
                    weatherData?.current.is_day === 1
                  ).iconClass
                } py-2`}
              />
              <span className="font-mono font-bold relative">
                {Math.round(weatherData?.current.temperature_2m ?? 0)
                  .toString()
                  .padStart(2, "\u00A0")}
                <span className="absolute top-0 left-full">º</span>
              </span>
            </div>
            {weatherData?.hourly.time
              .filter((time) => {
                const date = new Date(time);
                const now = new Date();
                return date.getTime() > now.getTime();
              })
              .map((time, i) => (
                <div
                  key={i}
                  className="shrink-0 flex flex-col items-center gap-2"
                >
                  <div className="relative pb-3">
                    <span
                      className={`text-sm text-muted-foreground block text-center ${
                        new Date(time).getDay() === new Date().getDay()
                          ? "mt-1.5 -mb-1.5"
                          : ""
                      }`}
                    >
                      {new Date(time).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        hour12: true,
                      })}
                    </span>
                    {new Date(time).getDay() !== new Date().getDay() && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 text-xs font-bold uppercase text-muted-foreground">
                        {new Date(time).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </span>
                    )}
                  </div>
                  <i
                    className={`wi wi-fw scale-125 ${
                      getWeatherCodeDescription(
                        weatherData?.hourly.weather_code[i]
                      ).iconClass
                    } py-2`}
                  />
                  <span className="font-mono font-bold relative">
                    {Math.round(weatherData?.hourly.temperature_2m[i] ?? 0)
                      .toString()
                      .padStart(2, "\u00A0")}
                    <span className="absolute top-0 left-full">º</span>
                  </span>
                </div>
              ))}
          </div>
        </div>
        {showScrollReset && (
          <button
            onClick={() => {
              if (hourlyScrollRef.current) {
                hourlyScrollRef.current.scrollTo({
                  left: 0,
                  behavior: "smooth",
                });
              }
            }}
            className="absolute left-4 top-9 -translate-y-1/2 bg-background border p-2 shadow-lg hover:bg-accent transition-colors"
            aria-label="Reset scroll position"
          >
            <ChevronsLeft className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
