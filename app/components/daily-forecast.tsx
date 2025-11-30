"use client";

import { Calendar } from "lucide-react";
import { WeatherResponse } from "@/lib/types/weather";
import { getWeatherCodeDescription } from "@/lib/weather-code";
import TempSlider from "./temp-slider";

interface DailyForecastProps {
  weatherData: WeatherResponse;
  minTemp: number;
  maxTemp: number;
  maxLowWidth: number;
  maxHighWidth: number;
}

export default function DailyForecast({
  weatherData,
  minTemp,
  maxTemp,
  maxLowWidth,
  maxHighWidth,
}: DailyForecastProps) {
  return (
    <div className="w-full px-6 pb-4">
      <div className="border bg-muted/20">
        <p className="p-2 font-bold text-muted-foreground flex flex-row items-center gap-2">
          <Calendar className="inline-block size-4" />
          14 day forecast
        </p>
        <div className="w-full">
          {weatherData?.daily.time
            .map((time, originalIndex) => ({ time, originalIndex }))
            .filter(({ time }) => {
              return new Date(time).getTime() > new Date().setHours(0, 0, 0, 0);
            })
            .map(({ time, originalIndex }) => (
              <div
                key={originalIndex}
                className="flex justify-between items-center p-3 border-t"
              >
                <div className="flex items-center gap-4 mr-4">
                  <span className="w-9 text-sm">
                    {(() => {
                      const d = new Date(time);
                      const t = new Date();
                      if (
                        d.getFullYear() === t.getFullYear() &&
                        d.getMonth() === t.getMonth() &&
                        d.getDate() === t.getDate()
                      ) {
                        return "Today";
                      }
                      return d.toLocaleDateString(undefined, {
                        weekday: "short",
                      });
                    })()}
                  </span>
                  <i
                    className={`wi wi-fw scale-125 ${
                      getWeatherCodeDescription(
                        weatherData?.daily.weather_code[originalIndex]
                      ).iconClass
                    }`}
                  />
                </div>
                <span className="font-mono font-bold relative mr-2 text-muted-foreground">
                  {"\u00A0".repeat(
                    Math.max(
                      0,
                      maxLowWidth -
                        Math.round(
                          weatherData?.daily.temperature_2m_min[originalIndex]
                        ).toString().length
                    )
                  )}
                  {Math.round(
                    weatherData?.daily.temperature_2m_min[originalIndex]
                  )}
                  º
                </span>
                <TempSlider
                  dotTemp={(() => {
                    const d = new Date(time);
                    const t = new Date();
                    if (
                      d.getFullYear() === t.getFullYear() &&
                      d.getMonth() === t.getMonth() &&
                      d.getDate() === t.getDate() &&
                      weatherData?.current.temperature_2m !== undefined
                    ) {
                      return weatherData?.current.temperature_2m;
                    } else {
                      return null;
                    }
                  })()}
                  minTemp={minTemp}
                  maxTemp={maxTemp}
                  lowTemp={weatherData?.daily.temperature_2m_min[originalIndex]}
                  highTemp={
                    weatherData?.daily.temperature_2m_max[originalIndex]
                  }
                  className="flex-1"
                />
                <span className="font-mono font-bold ml-2">
                  {Math.round(
                    weatherData?.daily.temperature_2m_max[originalIndex]
                  )}
                  º
                  {"\u00A0".repeat(
                    Math.max(
                      0,
                      maxHighWidth -
                        Math.round(
                          weatherData?.daily.temperature_2m_max[originalIndex]
                        ).toString().length
                    )
                  )}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
