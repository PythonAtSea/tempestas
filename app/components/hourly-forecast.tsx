"use client";

import { useRef, useState, useMemo } from "react";
import { ChevronsLeft } from "lucide-react";
import { WeatherResponse } from "@/lib/types/weather";
import { getWeatherCodeDescription } from "@/lib/weather-code";

interface HourlyForecastProps {
  weatherData: WeatherResponse;
}

type ForecastItem =
  | { type: "hour"; time: string; index: number }
  | { type: "sunrise" | "sunset"; time: Date };

export default function HourlyForecast({ weatherData }: HourlyForecastProps) {
  const [showScrollReset, setShowScrollReset] = useState(false);
  const hourlyScrollRef = useRef<HTMLDivElement>(null);

  const forecastItems = useMemo(() => {
    const now = new Date();
    const items: ForecastItem[] = [];

    const sunEvents: { type: "sunrise" | "sunset"; time: Date }[] = [];
    weatherData?.daily.sunrise.forEach((time) => {
      sunEvents.push({ type: "sunrise", time: new Date(time) });
    });
    weatherData?.daily.sunset.forEach((time) => {
      sunEvents.push({ type: "sunset", time: new Date(time) });
    });

    const futureHours = weatherData?.hourly.time
      .map((time, index) => ({ time, index }))
      .filter(({ time }) => new Date(time).getTime() > now.getTime());

    futureHours?.forEach(({ time, index }) => {
      items.push({ type: "hour", time, index });
    });

    sunEvents
      .filter((event) => event.time.getTime() > now.getTime())
      .forEach((event) => {
        items.push(event);
      });

    items.sort((a, b) => {
      const timeA =
        a.type === "hour" ? new Date(a.time).getTime() : a.time.getTime();
      const timeB =
        b.type === "hour" ? new Date(b.time).getTime() : b.time.getTime();
      return timeA - timeB;
    });

    return items;
  }, [weatherData]);

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
            {forecastItems.map((item, i) => {
              const itemDate =
                item.type === "hour" ? new Date(item.time) : item.time;
              const isNewDay =
                itemDate.getDay() !== new Date().getDay() &&
                itemDate.getHours() === 0;
              const isSunEvent =
                item.type === "sunrise" || item.type === "sunset";
              // Find sunrise/sunset for the item's specific day, not today
              const itemDayStart = new Date(itemDate);
              itemDayStart.setHours(0, 0, 0, 0);

              let sunriseForDay: Date | undefined;
              let sunsetForDay: Date | undefined;

              const sunrises = weatherData?.daily?.sunrise ?? [];
              const sunsets = weatherData?.daily?.sunset ?? [];

              for (let j = 0; j < sunrises.length; j++) {
                const d = new Date(sunrises[j]);
                if (
                  d.getFullYear() === itemDayStart.getFullYear() &&
                  d.getMonth() === itemDayStart.getMonth() &&
                  d.getDate() === itemDayStart.getDate()
                ) {
                  sunriseForDay = d;
                  break;
                }
              }
              for (let j = 0; j < sunsets.length; j++) {
                const d = new Date(sunsets[j]);
                if (
                  d.getFullYear() === itemDayStart.getFullYear() &&
                  d.getMonth() === itemDayStart.getMonth() &&
                  d.getDate() === itemDayStart.getDate()
                ) {
                  sunsetForDay = d;
                  break;
                }
              }

              const isDay =
                sunriseForDay && sunsetForDay
                  ? itemDate.getTime() >= sunriseForDay.getTime() &&
                    itemDate.getTime() < sunsetForDay.getTime()
                  : weatherData?.current.is_day === 1;

              return (
                <div
                  key={`${item.type}-${i}`}
                  className="shrink-0 flex flex-col items-center gap-2 border-muted-foreground/30"
                >
                  <div className="relative pb-3">
                    <span
                      className={`text-sm text-muted-foreground block text-center ${
                        isNewDay ? "" : "mt-1.5 -mb-1.5"
                      }`}
                    >
                      {itemDate.toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: isSunEvent ? "2-digit" : undefined,
                        hour12: true,
                      })}
                    </span>
                    {isNewDay && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 text-xs font-bold uppercase text-muted-foreground">
                        {itemDate.toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </span>
                    )}
                  </div>
                  {isSunEvent ? (
                    <>
                      <i
                        className={`wi wi-fw scale-125 ${
                          item.type === "sunrise" ? "wi-sunrise" : "wi-sunset"
                        } py-2`}
                      />
                      <span className="font-mono font-bold capitalize">
                        {item.type}
                      </span>
                    </>
                  ) : (
                    <>
                      <i
                        className={`wi wi-fw scale-125 ${
                          getWeatherCodeDescription(
                            weatherData?.hourly.weather_code[
                              (
                                item as {
                                  type: "hour";
                                  time: string;
                                  index: number;
                                }
                              ).index
                            ],
                            isDay
                          ).iconClass
                        } py-2`}
                      />
                      <span className="font-mono font-bold relative">
                        {Math.round(
                          weatherData?.hourly.temperature_2m[
                            (
                              item as {
                                type: "hour";
                                time: string;
                                index: number;
                              }
                            ).index
                          ] ?? 0
                        )
                          .toString()
                          .padStart(2, "\u00A0")}
                        <span className="absolute top-0 left-full">º</span>
                      </span>
                    </>
                  )}
                </div>
              );
            })}
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
