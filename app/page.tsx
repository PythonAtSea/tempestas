"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Calendar, Loader2, Navigation, ChevronsLeft } from "lucide-react";
import TempSlider from "./components/temp-slider";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherResponse } from "@/lib/types/weather";
import { getWeatherCodeDescription } from "@/lib/weather-code";

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
        setLocationName(
          data.address.City +
            ", " +
            (data.address.RegionAbbr || data.address.Region)
        );
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
          getWeatherCodeDescription(weatherData?.current.weather_code || -1)
            .weatherCondition
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
      <div className="p-6 w-full pb-0">
        <p className="text-sm border border-b-0 p-4">
          {conditionsSummary ? (
            <span>{conditionsSummary}</span>
          ) : weatherData ? (
            <>
              <Loader2 className="inline-block size-4 animate-spin mr-2" />
              <span className="text-muted-foreground">Fetching summary...</span>
            </>
          ) : null}
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
                      {Math.round(weatherData?.hourly.temperature_2m[i] ?? 0)
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
    </div>
  );
}
