"use client";

import { WeatherResponse } from "@/lib/types/weather";
import GenericSliderWidget from "./generic-slider-widget";

interface SunWidgetProps {
  weatherData: WeatherResponse;
}

export default function SunWidget({ weatherData }: SunWidgetProps) {
  const isDay = weatherData?.current?.is_day === 1;
  const eventKey = isDay ? "sunset" : "sunrise";
  const eventTime = new Date(weatherData?.daily[eventKey][0]);

  const svgHeight = 50;
  const waveAmplitude = 22;
  const waveCenterY = svgHeight / 2;
  const padding = 7;

  const hours = eventTime.getHours();
  const minutes = eventTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const xPos = (totalMinutes / (24 * 60)) * 100;
  const yPos =
    waveCenterY + waveAmplitude * Math.cos((xPos / 100) * 2 * Math.PI);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowXPos = (nowMinutes / (24 * 60)) * 100;
  const nowYPos =
    waveCenterY + waveAmplitude * Math.cos((nowXPos / 100) * 2 * Math.PI);

  const wavePath = (() => {
    const points: string[] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      const y =
        padding +
        waveCenterY +
        waveAmplitude * Math.cos((i / steps) * 2 * Math.PI);
      points.push(`${i === 0 ? "M" : "L"}${x},${y}`);
    }
    return points.join(" ");
  })();

  const adjustedYPos = yPos + padding;
  const adjustedNowYPos = nowYPos + padding;
  const totalSvgHeight = svgHeight + padding * 2;

  return (
    <GenericSliderWidget
      icon={isDay ? "wi-sunset" : "wi-sunrise"}
      title={isDay ? "Sunset" : "Sunrise"}
      className="overflow-hidden"
    >
      <h3 className="font-bold font-mono text-3xl relative mt-2">
        {eventTime
          .toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          .replace(/\s?(AM|PM)$/i, "")}
        <span className="text-muted-foreground text-lg">
          {isDay ? "PM" : "AM"}
        </span>
      </h3>
      <p className="text-muted-foreground text-xs mt-auto font-bold">
        {isDay ? (
          <span>
            Sunrise at{" "}
            {new Date(weatherData?.daily.sunrise[1])
              .toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              .replace(/\s?(AM|PM)$/i, "")}
            <span className="text-muted-foreground text-xs">
              {` ${
                new Date(weatherData?.daily.sunrise[1]).getHours() >= 12
                  ? "PM"
                  : "AM"
              }`}
            </span>
          </span>
        ) : (
          <span>
            Sunset at{" "}
            {new Date(weatherData?.daily.sunset[0])
              .toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              .replace(/\s?(AM|PM)$/i, "")}
            <span className="text-muted-foreground text-xs">
              {` ${
                new Date(weatherData?.daily.sunset[0]).getHours() >= 12
                  ? "PM"
                  : "AM"
              }`}
            </span>
          </span>
        )}
      </p>
      <svg
        className="absolute left-0 right-0 top-1/2 w-full"
        viewBox={`0 0 100 ${totalSvgHeight}`}
        preserveAspectRatio="none"
        style={{ height: "35%" }}
      >
        <defs>
          <linearGradient id="aboveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="belowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.02" />
          </linearGradient>
          <clipPath id="clipAbove">
            <rect x="0" y="0" width="100" height={adjustedYPos} />
          </clipPath>
          <clipPath id="clipBelow">
            <rect
              x="0"
              y={adjustedYPos}
              width="100"
              height={totalSvgHeight - adjustedYPos}
            />
          </clipPath>
        </defs>
        <path
          d={wavePath}
          fill="none"
          stroke="url(#aboveGradient)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          clipPath="url(#clipAbove)"
        />
        <path
          d={wavePath}
          fill="none"
          stroke="url(#belowGradient)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          clipPath="url(#clipBelow)"
        />
        <line
          x1={0}
          y1={adjustedYPos}
          x2={100}
          y2={adjustedYPos}
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute left-0 right-0 top-1/2 w-full h-[35%] pointer-events-none">
        <div
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
            !isDay ? "bg-black" : "bg-white"
          }`}
          style={{
            boxShadow: "0px 0px 2px 2px white",
            left: `${nowXPos}%`,
            top: `${(adjustedNowYPos / totalSvgHeight) * 100}%`,
          }}
        />
      </div>
    </GenericSliderWidget>
  );
}
