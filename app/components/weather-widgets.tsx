"use client";

import { AirQualityResponse, WeatherResponse } from "@/lib/types/weather";
import FeelsLikeWidget from "./widgets/feels-like-widget";
import UVIndexWidget from "./widgets/uv-index-widget";
import WindWidget from "./widgets/wind-widget";
import SunWidget from "./widgets/sun-widget";
import HumidityWidget from "./widgets/humidity-widget";
import CloudCoverWidget from "./widgets/cloud-cover-widget";
import AirQualityWidget from "./widgets/air-quality-widget";
interface WeatherWidgetsProps {
  weatherData: WeatherResponse;
  airQualityData: AirQualityResponse | null;
}

export default function WeatherWidgets({
  weatherData,
  airQualityData,
}: WeatherWidgetsProps) {
  return (
    <div className="w-full px-6 pb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <WindWidget weatherData={weatherData} />
        <FeelsLikeWidget weatherData={weatherData} />
        <SunWidget weatherData={weatherData} />
        <UVIndexWidget weatherData={weatherData} />
        <CloudCoverWidget weatherData={weatherData} />
        <HumidityWidget weatherData={weatherData} />
        <AirQualityWidget airQualityData={airQualityData} />
      </div>
    </div>
  );
}
