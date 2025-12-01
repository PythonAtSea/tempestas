"use client";

import { AirQualityResponse } from "@/lib/types/weather";
import Slider from "../slider";

interface AirQualityWidgetProps {
  airQualityData: AirQualityResponse | null;
}

export default function AirQualityWidget({
  airQualityData,
}: AirQualityWidgetProps) {
  const aqi = airQualityData?.hourly?.us_aqi?.[0] ?? 0;

  return (
    <div className="aspect-square border bg-muted/20 p-3 flex flex-col">
      <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
        <i className="wi wi-fw wi-smog" />
        Air Quality
      </p>
      <h3 className="font-bold font-mono text-3xl relative mt-2">{aqi}</h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {aqi <= 50
          ? "Good"
          : aqi <= 100
          ? "Moderate"
          : aqi <= 150
          ? "Unhealthy for Some"
          : aqi <= 200
          ? "Unhealthy"
          : aqi <= 300
          ? "Very Unhealthy"
          : "Hazardous"}
      </p>
      <Slider
        start={0}
        end={100}
        className="mt-auto mb-2"
        dotPercent={aqi / 5}
        gradient="linear-gradient(to right, #00e400 0%, #ffff00 17%, #ff7e00 34%, #ff0000 50%, #8f3f97 67%, #7e0023 100%)"
      />
    </div>
  );
}
