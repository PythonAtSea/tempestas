"use client";

import { WeatherResponse } from "@/lib/types/weather";
import Slider from "../slider";

interface CloudCoverWidgetProps {
  weatherData?: WeatherResponse;
}

export default function CloudCoverWidget({
  weatherData,
}: CloudCoverWidgetProps) {
  return (
    <div className="aspect-square border bg-muted/20 p-3 flex flex-col">
      <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
        <i className="wi wi-fw wi-cloudy" />
        Cloud Cover
      </p>
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {Math.round(weatherData?.current.cloud_cover || 0)}%
      </h3>
      {weatherData?.current.cloud_cover !== undefined && (
        <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
          {weatherData?.current.cloud_cover < 20
            ? "Clear"
            : weatherData?.current.cloud_cover < 40
            ? "Mostly Clear"
            : weatherData?.current.cloud_cover < 60
            ? "Partly Cloudy"
            : weatherData?.current.cloud_cover < 80
            ? "Mostly Cloudy"
            : "Overcast"}
        </p>
      )}
      <Slider
        start={0}
        end={100}
        className="mt-auto mb-2"
        gradient="linear-gradient(to right, #29B6F6, #7E8C9A, #37474F)"
        dotPercent={Math.min(
          100,
          Math.max(0, weatherData?.current.cloud_cover || 0)
        )}
      />
    </div>
  );
}
