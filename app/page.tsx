"use client";
import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import {
  AirQualityResponse,
  AlertsResponse,
  WeatherResponse,
} from "@/lib/types/weather";
import LocationHeader from "./components/location-header";
import CurrentWeather from "./components/current-weather";
import WeatherAlerts from "./components/weather-alerts";
import ConditionsSummary from "./components/conditions-summary";
import HourlyForecast from "./components/hourly-forecast";
import DailyForecast from "./components/daily-forecast";
import WeatherWidgets from "./components/weather-widgets";
import LastRefresh from "./components/last-refresh";
import { Heart } from "lucide-react";

interface StoredLocation {
  lat?: number;
  lon?: number;
  name?: string;
  isCurrentLocation: boolean;
}

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locError, setLocError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [geolocationSupported, setGeolocationSupported] = useState<
    boolean | null
  >(null);
  const [isCurrentLocation, setIsCurrentLocation] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [maxLowWidth, setMaxLowWidth] = useState(2);
  const [maxHighWidth, setMaxHighWidth] = useState(2);
  const [minTemp, setMinTemp] = useState(0);
  const [maxTemp, setMaxTemp] = useState(100);
  const [conditionsSummary, setConditionsSummary] = useState<string>("");
  const [alertsData, setAlertsData] = useState<AlertsResponse | null>(null);
  const [airQualityData, setAirQualityData] =
    useState<AirQualityResponse | null>(null);
  const [autoRefreshInterval] = useState<number>(60000);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refreshData = useCallback(
    (signal?: AbortSignal) => {
      if (!coords) return;

      const weatherParams = new URLSearchParams({
        latitude: coords.lat.toString(),
        longitude: coords.lon.toString(),
        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "apparent_temperature_max",
          "apparent_temperature_min",
          "sunrise",
          "sunset",
          "wind_speed_10m_max",
          "wind_direction_10m_dominant",
          "wind_gusts_10m_max",
          "daylight_duration",
          "sunshine_duration",
          "uv_index_max",
          "uv_index_clear_sky_max",
          "showers_sum",
          "snowfall_sum",
          "rain_sum",
          "precipitation_sum",
          "precipitation_hours",
          "precipitation_probability_max",
        ].join(","),
        hourly: [
          "temperature_2m",
          "weather_code",
          "apparent_temperature",
          "relative_humidity_2m",
          "dew_point_2m",
          "pressure_msl",
          "cloud_cover",
          "visibility",
          "precipitation",
          "precipitation_probability",
          "rain",
          "showers",
          "snowfall",
          "snow_depth",
          "wind_speed_10m",
          "wind_gusts_10m",
          "wind_direction_10m",
          "surface_pressure",
        ].join(","),
        minutely_15: [
          "temperature_2m",
          "weather_code",
          "apparent_temperature",
          "relative_humidity_2m",
          "dew_point_2m",
          "pressure_msl",
          "cloud_cover",
          "visibility",
          "precipitation",
          "precipitation_probability",
          "rain",
          "showers",
          "snowfall",
          "snow_depth",
          "wind_speed_10m",
          "wind_gusts_10m",
          "wind_direction_10m",
          "surface_pressure",
        ].join(","),
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "weather_code",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
          "precipitation",
          "rain",
          "showers",
          "snowfall",
          "cloud_cover",
          "pressure_msl",
          "surface_pressure",
        ].join(","),
        timezone: "auto",
        past_days: "0",
        forecast_days: "14",
        wind_speed_unit: "mph",
        temperature_unit: "fahrenheit",
        precipitation_unit: "inch",
      });

      fetch(
        `https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`,
        { signal }
      )
        .then((response) => response.json())
        .then((data: WeatherResponse) => {
          setWeatherData(data);
          const todayStart = new Date().setHours(0, 0, 0, 0);
          const displayedIndices = data.daily.time
            .map((time, i) => ({ time, i }))
            .filter(({ time }) => new Date(time).getTime() > todayStart)
            .map(({ i }) => i);

          const displayedMins = displayedIndices.map(
            (i) => data.daily.temperature_2m_min[i]
          );
          const displayedMaxs = displayedIndices.map(
            (i) => data.daily.temperature_2m_max[i]
          );

          setMinTemp(Math.min(...(displayedMins.length ? displayedMins : [0])));
          setMaxTemp(
            Math.max(...(displayedMaxs.length ? displayedMaxs : [100]))
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
          setLastRefresh(new Date());
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          if (signal) {
            console.error("Weather fetch error:", err);
          } else {
            setLocError(err.message || String(err));
          }
        });

      fetch(
        `https://api.weather.gov/alerts/active?point=${coords.lat},${coords.lon}`,
        {
          headers: {
            "User-Agent": "(hiems, pythonatsea@duck.com)",
          },
          signal,
        }
      )
        .then((res) => res.json())
        .then((data: AlertsResponse) => {
          setAlertsData(data);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          console.error("Alerts fetch error:", err);
        });

      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_carbon_monoxide,us_aqi_ozone,us_aqi_sulphur_dioxide&forecast_days=1`,
        { signal }
      )
        .then((res) => res.json())
        .then((data: AirQualityResponse) => {
          setAirQualityData(data);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          console.error("Air quality fetch error:", err);
        });
    },
    [coords]
  );

  useLayoutEffect(() => {
    const storedLocationStr = localStorage.getItem("selectedLocation");
    if (storedLocationStr) {
      try {
        const storedLocation: StoredLocation = JSON.parse(storedLocationStr);
        if (
          !storedLocation.isCurrentLocation &&
          storedLocation.lat &&
          storedLocation.lon
        ) {
          /* eslint-disable react-hooks/set-state-in-effect */
          setCoords({ lat: storedLocation.lat, lon: storedLocation.lon });
          if (storedLocation.name) {
            setLocationName(storedLocation.name);
          }
          setIsCurrentLocation(false);
          setGeolocationSupported(true);
          /* eslint-enable react-hooks/set-state-in-effect */
          return;
        }
      } catch {
        localStorage.removeItem("selectedLocation");
      }
    }

    const DEFAULT_LAT = 44.3898;
    const DEFAULT_LON = -73.2312;

    const fallbackToDefaultLocation = () => {
      setCoords({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
      setIsCurrentLocation(false);
    };

    const supported =
      typeof navigator !== "undefined" && !!navigator.geolocation;
    setGeolocationSupported(supported);
    setIsCurrentLocation(true);
    if (!supported) {
      fallbackToDefaultLocation();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        fallbackToDefaultLocation();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (!coords || (locationName && !isCurrentLocation)) return;
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
          data.address.City ||
            data.address.SubRegion ||
            data.address.Region ||
            "Unknown Location"
        );
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLocError(err.message || String(err));
      });
    return () => controller.abort();
  }, [coords, locationName, isCurrentLocation]);

  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();
    refreshData(controller.signal);
    return () => controller.abort();
  }, [coords, refreshData]);

  useEffect(() => {
    if (!weatherData || process.env.NEXT_PUBLIC_USE_AI !== "true") return;
    const controller = new AbortController();
    const { signal } = controller;

    fetch("/api/summary/conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weatherData,
        previousPrompt: conditionsSummary || undefined,
      }),
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
        setConditionsSummary("DND");
        console.error("Error getting conditions summary:", err);
      });

    return () => controller.abort();
  }, [conditionsSummary, weatherData]);

  useEffect(() => {
    if (!coords || autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => refreshData(), autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [coords, autoRefreshInterval, refreshData]);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <LocationHeader
        coords={coords}
        locError={locError}
        locationName={locationName}
        geolocationSupported={geolocationSupported}
        isCurrentLocation={isCurrentLocation}
      />
      <CurrentWeather weatherData={weatherData} />
      <WeatherAlerts alertsData={alertsData} />
      {weatherData && (
        <>
          <ConditionsSummary conditionsSummary={conditionsSummary} />
          <HourlyForecast weatherData={weatherData} />
          <DailyForecast
            weatherData={weatherData}
            minTemp={minTemp}
            maxTemp={maxTemp}
            maxLowWidth={maxLowWidth}
            maxHighWidth={maxHighWidth}
          />
          <WeatherWidgets
            weatherData={weatherData}
            airQualityData={airQualityData}
          />
          {lastRefresh && (
            <LastRefresh
              lastRefresh={lastRefresh}
              autoRefreshInterval={autoRefreshInterval}
              onRefresh={() => refreshData()}
            />
          )}
        </>
      )}
      <p className="self-start ml-6 my-2 text-xs text-muted-foreground">
        Weather data from{" "}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Open-Meteo
        </a>
      </p>
      <p className="self-start ml-6 mb-2 text-xs text-muted-foreground">
        Geocoding provided by{" "}
        <a
          href="https://geocode.arcgis.com/arcgis/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          ArcGIS
        </a>
      </p>
      <p className="self-start ml-6 mb-6">
        Made with{" "}
        <Heart className="inline size-4 text-red-700 animate-pulse mx-1" /> by{" "}
        <a
          href="https://github.com/pythonatsea"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          pythonatsea
        </a>
      </p>
    </div>
  );
}
