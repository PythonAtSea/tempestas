"use client";

import { WeatherResponse } from "@/lib/types/weather";
import GenericSliderWidget from "./generic-slider-widget";
import { ReactNode } from "react";

const PI = Math.PI;
const sin = Math.sin;
const cos = Math.cos;
const asin = Math.asin;
const acos = Math.acos;
const rad = PI / 180;

const J1970 = 2440588;
const J2000 = 2451545;

function toJulian(date: Date) {
  return date.valueOf() / 86400000 - 0.5 + J1970;
}
function fromJulian(j: number) {
  return new Date((j + 0.5 - J1970) * 86400000);
}
function toDays(date: Date) {
  return toJulian(date) - J2000;
}

function getSunTimes(date: Date, lat: number, lng: number) {
  const times: Record<string, Date> = {};
  const lw = rad * -lng;
  const phi = rad * lat;
  const d = toDays(date);
  const n = Math.round(d - 0.0009 - lw / (2 * PI));
  const Jstar = J2000 + 0.0009 + lw / (2 * PI) + n;

  const M = rad * (357.5291 + 0.98560028 * (Jstar - J2000));
  const C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M));
  const lambda = rad * (280.4665 + 0.98564736 * (Jstar - J2000)) + C;
  const Jtransit = Jstar + 0.0053 * sin(M) - 0.0069 * sin(2 * lambda);
  const delta = asin(sin(lambda) * sin(rad * 23.4397));

  const getHourAngle = (h: number) => {
    const c = (sin(rad * h) - sin(phi) * sin(delta)) / (cos(phi) * cos(delta));
    if (c > 1 || c < -1) return null;
    return acos(c);
  };

  const addTime = (name: string, h: number) => {
    const w = getHourAngle(h);
    if (w === null) return;
    const Jrise = Jtransit - w / (2 * PI);
    const Jset = Jtransit + w / (2 * PI);
    times[name + "Rise"] = fromJulian(Jrise);
    times[name + "Set"] = fromJulian(Jset);
  };

  addTime("civil", -6);
  addTime("nautical", -12);
  addTime("astronomical", -18);

  return times;
}

interface SunWidgetProps {
  weatherData: WeatherResponse;
}

function InfoItem({
  iconClass,
  title,
  children,
}: {
  iconClass: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <span className="flex flex-row items-center border-b-2 last:border-b-0 py-2">
      <i className={`${iconClass} mr-2 text-muted-foreground`} />
      <span className="font-bold mr-auto text-muted-foreground">{title}</span>
      &nbsp;
      <span className="font-mono font-bold">{children}</span>
    </span>
  );
}

