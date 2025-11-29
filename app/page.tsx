"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Calendar, Loader2, Navigation, ChevronsLeft } from "lucide-react";
import TempSlider from "./components/temp-slider";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherResponse } from "@/lib/types/weather";
import { getWeatherCodeDescription } from "@/lib/weather-code";
import Slider from "./components/slider";
import { getColorForTemp } from "@/lib/get-color-for-temp";

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locError, setLocError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [geolocationSupported, setGeolocationSupported] = useState<
    boolean | null
  >(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [maxLowWidth, setMaxLowWidth] = useState(2);
  const [maxHighWidth, setMaxHighWidth] = useState(2);
  const [minTemp, setMinTemp] = useState(0);
  const [maxTemp, setMaxTemp] = useState(100);
  const [showScrollReset, setShowScrollReset] = useState(false);
  const [conditionsSummary, setConditionsSummary] = useState<string>("");
  const hourlyScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const supported =
      typeof navigator !== "undefined" && !!navigator.geolocation;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGeolocationSupported(supported);
    if (!supported) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        setLocError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();
    const { signal } = controller;
    fetch(
      `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${coords.lon},${coords.lat}&f=json`,
      { signal }
    )
      .then((response) => response.json())
      .then((data) => {
        if (!data?.address) return;
        setLocationName(data.address.City);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLocError(err.message || String(err));
      });
    return () => controller.abort();
  }, [coords]);

  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();
    const { signal } = controller;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,wind_speed_10m_max,wind_direction_10m_dominant,wind_gusts_10m_max,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,showers_sum,snowfall_sum,rain_sum,precipitation_sum,precipitation_hours,precipitation_probability_max&hourly=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,dew_point_2m,pressure_msl,cloud_cover,visibility,precipitation,precipitation_probability,rain,showers,snowfall,snow_depth,wind_speed_10m,wind_gusts_10m,surface_pressure&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,rain,showers,snowfall,cloud_cover,pressure_msl,surface_pressure&timezone=auto&past_days=0&forecast_days=14&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`,
      { signal }
    )
      .then((response) => response.json())
      .then((data: WeatherResponse) => {
        setWeatherData(data);
        setMinTemp(Math.min(...(data.daily.temperature_2m_min ?? [0])));
        setMaxTemp(
          Math.max(...(data.daily.temperature_2m_max ?? [100])) ?? 100
        );
        setMaxLowWidth(
          Math.max(
            ...(data.daily.temperature_2m_min.map((t) => {
              return Math.round(t).toString().length;
            }) ?? [2])
          )
        );
        setMaxHighWidth(
          Math.max(
            ...(data.daily.temperature_2m_max.map((t) => {
              return Math.round(t).toString().length;
            }) ?? [2])
          )
        );
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLocError(err.message || String(err));
      });
    return () => controller.abort();
  }, [coords]);

  useEffect(() => {
    if (!weatherData) return;
    const controller = new AbortController();
    const { signal } = controller;

    fetch("/api/summary/conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weatherData),
      signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setConditionsSummary(data.content);
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Error getting conditions summary:", err);
      });

    return () => controller.abort();
  }, [weatherData]);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="mt-10 ">
        {coords && (
          <div className="flex flex-row items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Navigation className="inline-block size-3" />
            <p>Current Location</p>
          </div>
        )}
        {geolocationSupported === null && (
          <div className="flex flex-row items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Loader2 className="inline-block size-3 animate-spin" />
            <p>Loading...</p>
          </div>
        )}
        {geolocationSupported === false && (
          <p className="mt-1 text-xs text-red-500">Geolocation not supported</p>
        )}
        {geolocationSupported && !coords && !locError && (
          <div className="flex flex-row items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Navigation className="inline-block size-3" />
            <p>Loading...</p>
          </div>
        )}
        {locError && geolocationSupported && (
          <p className="mt-1 text-xs text-red-500">{locError}</p>
        )}
      </div>
      {locationName ? (
        <p className="text-muted-foreground uppercase font-bold text-xs">
          {locationName}
        </p>
      ) : (
        <Skeleton className="h-4 w-20" />
      )}
      <h3 className="relative font-bold font-mono text-4xl">
        {weatherData?.current.temperature_2m
          ? Math.round(weatherData.current.temperature_2m)
          : "--"}
        <span className="absolute top-0 left-full">º</span>
      </h3>
      <h4 className="text-muted-foreground font-bold">
        {
          getWeatherCodeDescription(
            weatherData?.current.weather_code || -1,
            weatherData?.current.is_day === 1 ? true : false
          ).weatherCondition
        }
      </h4>
      <div className="p-6 w-full pb-0">
        <div className="border border-red-500 w-full">
          <div className="bg-red-500 mt-0 p-2 px-4">
            [PLACEHOLDER] Tornado Warning
          </div>
          <p className="p-4">
            There is a tornado warning in effect for Banana County, East
            Caroline from 26:15 till 45:00
          </p>
        </div>
      </div>
      {weatherData && (
        <>
          <div className="p-6 w-full pb-0">
            <p className="text-sm border border-b-0 p-4">
              {conditionsSummary ? (
                <span>{conditionsSummary}</span>
              ) : (
                <>
                  <Loader2 className="inline-block size-4 animate-spin mr-2" />
                  <span className="text-muted-foreground">
                    Fetching summary...
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="w-full p-6 pt-0">
            <div className="relative">
              <div
                ref={hourlyScrollRef}
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  setShowScrollReset(scrollLeft > 50);
                }}
                className="w-full border overflow-x-auto overflow-y-hidden"
              >
                <div className="flex w-max gap-4 px-4 py-4">
                  {weatherData?.hourly.time
                    .filter((time) => {
                      const date = new Date(time);
                      const now = new Date();
                      return date.getTime() > now.getTime() - 60 * 60 * 1000;
                    })
                    .map((time, i) => (
                      <div
                        key={i}
                        className="shrink-0 flex flex-col items-center gap-2"
                      >
                        <div className="relative pb-3">
                          <span
                            className={`text-sm text-muted-foreground block text-center ${
                              new Date(time).getDay() === new Date().getDay()
                                ? "mt-1.5 -mb-1.5"
                                : ""
                            }`}
                          >
                            {new Date(time).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              hour12: true,
                            })}
                          </span>
                          {new Date(time).getDay() !== new Date().getDay() && (
                            <span className="absolute left-1/2 transform -translate-x-1/2 text-xs font-bold uppercase text-muted-foreground">
                              {new Date(time).toLocaleDateString(undefined, {
                                weekday: "short",
                              })}
                            </span>
                          )}
                        </div>
                        <i
                          className={`wi wi-fw scale-125 ${
                            getWeatherCodeDescription(
                              weatherData?.hourly.weather_code[i]
                            ).iconClass
                          } py-2`}
                        />
                        <span className="font-mono font-bold relative">
                          {Math.round(
                            weatherData?.hourly.temperature_2m[i] ?? 0
                          )
                            .toString()
                            .padStart(2, "\u00A0")}
                          <span className="absolute top-0 left-full">º</span>
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              {showScrollReset && (
                <button
                  onClick={() => {
                    if (hourlyScrollRef.current) {
                      hourlyScrollRef.current.scrollTo({
                        left: 0,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="absolute left-4 top-9 -translate-y-1/2 bg-background border p-2 shadow-lg hover:bg-accent transition-colors"
                  aria-label="Reset scroll position"
                >
                  <ChevronsLeft className="size-5" />
                </button>
              )}
            </div>
          </div>
          <div className="w-full px-6 pb-6">
            <div className="border">
              <p className="p-2 font-bold text-muted-foreground flex flex-row items-center gap-2">
                <Calendar className="inline-block size-4" />
                14 day forecast
              </p>
              <div className="w-full">
                {weatherData?.daily.time
                  .filter((time) => {
                    return (
                      new Date(time).getTime() > new Date().setHours(0, 0, 0, 0)
                    );
                  })
                  .map((time, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 border-t"
                    >
                      <div className="flex items-center gap-4 mr-4">
                        <span className="w-9 text-sm">
                          {(() => {
                            const d = new Date(time);
                            const t = new Date();
                            if (
                              d.getFullYear() === t.getFullYear() &&
                              d.getMonth() === t.getMonth() &&
                              d.getDate() === t.getDate()
                            ) {
                              return "Today";
                            }
                            return d.toLocaleDateString(undefined, {
                              weekday: "short",
                            });
                          })()}
                        </span>
                        <i
                          className={`wi wi-fw scale-125 ${
                            getWeatherCodeDescription(
                              weatherData?.daily.weather_code[i]
                            ).iconClass
                          }`}
                        />
                      </div>
                      <span className="font-mono font-bold relative mr-2 text-muted-foreground">
                        {"\u00A0".repeat(
                          Math.max(
                            0,
                            maxLowWidth -
                              Math.round(
                                weatherData?.daily.temperature_2m_min[i]
                              ).toString().length
                          )
                        )}
                        {Math.round(weatherData?.daily.temperature_2m_min[i])}º
                      </span>
                      <TempSlider
                        dotTemp={(() => {
                          const d = new Date(time);
                          const t = new Date();
                          if (
                            d.getFullYear() === t.getFullYear() &&
                            d.getMonth() === t.getMonth() &&
                            d.getDate() === t.getDate() &&
                            weatherData?.current.temperature_2m !== undefined
                          ) {
                            return weatherData?.current.temperature_2m;
                          } else {
                            return null;
                          }
                        })()}
                        minTemp={minTemp}
                        maxTemp={maxTemp}
                        lowTemp={weatherData?.daily.temperature_2m_min[i]}
                        highTemp={weatherData?.daily.temperature_2m_max[i]}
                        className="flex-1"
                      />
                      <span className="font-mono font-bold ml-2">
                        {Math.round(weatherData?.daily.temperature_2m_max[i])}º
                        {"\u00A0".repeat(
                          Math.max(
                            0,
                            maxHighWidth -
                              Math.round(
                                weatherData?.daily.temperature_2m_max[i]
                              ).toString().length
                          )
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="w-full px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="aspect-square border bg-muted/20 p-3 flex flex-col">
                <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
                  <i className="wi wi-fw wi-thermometer" />
                  Feels like
                </p>
                <h3 className="font-bold font-mono text-3xl relative mt-2">
                  {Math.round(weatherData.current.apparent_temperature)}º
                </h3>
                <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
                  Actual: {Math.round(weatherData.current.temperature_2m)}º
                </p>
                <Slider
                  start={0}
                  end={100}
                  dotPercent={
                    weatherData.current.apparent_temperature <
                    weatherData.current.temperature_2m
                      ? 100
                      : 0
                  }
                  pillPercent={
                    weatherData.current.apparent_temperature <
                    weatherData.current.temperature_2m
                      ? 0
                      : 100
                  }
                  pillText={
                    <span className="flex items-center">
                      <i
                        className={`wi wi-fw wi-direction-${
                          weatherData.current.apparent_temperature <
                          weatherData.current.temperature_2m
                            ? "down"
                            : "up"
                        } scale-150`}
                      />
                      <span className="font-bold font-mono">
                        {Math.round(
                          Math.abs(
                            weatherData.current.apparent_temperature -
                              weatherData.current.temperature_2m
                          )
                        )}
                        º
                      </span>
                    </span>
                  }
                  className="mt-auto mb-2"
                  gradient={`linear-gradient(to ${
                    weatherData.current.apparent_temperature <
                    weatherData.current.temperature_2m
                      ? "right"
                      : "left"
                  }, ${getColorForTemp(
                    weatherData.current.apparent_temperature
                  )} 0%, ${getColorForTemp(
                    weatherData.current.temperature_2m
                  )} 100%)`}
                />
              </div>
              <div className="aspect-square border bg-muted/20 p-3 flex flex-col">
                <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
                  <i className="wi wi-fw wi-day-sunny" />
                  UV Index
                </p>
                <h3 className="font-bold font-mono text-3xl relative mt-2">
                  {Math.round(weatherData.daily.uv_index_max[0])}
                </h3>
                <p className="text-sm text-muted-foreground -mt-2 mb-2 font-bold">
                  {Math.round(weatherData.daily.uv_index_max[0]) < 3
                    ? "Low"
                    : Math.round(weatherData.daily.uv_index_max[0]) < 6
                    ? "Moderate"
                    : Math.round(weatherData.daily.uv_index_max[0]) < 8
                    ? "High"
                    : Math.round(weatherData.daily.uv_index_max[0]) < 11
                    ? "Very High"
                    : "Extreme"}
                </p>
                <Slider
                  start={0}
                  end={100}
                  dotPercent={
                    (Math.max(
                      0,
                      Math.min(11, weatherData.daily.uv_index_max[0])
                    ) /
                      11) *
                    100
                  }
                  className="mt-auto mb-2"
                />
              </div>
              <div className="aspect-square border bg-muted/20 p-3 flex flex-col">
                <div className="relative w-full h-full flex items-center justify-center flex-1">
                  <div className="relative w-full h-full max-w-48 max-h-48">
                    <div className="absolute inset-0 rounded-full" />

                    {[...Array(180)].map((_, i) => {
                      const angle = i * 2;
                      const isCardinal = angle % 90 === 0;
                      const isMajor = angle % 30 === 0;
                      const isShown = isCardinal || isMajor || i % 3 === 0;

                      if (!isShown) return null;

                      const tickWidth = isCardinal || isMajor ? 2.5 : 2;
                      const tickLength = isCardinal ? 12 : 6;

                      return (
                        <div
                          key={i}
                          className="absolute w-full h-full"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <div
                            className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full ${
                              isCardinal || isMajor
                                ? "bg-muted-foreground"
                                : "bg-muted-foreground/50"
                            }`}
                            style={{
                              width: `${tickWidth}px`,
                              height: `${tickLength}px`,
                            }}
                          />
                        </div>
                      );
                    })}

                    <div className="absolute inset-0 flex items-center justify-center">
                      {(() => {
                        const windDir = weatherData.current.wind_direction_10m;
                        const isNearCardinal = (target: number) => {
                          const diff = Math.abs(
                            ((windDir - target + 180) % 360) - 180
                          );
                          const opposite = (target + 180) % 360;
                          const diffOpposite = Math.abs(
                            ((windDir - opposite + 180) % 360) - 180
                          );
                          return diff < 10 || diffOpposite < 10;
                        };
                        return (
                          <>
                            {!isNearCardinal(0) && (
                              <div className="absolute top-3 font-bold text-sm text-muted-foreground font-mono">
                                N
                              </div>
                            )}
                            {!isNearCardinal(180) && (
                              <div className="absolute bottom-3 font-bold text-sm text-muted-foreground font-mono">
                                S
                              </div>
                            )}
                            {!isNearCardinal(90) && (
                              <div className="absolute right-4 font-bold text-sm text-muted-foreground font-mono">
                                E
                              </div>
                            )}
                            {!isNearCardinal(270) && (
                              <div className="absolute left-4 font-bold text-sm text-muted-foreground font-mono">
                                W
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {(() => {
                      const ARROW_STROKE_WIDTH = 1.5;
                      const ARROW_TIP_Y = 7;
                      const ARROW_SHAFT_LENGTH = 15;
                      const ARROW_HEAD_LENGTH = 6;
                      const ARROW_HEAD_ANGLE = 45;
                      const ARROW_CENTER_X = 50;
                      const OPPOSITE_TIP_SHORT = 5;

                      const shaftEndY = ARROW_TIP_Y + ARROW_SHAFT_LENGTH;
                      const headAngleRad = (ARROW_HEAD_ANGLE * Math.PI) / 180;
                      const headOffsetX =
                        Math.sin(headAngleRad) * ARROW_HEAD_LENGTH;
                      const headOffsetY =
                        Math.cos(headAngleRad) * ARROW_HEAD_LENGTH;

                      const OPPOSITE_TIP_Y =
                        100 - ARROW_TIP_Y - OPPOSITE_TIP_SHORT;
                      const oppositeShaftEndY =
                        OPPOSITE_TIP_Y -
                        ARROW_SHAFT_LENGTH +
                        OPPOSITE_TIP_SHORT;

                      return (
                        <svg
                          className="absolute w-full h-full"
                          viewBox="0 0 100 100"
                          style={{
                            transform: `rotate(${weatherData.current.wind_direction_10m}deg)`,
                          }}
                        >
                          <line
                            x1={ARROW_CENTER_X}
                            y1={ARROW_TIP_Y}
                            x2={ARROW_CENTER_X}
                            y2={shaftEndY}
                            stroke="currentColor"
                            strokeWidth={ARROW_STROKE_WIDTH}
                            strokeLinecap="round"
                          />
                          <line
                            x1={ARROW_CENTER_X}
                            y1={ARROW_TIP_Y}
                            x2={ARROW_CENTER_X - headOffsetX}
                            y2={ARROW_TIP_Y + headOffsetY}
                            stroke="currentColor"
                            strokeWidth={ARROW_STROKE_WIDTH}
                            strokeLinecap="round"
                          />
                          <line
                            x1={ARROW_CENTER_X}
                            y1={ARROW_TIP_Y}
                            x2={ARROW_CENTER_X + headOffsetX}
                            y2={ARROW_TIP_Y + headOffsetY}
                            stroke="currentColor"
                            strokeWidth={ARROW_STROKE_WIDTH}
                            strokeLinecap="round"
                          />
                          <line
                            x1={ARROW_CENTER_X}
                            y1={OPPOSITE_TIP_Y}
                            x2={ARROW_CENTER_X}
                            y2={oppositeShaftEndY}
                            stroke="currentColor"
                            strokeWidth={ARROW_STROKE_WIDTH}
                            strokeLinecap="round"
                          />
                          <line
                            x1={ARROW_CENTER_X}
                            y1={OPPOSITE_TIP_Y}
                            x2={ARROW_CENTER_X - headOffsetX}
                            y2={OPPOSITE_TIP_Y + headOffsetY}
                            stroke="currentColor"
                            strokeWidth={ARROW_STROKE_WIDTH}
                            strokeLinecap="round"
                          />
                          <line
                            x1={ARROW_CENTER_X}
                            y1={OPPOSITE_TIP_Y}
                            x2={ARROW_CENTER_X + headOffsetX}
                            y2={OPPOSITE_TIP_Y + headOffsetY}
                            stroke="currentColor"
                            strokeWidth={ARROW_STROKE_WIDTH}
                            strokeLinecap="round"
                          />
                        </svg>
                      );
                    })()}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
                      <h3 className="font-bold font-mono text-xl">
                        {Math.round(weatherData.current.wind_speed_10m)}
                      </h3>
                      <p className="text-xs -mt-2 text-muted-foreground font-bold">
                        Gusts: {Math.round(weatherData.current.wind_gusts_10m)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="aspect-square border bg-muted/20 p-3 flex flex-col overflow-hidden relative">
                <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
                  <i
                    className={`wi wi-fw ${
                      weatherData?.current?.is_day === 1
                        ? "wi-sunset"
                        : "wi-sunrise"
                    }`}
                  />
                  {weatherData?.current?.is_day === 1 ? "Sunset" : "Sunrise"}
                </p>
                <h3 className="font-bold font-mono text-3xl relative mt-2">
                  {new Date(
                    weatherData?.daily[
                      weatherData?.current?.is_day === 1 ? "sunset" : "sunrise"
                    ][0]
                  )
                    .toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .replace(/\s?(AM|PM)$/i, "")}
                  <span className="text-muted-foreground text-lg">
                    {weatherData?.current?.is_day === 1 ? "PM" : "AM"}
                  </span>
                </h3>
                <p className="text-muted-foreground text-xs mt-auto font-bold">
                  {weatherData?.current?.is_day === 1 ? (
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
                          new Date(weatherData?.daily.sunrise[1]).getHours() >=
                          12
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
                          new Date(weatherData?.daily.sunset[0]).getHours() >=
                          12
                            ? "PM"
                            : "AM"
                        }`}
                      </span>
                    </span>
                  )}
                </p>
                {(() => {
                  const eventTime = new Date(
                    weatherData?.daily[
                      weatherData?.current?.is_day === 1 ? "sunset" : "sunrise"
                    ][0]
                  );
                  const hours = eventTime.getHours();
                  const minutes = eventTime.getMinutes();
                  const totalMinutes = hours * 60 + minutes;
                  const xPos = (totalMinutes / (24 * 60)) * 100;
                  const yPos = 13 + 12 * Math.cos((xPos / 100) * 2 * Math.PI);

                  const now = new Date();
                  const nowMinutes = now.getHours() * 60 + now.getMinutes();
                  const nowXPos = (nowMinutes / (24 * 60)) * 100;
                  const nowYPos =
                    13 + 12 * Math.cos((nowXPos / 100) * 2 * Math.PI);

                  const wavePath = (() => {
                    const points: string[] = [];
                    const steps = 200;
                    for (let i = 0; i <= steps; i++) {
                      const x = (i / steps) * 100;
                      const y =
                        9 + 13 + 12 * Math.cos((i / steps) * 2 * Math.PI);
                      points.push(`${i === 0 ? "M" : "L"}${x},${y}`);
                    }
                    return points.join(" ");
                  })();

                  const padding = 9;
                  const adjustedYPos = yPos + padding;
                  const adjustedNowYPos = nowYPos + padding;

                  return (
                    <>
                      <svg
                        className="absolute left-0 right-0 top-1/2 w-full translate-y-1/5"
                        viewBox="0 0 100 35"
                        preserveAspectRatio="none"
                        style={{ height: "20%" }}
                      >
                        <defs>
                          <linearGradient
                            id="aboveGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="white"
                              stopOpacity="0.7"
                            />
                            <stop
                              offset="100%"
                              stopColor="white"
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                          <linearGradient
                            id="belowGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="white"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="white"
                              stopOpacity="0.05"
                            />
                          </linearGradient>
                          <clipPath id="clipAbove">
                            <rect
                              x="0"
                              y="0"
                              width="100"
                              height={adjustedYPos}
                            />
                          </clipPath>
                          <clipPath id="clipBelow">
                            <rect
                              x="0"
                              y={adjustedYPos}
                              width="100"
                              height={35 - adjustedYPos}
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
                      <div className="absolute left-0 right-0 top-1/2 w-full translate-y-1/5 h-[20%] pointer-events-none">
                        <div
                          className={`absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
                            weatherData?.current?.is_day === 0
                              ? "bg-black"
                              : "bg-white"
                          }`}
                          style={{
                            boxShadow: "0px 0px 2px 2px white",
                            left: `${nowXPos}%`,
                            top: `${(adjustedNowYPos / 35) * 100}%`,
                          }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
