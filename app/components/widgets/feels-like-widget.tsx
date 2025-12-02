"use client";


import { WeatherResponse } from "@/lib/types/weather";
import { getColorForTemp } from "@/lib/get-color-for-temp";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";

interface FeelsLikeWidgetProps {
  weatherData: WeatherResponse;
}

export default function FeelsLikeWidget({ weatherData }: FeelsLikeWidgetProps) {
  const apparentTemp = weatherData.current.apparent_temperature;
  const actualTemp = weatherData.current.temperature_2m;
  const isColder = apparentTemp < actualTemp;

  const sliderValue = isColder
    ? 100 - ((actualTemp - apparentTemp) / 15) * 100
    : ((apparentTemp - actualTemp) / 15) * 100;

  const apparentColor = getColorForTemp(apparentTemp);
  const actualColor = getColorForTemp(actualTemp);
  const gradient = isColder
    ? `linear-gradient(to right, ${apparentColor} 0%, ${actualColor} 100%)`
    : `linear-gradient(to right, ${actualColor} 0%, ${apparentColor} 100%)`;

  return (
    <GenericSliderWidget icon="wi-thermometer" title="Feels like">
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
