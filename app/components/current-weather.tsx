"use client";

import { WeatherResponse } from "@/lib/types/weather";
import { getWeatherCodeDescription } from "@/lib/weather-code";

interface CurrentWeatherProps {
  weatherData: WeatherResponse | null;
}

export default function CurrentWeather({ weatherData }: CurrentWeatherProps) {
  return (
    <>
      <h3 className="relative font-bold font-mono text-4xl">
        {weatherData?.current.temperature_2m
          ? Math.round(weatherData.current.temperature_2m)
          : "--"}
        <span className="absolute top-0 left-full">º</span>
      </h3>
      <h4 className="text-muted-foreground font-bold">
        {
          getWeatherCodeDescription(
            weatherData?.current.weather_code || -1,
            weatherData?.current.is_day === 1 ? true : false
          ).weatherCondition
        }
      </h4>
    </>
  );
}
