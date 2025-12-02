"use client";

import { WeatherResponse } from "@/lib/types/weather";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";

interface UVIndexWidgetProps {
  weatherData: WeatherResponse;
}

export default function UVIndexWidget({ weatherData }: UVIndexWidgetProps) {
  const uvIndex = Math.round(weatherData.daily.uv_index_max[0]);

  const getUVLabel = (uv: number) => {
    if (uv < 3) return "Low";
    if (uv < 6) return "Moderate";
    if (uv < 8) return "High";
    if (uv < 11) return "Very High";
    return "Extreme";
  };

  return (
    <GenericSliderWidget icon="wi-day-sunny" title="UV Index">
      <h3 className="font-bold font-mono text-3xl relative mt-2">{uvIndex}</h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {getUVLabel(uvIndex)}
      </p>
      <Slider
        start={0}
        end={100}
        dotPercent={
          (Math.max(0, Math.min(11, weatherData.daily.uv_index_max[0])) / 11) *
          100
        }
        className="mt-auto mb-2"
      />
    </GenericSliderWidget>
  );
}
