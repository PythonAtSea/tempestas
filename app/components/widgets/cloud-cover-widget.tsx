"use client";

import { WeatherResponse } from "@/lib/types/weather";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";

interface CloudCoverWidgetProps {
  weatherData?: WeatherResponse;
}

export default function CloudCoverWidget({
  weatherData,
}: CloudCoverWidgetProps) {
  const cloudCover = weatherData?.current.cloud_cover || 0;

  const getCloudLabel = (value: number) => {
    if (value < 20) return "Clear";
    if (value < 40) return "Mostly Clear";
    if (value < 60) return "Partly Cloudy";
    if (value < 80) return "Mostly Cloudy";
    return "Overcast";
  };

  return (
    <GenericSliderWidget icon="wi-cloudy" title="Cloud Cover">
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {Math.round(cloudCover)}%
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {getCloudLabel(cloudCover)}
      </p>
      <Slider
        start={0}
        end={100}
        dotPercent={Math.min(100, Math.max(0, cloudCover))}
        gradient="linear-gradient(to right, #29B6F6, #7E8C9A, #37474F)"
        className="mt-auto mb-2"
      />
    </GenericSliderWidget>
  );
}
