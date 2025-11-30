"use client";

import { WeatherResponse } from "@/lib/types/weather";
import Slider from "../slider";

interface HumidityWidgetProps {
  weatherData: WeatherResponse;
}

export default function Widget({ weatherData }: HumidityWidgetProps) {
  return (
    <div className="aspect-square border bg-muted/20 p-3 flex flex-col">
      <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
        <i className="wi wi-fw wi-humidity" />
        Humidity
      </p>
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {weatherData.current.relative_humidity_2m}%
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {(() => {
          const T_F = weatherData.current.temperature_2m ?? 32;
          const T_C = ((T_F - 32) * 5) / 9;
          const RH = Math.max(
            weatherData.current.relative_humidity_2m ?? 0,
            0.0001
          );
          const a = 17.27;
          const b = 237.7;
          const alpha = (a * T_C) / (b + T_C) + Math.log(RH / 100);
          const dewPointC = (b * alpha) / (a - alpha);
          const dewPointF = (dewPointC * 9) / 5 + 32;
          return `Dew point ${Math.round(dewPointF)}°F`;
        })()}
      </p>
      <Slider
        className="mt-auto mb-2"
        dotPercent={weatherData.current.relative_humidity_2m}
        gradient="linear-gradient(to right, #e67a00 0%, #f5d66a 20%, #8bd67a 50%, #4da6ff 75%, #0057c8 100%)"
        start={0}
        end={100}
      />
    </div>
  );
}
