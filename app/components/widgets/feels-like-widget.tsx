"use client";

import { WeatherResponse } from "@/lib/types/weather";
import { getColorForTemp } from "@/lib/get-color-for-temp";
import Slider from "../slider";

interface FeelsLikeWidgetProps {
  weatherData: WeatherResponse;
}

export default function FeelsLikeWidget({ weatherData }: FeelsLikeWidgetProps) {
  return (
    <div className="aspect-square border bg-muted/20 p-3 flex flex-col">
      <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
        <i className="wi wi-fw wi-thermometer" />
        Feels like
      </p>
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {Math.round(weatherData.current.apparent_temperature)}º
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        Actual: {Math.round(weatherData.current.temperature_2m)}º
      </p>
      <Slider
        start={Math.min(
          weatherData.current.apparent_temperature <
            weatherData.current.temperature_2m
            ? 100
            : 0,
          weatherData.current.apparent_temperature <
            weatherData.current.temperature_2m
            ? 100 -
                ((weatherData.current.temperature_2m -
                  weatherData.current.apparent_temperature) /
                  15) *
                  100
            : ((weatherData.current.apparent_temperature -
                weatherData.current.temperature_2m) /
                15) *
                100
        )}
        end={Math.max(
          weatherData.current.apparent_temperature <
            weatherData.current.temperature_2m
            ? 100
            : 0,
          weatherData.current.apparent_temperature <
            weatherData.current.temperature_2m
            ? 100 -
                ((weatherData.current.temperature_2m -
                  weatherData.current.apparent_temperature) /
                  15) *
                  100
            : ((weatherData.current.apparent_temperature -
                weatherData.current.temperature_2m) /
                15) *
                100
        )}
        dotPercent={
          weatherData.current.apparent_temperature <
          weatherData.current.temperature_2m
            ? 100
            : 0
        }
        pillPercent={
          weatherData.current.apparent_temperature <
          weatherData.current.temperature_2m
            ? 100 -
              ((weatherData.current.temperature_2m -
                weatherData.current.apparent_temperature) /
                15) *
                100
            : ((weatherData.current.apparent_temperature -
                weatherData.current.temperature_2m) /
                15) *
              100
        }
        pillText={
          <span className="flex items-center">
            <i
              className={`-ml-1 wi wi-fw wi-direction-${
                weatherData.current.apparent_temperature <
                weatherData.current.temperature_2m
                  ? "down"
                  : "up"
              } scale-150`}
            />
            <span className="font-bold font-mono">
              {Math.round(
                Math.abs(
                  weatherData.current.apparent_temperature -
                    weatherData.current.temperature_2m
                )
              )}
              º
            </span>
          </span>
        }
        className="mt-auto mb-2"
        gradient={(() => {
          const apparentColor = getColorForTemp(
            weatherData.current.apparent_temperature
          );
          const actualColor = getColorForTemp(
            weatherData.current.temperature_2m
          );
          if (
            weatherData.current.apparent_temperature <
            weatherData.current.temperature_2m
          ) {
            return `linear-gradient(to right, ${apparentColor} 0%, ${actualColor} 100%)`;
          } else {
            return `linear-gradient(to right, ${actualColor} 0%, ${apparentColor} 100%)`;
          }
        })()}
      />
    </div>
  );
}
