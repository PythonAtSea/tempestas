"use client";

import { AlertsResponse } from "@/lib/types/weather";

interface WeatherAlertsProps {
  alertsData: AlertsResponse | null;
}

export default function WeatherAlerts({ alertsData }: WeatherAlertsProps) {
  if (!alertsData || !alertsData.features) return null;

  return (
    <>
      {alertsData.features.map((alert, i) => {
        const severity = alert.properties.severity;
        const isRed = severity === "Extreme" || severity === "Severe";
        const isYellow = severity === "Moderate" || severity === "Unknown";
        const borderClass = isRed
          ? "border-red-500"
          : isYellow
          ? "border-yellow-500"
          : "border";
        const bgClass = isRed
          ? "bg-red-500/20"
          : isYellow
          ? "bg-yellow-500/20"
          : "bg-muted/20";
        const headerBgClass = isRed
          ? "bg-red-500"
          : isYellow
          ? "bg-yellow-500"
          : "bg-muted";
        const textClass = isYellow ? "text-black" : "text-white";
        return (
          <div className="p-6 w-full pb-0" key={i}>
            <div className={`border ${borderClass} w-full ${bgClass}`}>
              <div className={`${headerBgClass} mt-0 p-2 px-4 ${textClass}`}>
                {alert.properties.event || "Weather Alert"}
              </div>
              <p className="p-4">{alert.properties.headline || ""}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}
