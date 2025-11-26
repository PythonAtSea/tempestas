"use client";
import { useEffect, useState } from "react";
import { Calendar, Navigation } from "lucide-react";
import TempSlider from "./components/temp-slider";
import { Skeleton } from "@/components/ui/skeleton";

const hourly = [
  { time: "Now", temp: 90, icon: "sun" },
  { time: "1 PM", temp: 100, icon: "sun" },
  { time: "2 PM", temp: 101, icon: "sun" },
  { time: "3 PM", temp: 102, icon: "sun" },
  { time: "4 PM", temp: 101, icon: "sun" },
  { time: "5 PM", temp: 100, icon: "sun" },
  { time: "6 PM", temp: 99, icon: "sun" },
  { time: "7 PM", temp: 98, icon: "sun" },
  { time: "8 PM", temp: 97, icon: "sun" },
];

const daily = [
  { day: "Today", high: 101, low: 78, icon: "sun" },
  { day: "Mon", high: 101, low: 78, icon: "sun" },
  { day: "Tue", high: 99, low: 77, icon: "cloud-sun" },
  { day: "Wed", high: 95, low: 75, icon: "cloud-rain" },
  { day: "Thu", high: 93, low: 73, icon: "cloud" },
  { day: "Fri", high: 96, low: 76, icon: "sun" },
];

export default function Home() {
  const maxHighWidth = Math.max(...daily.map((d) => d.high.toString().length));
  const maxLowWidth = Math.max(...daily.map((d) => d.low.toString().length));
  const minTemp = Math.min(...daily.map((d) => d.low));
  const maxTemp = Math.max(...daily.map((d) => d.high));

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locError, setLocError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  const geolocationUnsupported =
    typeof navigator === "undefined" || !navigator.geolocation;

  useEffect(() => {
    if (geolocationUnsupported) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        setLocError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [geolocationUnsupported]);

  useEffect(() => {
    if (!coords) return;
    fetch(
      `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${coords.lon},${coords.lat}&f=json`
    )
      .then((response) => response.json())
      .then((data) => {
        setLocationName(
          data.address.City +
            ", " +
            (data.address.RegionAbbr || data.address.Region)
        );
      })
      .catch((err) => {
        setLocError(err.message || String(err));
      });
  }, [coords]);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="mt-10 ">
        {coords && (
          <div className="flex flex-row items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Navigation className="inline-block size-3" />
            <p>Current Location</p>
          </div>
        )}
        {!geolocationUnsupported && !coords && !locError && (
          <p className="mt-1 text-xs text-muted-foreground">
            Detecting location…
          </p>
        )}
        {geolocationUnsupported && (
          <p className="mt-1 text-xs text-red-500">Geolocation unsupported</p>
        )}
        {locError && !geolocationUnsupported && (
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
        99
        <span className="absolute top-0 left-full">º</span>
      </h3>
      <h4 className="text-muted-foreground font-bold">Sunny</h4>
      <p className="text-sm px-6 pt-8">
        It is mostly sunny through the afternoon, with wind gusts up to 12 mph.
      </p>
      <div className="w-full p-6">
        <div className="w-full border overflow-x-auto overflow-y-hidden">
          <div className="flex w-max gap-4 px-4 py-4">
            {hourly.map((hour, i) => (
              <div
                key={i}
                className="shrink-0 flex flex-col items-center gap-2"
              >
                <span className="text-sm text-muted-foreground">
                  {hour.time}
                </span>
                <i className="wi wi-day-sunny text-yellow-400 scale-125 px-3 py-2"></i>
                <span className="font-mono font-bold relative">
                  {hour.temp}
                  <span className="absolute top-0 left-full">º</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full px-6 pb-6">
        <div className="border">
          <p className="p-2 font-bold text-muted-foreground flex flex-row items-center gap-2">
            <Calendar className="inline-block size-4" />
            10 day forecast
          </p>
          <div className="w-full">
            {daily.map((day, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 border-t"
              >
                <div className="flex items-center gap-4 mr-4">
                  <span className="w-9 text-sm">{day.day}</span>
                  <i className="wi wi-day-sunny text-yellow-400 scale-125"></i>
                </div>
                <span className="font-mono font-bold relative mr-2 text-muted-foreground">
                  {day.low.toString().padStart(maxLowWidth, "\u00A0")}º
                </span>
                <TempSlider
                  dotTemp={day.day === "Today" ? hourly[0].temp : undefined}
                  minTemp={minTemp}
                  maxTemp={maxTemp}
                  lowTemp={day.low}
                  highTemp={day.high}
                  className="flex-1"
                />
                <span className="font-mono font-bold ml-2">
                  {day.high}º
                  {"\u00A0".repeat(maxHighWidth - day.high.toString().length)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
