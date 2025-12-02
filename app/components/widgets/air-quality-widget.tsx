"use client";

import { AirQualityResponse } from "@/lib/types/weather";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";

interface AirQualityWidgetProps {
  airQualityData: AirQualityResponse | null;
}

export default function AirQualityWidget({
  airQualityData,
}: AirQualityWidgetProps) {
  const aqi = airQualityData?.hourly?.us_aqi?.[0] ?? 0;

  const getAQILabel = (value: number) => {
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for Some";
    if (value <= 200) return "Unhealthy";
    if (value <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  return (
    <GenericSliderWidget icon="wi-smog" title="Air Quality">
      <h3 className="font-bold font-mono text-3xl relative mt-2">{aqi}</h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {getAQILabel(aqi)}
      </p>
      <Slider
        start={0}
        end={100}
        dotPercent={aqi / 5}
        gradient="linear-gradient(to right, #00e400 0%, #ffff00 17%, #ff7e00 34%, #ff0000 50%, #8f3f97 67%, #7e0023 100%)"
        className="mt-auto mb-2"
      />
    </GenericSliderWidget>
  );
}
