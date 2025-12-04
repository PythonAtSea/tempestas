"use client";

import { WeatherResponse } from "@/lib/types/weather";
import GenericSliderWidget from "./generic-slider-widget";
import Slider from "../slider";
import { Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

interface CloudCoverWidgetProps {
  weatherData?: WeatherResponse;
}

export default function CloudCoverWidget({
  weatherData,
}: CloudCoverWidgetProps) {
  const cloudCover = weatherData?.current.cloud_cover || 0;

  const chartData =
    weatherData?.hourly.time
      .filter((time) => {
        const date = new Date(time);
        const now = new Date();
        return date.getDay() === now.getDay();
      })
      .map((time, index) => ({
        time: new Date(time),
        cloudCover: weatherData.hourly.cloud_cover[index],
      })) || [];

  const getCloudLabel = (value: number) => {
    if (value < 20) return "Clear";
    if (value < 40) return "Mostly Clear";
    if (value < 60) return "Partly Cloudy";
    if (value < 80) return "Mostly Cloudy";
    return "Overcast";
  };

  return (
    <GenericSliderWidget
      icon="wi-cloudy"
      title="Cloud Cover"
      dialogContent={
        <>
          <h3 className="text-xl font-bold">
            Cloud Cover: {Math.round(cloudCover)}%
          </h3>
          <p className="text-muted-foreground mb-2 font-bold text-sm">
            {getCloudLabel(cloudCover)}
          </p>
          <LineChart
            responsive
            data={chartData}
            className="w-full aspect-square select-none pointer-events-none"
          >
            <XAxis
              dataKey="time"
              tickFormatter={(time) => {
                const date = new Date(time);
                const hours = date.getHours();
                const period = hours >= 12 ? "pm" : "am";
                const displayHours = hours % 12 || 12;
                return `${displayHours}${period}`;
              }}
              interval={6}
            />
            <defs>
              <linearGradient
                id="cloudCoverGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#37474F" />
                <stop offset="50%" stopColor="#7E8C9A" />
                <stop offset="100%" stopColor="#29B6F6" />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} allowDecimals={false} width="auto" />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="cloudCover"
              stroke="url(#cloudCoverGradient)"
              strokeWidth={4}
              dot={false}
            />
            <ReferenceLine
              x={new Date().setMinutes(0, 0, 0)}
              stroke="currentColor"
              strokeOpacity={0.5}
              strokeWidth={3}
            />
          </LineChart>
        </>
      }
    >
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {Math.round(cloudCover)}%
      </h3>
      <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
        {getCloudLabel(cloudCover)}
      </p>
      <Slider
        start={0}
        end={Math.min(100, Math.max(0, cloudCover))}
        dotPercent={Math.min(100, Math.max(0, cloudCover))}
        gradient="linear-gradient(to right, #29B6F6, #7E8C9A, #37474F)"
        className="mt-auto mb-2"
        scaleGradient
      />
    </GenericSliderWidget>
  );
}
