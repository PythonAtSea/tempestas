"use client";

import { useEffect, useState } from "react";
import { WeatherResponse } from "@/lib/types/weather";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronRight } from "lucide-react";

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

interface WindWidgetProps {
  weatherData: WeatherResponse;
}

export default function WindWidget({ weatherData }: WindWidgetProps) {
  const isFinePointer = useIsFinePointer();
  const windDir = weatherData.current.wind_direction_10m;

  const isNearCardinal = (target: number) => {
    const diff = Math.abs(((windDir - target + 180) % 360) - 180);
    const opposite = (target + 180) % 360;
    const diffOpposite = Math.abs(((windDir - opposite + 180) % 360) - 180);
    return diff < 10 || diffOpposite < 10;
  };

  const ARROW_STROKE_WIDTH = 1.5;
  const ARROW_TIP_Y = 7;
  const ARROW_SHAFT_LENGTH = 15;
  const ARROW_HEAD_LENGTH = 6;
  const ARROW_HEAD_ANGLE = 45;
  const ARROW_CENTER_X = 50;
  const OPPOSITE_TIP_SHORT = 5;

  const shaftEndY = ARROW_TIP_Y + ARROW_SHAFT_LENGTH;
  const headAngleRad = (ARROW_HEAD_ANGLE * Math.PI) / 180;
  const headOffsetX = Math.sin(headAngleRad) * ARROW_HEAD_LENGTH;
  const headOffsetY = Math.cos(headAngleRad) * ARROW_HEAD_LENGTH;

  const OPPOSITE_TIP_Y = 100 - ARROW_TIP_Y - OPPOSITE_TIP_SHORT;
  const oppositeShaftEndY =
    OPPOSITE_TIP_Y - ARROW_SHAFT_LENGTH + OPPOSITE_TIP_SHORT;

  const content = (
    <div
      className="border bg-muted/20 p-3 flex flex-row w-full cursor-pointer hover:bg-muted/30 active:bg-muted/30"
      style={{ height: "calc((100cqw - 16px) / 2)" }}
    >
      <div className="flex-1 flex flex-col">
        <p className="text-muted-foreground text-sm flex flex-row items-center gap-2">
          <i className="wi wi-fw wi-day-windy" />
          Wind
        </p>
        <div className="overflow-hidden">
          <div className="flex flex-row justify-between items-center mt-2 mr-8">
            <p className="text-sm font-mono text-muted-foreground">Now</p>
            <p className="text-sm font-mono">
              {Math.round(weatherData.current.wind_speed_10m)}
              <span className="text-muted-foreground text-[10px] font-bold">
                MPH{" "}
              </span>
              <span className="text-muted-foreground text-xs max-xs:hidden">
                ({Math.round(weatherData.current.wind_gusts_10m)})
              </span>
            </p>
          </div>
          {weatherData.hourly.time
            .filter((time) => {
              const date = new Date(time);
              const now = new Date();
              return date >= now;
            })
            .slice(0, 10)
            .map((timeStr, i) => {
              const speed = weatherData.hourly.wind_speed_10m[i];
              const date = new Date(timeStr);
              const hours = date.getHours();
              const ampm = hours >= 12 ? "PM" : "AM";
              const hour12 = hours % 12 || 12;
              const label = `${hour12} ${ampm}`;

              return (
                <div
                  key={timeStr}
                  className="flex flex-row justify-between items-center mt-2 mr-8"
                >
                  <p className="text-sm font-mono text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-sm font-mono">
                    {Math.round(speed)}
                    <span className="text-muted-foreground text-[10px] font-bold">
                      MPH{" "}
                    </span>
                    <span className="text-muted-foreground text-xs max-xs:hidden">
                      ({Math.round(weatherData.hourly.wind_gusts_10m[i])})
                    </span>
                  </p>
                </div>
              );
            })}
        </div>
      </div>
      <div className="relative aspect-square h-full flex items-center justify-center">
        <div className="relative w-full h-full">
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
          </div>
          <ChevronRight className="size-4 absolute top-0 right-0 text-muted-foreground" />
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            style={{
              transform: `rotate(${windDir}deg)`,
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
            <h3 className="font-bold font-mono text-xl">
              {Math.round(weatherData.current.wind_speed_10m)}
            </h3>
            <p className="text-xs -mt-2 text-muted-foreground font-bold">MPH</p>
          </div>
        </div>
      </div>
    </div>
  );

  const dialogContent = (
    <>
      <h3 className="text-xl font-bold">
        Wind{" "}
        <span className="font-mono">
          {Math.round(weatherData.current.wind_speed_10m)}
          <span className="text-sm text-muted-foreground">MPH</span>
        </span>
      </h3>
    </>
  );

  if (isFinePointer) {
    return (
      <div className="col-span-2" style={{ containerType: "inline-size" }}>
        <Dialog>
          <DialogTrigger asChild>{content}</DialogTrigger>
          <DialogContent>
            <VisuallyHidden asChild>
              <DialogHeader>
                <DialogTitle>Wind</DialogTitle>
              </DialogHeader>
            </VisuallyHidden>
            <div className="max-h-[70vh] overflow-y-auto">{dialogContent}</div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="col-span-2" style={{ containerType: "inline-size" }}>
      <Drawer>
        <DrawerTrigger asChild>{content}</DrawerTrigger>
        <DrawerContent>
          <VisuallyHidden asChild>
            <DrawerHeader>
              <DrawerTitle>Wind</DrawerTitle>
            </DrawerHeader>
          </VisuallyHidden>
          <div className="overflow-y-auto px-6 pb-6">{dialogContent}</div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
