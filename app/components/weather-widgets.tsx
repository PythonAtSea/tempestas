"use client";

import { WeatherResponse } from "@/lib/types/weather";
import FeelsLikeWidget from "./widgets/feels-like-widget";
import UVIndexWidget from "./widgets/uv-index-widget";
import WindWidget from "./widgets/wind-widget";
import SunWidget from "./widgets/sun-widget";
import HumidityWidget from "./widgets/humidity-widget";
import CloudCoverWidget from "./widgets/cloud-cover-widget";
interface WeatherWidgetsProps {
  weatherData: WeatherResponse;
}

export default function WeatherWidgets({ weatherData }: WeatherWidgetsProps) {
  return (
    <div className="w-full px-6 pb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <WindWidget weatherData={weatherData} />
        <FeelsLikeWidget weatherData={weatherData} />
        <UVIndexWidget weatherData={weatherData} />
        <SunWidget weatherData={weatherData} />
        <HumidityWidget weatherData={weatherData} />
        <CloudCoverWidget weatherData={weatherData} />
      </div>
    </div>
  );
}
