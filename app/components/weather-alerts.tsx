"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AlertsResponse } from "@/lib/types/weather";

interface WeatherAlertsProps {
  alertsData: AlertsResponse | null;
}

function useIsFinePointer() {
  const getInitial = () =>
    typeof window !== "undefined"
      ? window.matchMedia("(pointer: fine)").matches
      : null;
  const [isFine, setIsFine] = useState<boolean | null>(getInitial);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");

    const handler = (e: MediaQueryListEvent) => setIsFine(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isFine;
}

const DEMO_ALERT = true;

export default function WeatherAlerts({ alertsData }: WeatherAlertsProps) {
  const isFinePointer = useIsFinePointer();

  const fakeAlert: AlertsResponse = {
    features: [
      {
        properties: {
          event: "[DEMO] Winter Storm Warning",
          headline:
            "[DEMO] Winter Storm Warning issued November 30 at 10:00AM EST until December 1 at 6:00PM EST",
          description:
            "[DEMO] A significant winter storm is expected to impact the region. Heavy snow accumulations of 8 to 12 inches are expected.\n\nTravel could be very difficult to impossible. The hazardous conditions could impact the morning or evening commute.\n\nWinds gusting as high as 45 mph will cause blowing and drifting snow, significantly reducing visibility at times.",
          instruction:
            "[DEMO] Travel should be restricted to emergencies only. If you must travel, keep an extra flashlight, food, and water in your vehicle in case of an emergency.",
          severity: "Severe",
          certainty: "Likely",
          urgency: "Immediate",
          id: "",
          areaDesc: "",
          affectedZones: [],
          sent: "",
          effective: null,
          onset: null,
          expires: null,
          ends: null,
          status: "Actual",
          messageType: "Alert",
          category: "Met",
          sender: "",
          senderName: "",
          response: null,
        },
        id: "",
        type: "Feature",
        geometry: {
          type: null,
          coordinates: null,
        },
      },
    ],
    type: "FeatureCollection",
  };

  const effectiveAlerts = alertsData?.features?.length
    ? alertsData
    : DEMO_ALERT
    ? fakeAlert
    : null;

  if (!effectiveAlerts || !effectiveAlerts.features) return null;

  const alertContent = (alert: (typeof effectiveAlerts.features)[number]) => (
    <>
      {(alert.properties.description || "No additional details.")
        .replace(/\r\n/g, "\n")
        .replace(/\n\n+/g, "<<<DOUBLE_NEWLINE>>>")
        .replace(/\n/g, " ")
        .replace(/<<<DOUBLE_NEWLINE>>>/g, "\n\n")}
      {alert.properties.instruction && (
        <>
          <br className="mt-4" />
          <span className="text-xl font-bold text-primary">Instructions</span>
          <br />
          <span>{alert.properties.instruction}</span>
        </>
      )}
    </>
  );

  const triggerCard = (
    alert: (typeof effectiveAlerts.features)[number],
    borderClass: string,
    bgClass: string,
    headerBgClass: string,
    textClass: string
  ) => (
    <div className="p-6 w-full pb-0">
      <div className={`border ${borderClass} w-full ${bgClass}`}>
        <div
          className={`${headerBgClass} mt-0 p-2 px-4 ${textClass} flex flex-row`}
        >
          {alert.properties.event || "Weather Alert"}
          <span className="ml-auto text-blue-600 cursor-pointer">
            More details
          </span>
        </div>
        <p className="p-4">{alert.properties.headline || ""}</p>
      </div>
    </div>
  );

  return (
    <>
      {effectiveAlerts.features.map((alert, i) => {
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

        if (isFinePointer) {
          return (
            <Dialog key={i}>
              <DialogTrigger asChild>
                {triggerCard(
                  alert,
                  borderClass,
                  bgClass,
                  headerBgClass,
                  textClass
                )}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {alert.properties.event || "Weather Alert"}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                  {alertContent(alert)}
                </DialogDescription>
              </DialogContent>
            </Dialog>
          );
        }

        return (
          <Drawer key={i}>
            <DrawerTrigger asChild>
              {triggerCard(
                alert,
                borderClass,
                bgClass,
                headerBgClass,
                textClass
              )}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  {alert.properties.event || "Weather Alert"}
                </DrawerTitle>
              </DrawerHeader>
              <DrawerDescription className="max-h-[80vh] overflow-y-auto whitespace-pre-wrap px-6 pb-6">
                {alertContent(alert)}
              </DrawerDescription>
            </DrawerContent>
          </Drawer>
        );
      })}
    </>
  );
}