export default function SunWidget({ weatherData }: SunWidgetProps) {
  const SHOW_DEBUG = false;

  const todayDate = new Date(weatherData?.daily?.sunrise?.[0]);
  const sunTimes = getSunTimes(
    todayDate,
    weatherData.latitude,
    weatherData.longitude
  );

  const renderTime = (date: Date | undefined) => {
    if (!date) return "N/A";
    const fullStr = date.toLocaleTimeString("en-US", {
      timeZone: weatherData.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const timeStr = fullStr.replace(/\s?(AM|PM)$/i, "");
    const ampm = fullStr.match(/(AM|PM)/i)?.[0] || "";

    return (
      <>
        {timeStr}
        <span className="text-muted-foreground text-xs">{ampm}</span>
      </>
    );
  };

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

  const todaySunrise = new Date(weatherData?.daily?.sunrise?.[0]);
  const todaySunset = new Date(weatherData?.daily?.sunset?.[0]);
  const sunriseMinutes =
    todaySunrise.getHours() * 60 + todaySunrise.getMinutes();
  const sunsetMinutes = todaySunset.getHours() * 60 + todaySunset.getMinutes();
  const solarNoonMinutes = (sunriseMinutes + sunsetMinutes) / 2;
  const solarNoonPos = (solarNoonMinutes / (24 * 60)) * 100;
  const shift = solarNoonPos - 50;

  const yPos =
    waveCenterY +
    waveAmplitude * Math.cos(((xPos - shift) / 100) * 2 * Math.PI);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowXPos = (nowMinutes / (24 * 60)) * 100;
  const nowYPos =
    waveCenterY +
    waveAmplitude * Math.cos(((nowXPos - shift) / 100) * 2 * Math.PI);

  const wavePath = (() => {
    const points: string[] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      const y =
        padding +
        waveCenterY +
        waveAmplitude * Math.cos(((x - shift) / 100) * 2 * Math.PI);
      points.push(`${i === 0 ? "M" : "L"}${x},${y}`);
    }
    return points.join(" ");
  })();

  const adjustedYPos = yPos + padding;
  const adjustedNowYPos = nowYPos + padding;
  const totalSvgHeight = svgHeight + padding * 2;

  const getPos = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const minutes = date.getHours() * 60 + date.getMinutes();
    const x = (minutes / (24 * 60)) * 100;
    const y =
      padding +
      waveCenterY +
      waveAmplitude * Math.cos(((x - shift) / 100) * 2 * Math.PI);
    return { x, y };
  };

  const getPosFromDate = (date: Date | undefined) => {
    if (!date) return null;
    const minutes = date.getHours() * 60 + date.getMinutes();
    const x = (minutes / (24 * 60)) * 100;
    const y =
      padding +
      waveCenterY +
      waveAmplitude * Math.cos(((x - shift) / 100) * 2 * Math.PI);
    return { x, y };
  };

  const sunrisePos = getPos(weatherData?.daily?.sunrise?.[0]);
  const sunsetPos = getPos(weatherData?.daily?.sunset?.[0]);

  const twilightPositions = [
    { pos: getPosFromDate(sunTimes.civilRise), color: "bg-muted-foreground" },
    { pos: getPosFromDate(sunTimes.civilSet), color: "bg-muted-foreground" },
    {
      pos: getPosFromDate(sunTimes.nauticalRise),
      color: "bg-muted-foreground/70",
    },
    {
      pos: getPosFromDate(sunTimes.nauticalSet),
      color: "bg-muted-foreground/70",
    },
    {
      pos: getPosFromDate(sunTimes.astronomicalRise),
      color: "bg-muted-foreground/50",
    },
    {
      pos: getPosFromDate(sunTimes.astronomicalSet),
      color: "bg-muted-foreground/50",
    },
  ]
    .filter(
      (item): item is { pos: { x: number; y: number }; color: string } =>
        item.pos !== null
    )
    .map((item) => ({ ...item.pos, color: item.color }));

  return (
    <GenericSliderWidget
      icon={isDay ? "wi-sunset" : "wi-sunrise"}
      title={isDay ? "Sunset" : "Sunrise"}
      removePadding={true}
      dialogContent={
        <div className="flex flex-col">
          <div className="p-6 pb-0">
            <h3 className="text-xl font-bold">
              {isDay ? "Sunset" : "Sunrise"} at{" "}
              <span className="font-mono">
                {eventTime
                  .toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .replace(/\s?(AM|PM)$/i, "")}
                <span className="text-muted-foreground text-xs">
                  {eventTime.getHours() >= 12 ? "PM" : "AM"}
                </span>
              </span>
            </h3>
          </div>
          <SunGraph
            wavePath={wavePath}
            adjustedYPos={adjustedYPos}
            totalSvgHeight={totalSvgHeight}
            nowXPos={nowXPos}
            adjustedNowYPos={adjustedNowYPos}
            isDay={isDay}
            sunrisePos={sunrisePos}
            sunsetPos={sunsetPos}
            showDebug={SHOW_DEBUG}
            idPrefix="dialog"
            className="mt-4 h-48"
            twilightPositions={twilightPositions}
          />
          <div className="p-6 pt-0 -mt-4">
            <InfoItem iconClass="wi wi-sunrise wi-fw" title="Sunrise:">
              {new Date(weatherData?.daily.sunrise[1])
                .toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
                .replace(/\s?(AM|PM)$/i, "")}
              <span className="text-muted-foreground text-xs">
                {new Date(weatherData?.daily.sunrise[1]).getHours() >= 12
                  ? "PM"
                  : "AM"}
              </span>
            </InfoItem>
            <InfoItem iconClass="wi wi-sunset wi-fw" title="Sunset:">
              {new Date(weatherData?.daily.sunset[0])
                .toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
                .replace(/\s?(AM|PM)$/i, "")}
              <span className="text-muted-foreground text-xs">
                {new Date(weatherData?.daily.sunset[0]).getHours() >= 12
                  ? "PM"
                  : "AM"}
              </span>
            </InfoItem>
            <InfoItem iconClass="wi wi-hot wi-fw" title="Solar Noon:">
              {weatherData?.daily.sunrise[0] && weatherData?.daily.sunset[0]
                ? (() => {
                    const sunrise = new Date(weatherData.daily.sunrise[0]);
                    const sunset = new Date(weatherData.daily.sunset[0]);
                    const solarNoon = new Date(
                      (sunrise.getTime() + sunset.getTime()) / 2
                    );
                    return (
                      <>
                        {solarNoon
                          .toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(/\s?(AM|PM)$/i, "")}
                        <span className="text-muted-foreground text-xs">
                          {solarNoon.getHours() >= 12 ? "PM" : "AM"}
                        </span>
                      </>
                    );
                  })()
                : "N/A"}
            </InfoItem>
            <InfoItem iconClass="wi wi-day-sunny wi-fw" title="Day Length:">
              {weatherData?.daily.sunrise[0] && weatherData?.daily.sunset[0]
                ? (() => {
                    const sunrise = new Date(weatherData.daily.sunrise[0]);
                    const sunset = new Date(weatherData.daily.sunset[0]);
                    const dayLengthMs = sunset.getTime() - sunrise.getTime();
                    const hours = Math.floor(dayLengthMs / (1000 * 60 * 60));
                    const minutes = Math.floor(
                      (dayLengthMs % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    return (
                      <span>
                        {hours}
                        <span className="text-muted-foreground text-xs">
                          H
                        </span>{" "}
                        {minutes}
                        <span className="text-muted-foreground text-xs">M</span>
                      </span>
                    );
                  })()
                : "N/A"}
            </InfoItem>
            <InfoItem iconClass="wi wi-night-clear wi-fw" title="Night Length:">
              {weatherData?.daily.sunrise[1] && weatherData?.daily.sunset[0]
                ? (() => {
                    const sunset = new Date(weatherData.daily.sunset[0]);
                    const nextSunrise = new Date(weatherData.daily.sunrise[1]);
                    const nightLengthMs =
                      nextSunrise.getTime() - sunset.getTime();
                    const hours = Math.floor(nightLengthMs / (1000 * 60 * 60));
                    const minutes = Math.floor(
                      (nightLengthMs % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    return (
                      <span>
                        {hours}
                        <span className="text-muted-foreground text-xs">
                          H
                        </span>{" "}
                        {minutes}
                        <span className="text-muted-foreground text-xs">M</span>
                      </span>
                    );
                  })()
                : "N/A"}
            </InfoItem>

            <h4 className="font-bold mb-2 mt-4 text-sm text-muted-foreground uppercase tracking-wider">
              Twilight Periods
            </h4>

            <InfoItem iconClass="wi wi-horizon" title="Civil:">
              <span>
                {renderTime(sunTimes.civilRise)} /{" "}
                {renderTime(sunTimes.civilSet)}
              </span>
            </InfoItem>
            <InfoItem iconClass="wi wi-horizon-alt" title="Nautical:">
              <span>
                {renderTime(sunTimes.nauticalRise)} /{" "}
                {renderTime(sunTimes.nauticalSet)}
              </span>
            </InfoItem>
            <InfoItem iconClass="wi wi-stars" title="Astronomical:">
              <span>
                {renderTime(sunTimes.astronomicalRise)} /{" "}
                {renderTime(sunTimes.astronomicalSet)}
              </span>
            </InfoItem>
          </div>
        </div>
      }
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
      <div className="absolute left-0 right-0 top-1/2 w-full h-[35%]">
        <SunGraph
          wavePath={wavePath}
          adjustedYPos={adjustedYPos}
          totalSvgHeight={totalSvgHeight}
          nowXPos={nowXPos}
          adjustedNowYPos={adjustedNowYPos}
          isDay={isDay}
          sunrisePos={sunrisePos}
          sunsetPos={sunsetPos}
          showDebug={SHOW_DEBUG}
          idPrefix="widget"
        />
      </div>
    </GenericSliderWidget>
  );
}

interface SunGraphProps {
  wavePath: string;
  adjustedYPos: number;
  totalSvgHeight: number;
  nowXPos: number;
  adjustedNowYPos: number;
  isDay: boolean;
  sunrisePos: { x: number; y: number } | null;
  sunsetPos: { x: number; y: number } | null;
  showDebug: boolean;
  idPrefix: string;
  className?: string;
  twilightPositions?: { x: number; y: number; color: string }[];
}

function SunGraph({
  wavePath,
  adjustedYPos,
  totalSvgHeight,
  nowXPos,
  adjustedNowYPos,
  isDay,
  sunrisePos,
  sunsetPos,
  showDebug,
  idPrefix,
  className,
  twilightPositions,
}: SunGraphProps) {
  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <svg
        className="w-full h-full"
        viewBox={`0 0 100 ${totalSvgHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`${idPrefix}-aboveGradient`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient
            id={`${idPrefix}-belowGradient`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.02" />
          </linearGradient>
          <clipPath id={`${idPrefix}-clipAbove`}>
            <rect x="0" y="0" width="100" height={adjustedYPos} />
          </clipPath>
          <clipPath id={`${idPrefix}-clipBelow`}>
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
          stroke={`url(#${idPrefix}-aboveGradient)`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          clipPath={`url(#${idPrefix}-clipAbove)`}
        />
        <path
          d={wavePath}
          fill="none"
          stroke={`url(#${idPrefix}-belowGradient)`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          clipPath={`url(#${idPrefix}-clipBelow)`}
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
      <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none">
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
        {twilightPositions?.map((tp, i) => (
          <div
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${tp.color}`}
            style={{
              left: `${tp.x}%`,
              top: `${(tp.y / totalSvgHeight) * 100}%`,
            }}
          />
        ))}
        {sunrisePos && showDebug && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 size-0.5 rounded-full bg-red-500"
            style={{
              left: `${sunrisePos.x}%`,
              top: `${(sunrisePos.y / totalSvgHeight) * 100}%`,
            }}
          />
        )}
        {sunsetPos && showDebug && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 size-0.5 rounded-full bg-red-500"
            style={{
              left: `${sunsetPos.x}%`,
              top: `${(sunsetPos.y / totalSvgHeight) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
