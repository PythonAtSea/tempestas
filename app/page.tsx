"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo, useCallback, JSX } from "react";

import {
  Icon,
  CircleQuestionMark,
  CloudSun,
  Sun,
  Cloudy,
  Haze,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  Wind,
  LocateFixed,
  Loader2,
  OctagonAlert,
  Copy,
  Check,
  Siren,
  TriangleAlert,
  Heart,
  Trash,
  ChevronDown,
  RefreshCcw,
  Pencil,
  Sunrise,
  Sunset,
  ThermometerSnowflake,
  ThermometerSun,
} from "lucide-react";
import { glassesSun } from "@lucide/lab";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  ReferenceLine,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";

const chartConfig = {
  temp: {
    label: "Temperature",
  },
  precipitation: {
    label: "Rain %",
  },
  wind_speed: {
    label: "Wind Speed",
  },
  wind_gusts: {
    label: "Wind Gusts",
  },
  cloud_cover: {
    label: "Cloud Cover",
  },
};

const WIND_COLOR_STOPS: Array<{ speed: number; color: string }> = [
  { speed: 0.5, color: "#ffffff" },
  { speed: 2.0, color: "#aef1f9" },
  { speed: 6.5, color: "#96f7dc" },
  { speed: 10.0, color: "#96f7b4" },
  { speed: 15.5, color: "#6ff46f" },
  { speed: 21.5, color: "#73ed12" },
  { speed: 28.0, color: "#a4ed12" },
  { speed: 35.0, color: "#daed12" },
  { speed: 42.5, color: "#edc212" },
  { speed: 50.5, color: "#ed8f12" },
  { speed: 59.0, color: "#ed6312" },
  { speed: 68.0, color: "#ed2912" },
  { speed: 74.0, color: "#d5102d" },
];

const TEMP_COLOR_STOPS: Array<{ temp: number; color: string }> = [
  // Scorching PINK/REDS (>=100°F)
  { temp: 150, color: "#7F0017" }, // 120–150°F deep red
  { temp: 120, color: "#8B0000" }, // 115–120°F dark red
  { temp: 115, color: "#B22222" }, // 110–115°F red
  { temp: 110, color: "#CD5C5C" }, // 105–110°F indian red
  { temp: 105, color: "#DC143C" }, // 100–105°F crimson
  { temp: 100, color: "#FF69B4" }, // 100°F hot pink entry

  // Warming ORANGE/GOLDS (85–100°F)
  { temp: 95, color: "#FFA07A" },
  { temp: 90, color: "#FF8C00" },
  { temp: 85, color: "#FFA500" },

  // Mellow YELLOWS (70–85°F)
  { temp: 80, color: "#FFD700" },
  { temp: 75, color: "#F0E68C" },
  { temp: 70, color: "#EEE8AA" },

  // Transitional LIME/TEALS (55–70°F)
  { temp: 65, color: "#98FB98" },
  { temp: 60, color: "#90EE90" },
  { temp: 55, color: "#20B2AA" },

  // Frigid TURQUOISE/BLUES (40–55°F)
  { temp: 50, color: "#48D1CC" },
  { temp: 45, color: "#00CED1" },
  { temp: 40, color: "#1E90FF" },

  // Hard NAVY BLUE dividing wall around freezing
  { temp: 32, color: "#001F3F" },

  // Light GRAY/BLUES (0–32°F)
  { temp: 30, color: "#6A8FBF" },
  { temp: 25, color: "#7FA3D1" },
  { temp: 20, color: "#90B0D6" },
  { temp: 15, color: "#A2BCD9" },
  { temp: 10, color: "#AFC5DF" },
  { temp: 5, color: "#B0C4DE" },
  { temp: 0, color: "#C7D6EB" },

  // Barely-there BLUE/WHITE (<= 0°F down to extremely cold)
  { temp: -5, color: "#D4DEEF" },
  { temp: -10, color: "#DEE6F3" },
  { temp: -15, color: "#E5EBF6" },
  { temp: -20, color: "#EAF0F8" },
  { temp: -25, color: "#EEF3FA" },
  { temp: -30, color: "#F1F5FB" },
  { temp: -35, color: "#F4F7FC" },
  { temp: -40, color: "#F6F9FD" },
  { temp: -45, color: "#F8FAFE" },
  { temp: -50, color: "#FAFBFE" },
  { temp: -55, color: "#FCFDFE" },
  { temp: -60, color: "#FDFEFF" },
  { temp: -100, color: "#FFFFFF" },
];

function currentWeatherText(
  temp: number,
  windNum: number,
  weatherCode?: number
): string {
  let windString = "";
  if (windNum === 0) {
    windString = "no wind";
  } else if (windNum <= 5) {
    windString = "a light breeze";
  } else if (windNum <= 15) {
    windString = "a gentle wind";
  } else if (windNum <= 25) {
    windString = "a moderate wind";
  } else if (windNum <= 35) {
    windString = "a strong wind";
  } else if (windNum <= 50) {
    windString = "a light gale";
  } else {
    windString = "a gale";
  }

  let weatherCondition = "";
  let recommendationText = "";
  if (weatherCode !== undefined) {
    switch (weatherCode) {
      case 0:
        weatherCondition = "clear skies";
        recommendationText = "Perfect day for stargazing or flying a kite!";
        break;
      case 1:
        weatherCondition = "mainly clear skies";
        recommendationText = "A great day for a picnic or outdoor photography!";
        break;
      case 2:
        weatherCondition = "partly cloudy skies";
        recommendationText = "Cloud-watching day! See any shapes up there?";
        break;
      case 3:
        weatherCondition = "overcast skies";
        recommendationText = "Cozy reading day with a warm cup of tea!";
        break;
      case 45:
        weatherCondition = "fog";
        recommendationText =
          "Time for mysterious photos or writing that ghost story!";
        break;
      case 48:
        weatherCondition = "depositing rime fog";
        recommendationText =
          "Everything looks magical and frosted - grab your camera!";
        break;
      case 51:
        weatherCondition = "light drizzle";
        recommendationText =
          "Perfect weather for singing in the rain - softly!";
        break;
      case 53:
        weatherCondition = "moderate drizzle";
        recommendationText =
          "Time to test those new waterproof sneakers you bought!";
        break;
      case 55:
        weatherCondition = "dense drizzle";
        recommendationText = "Great day for puddle-jumping competitions!";
        break;
      case 61:
        weatherCondition = "light rain";
        recommendationText = "Grab that fancy umbrella you never get to use!";
        break;
      case 63:
        weatherCondition = "moderate rain";
        recommendationText =
          "Perfect opportunity to test if your phone is really waterproof!";
        break;
      case 65:
        weatherCondition = "heavy rain";
        recommendationText =
          "Time to build an indoor blanket fort and watch movies!";
        break;
      case 71:
        weatherCondition = "light snow";
        recommendationText = "Time to catch snowflakes on your tongue!";
        break;
      case 73:
        weatherCondition = "moderate snow";
        recommendationText =
          "Maybe you can go sledding after this? Race you to the bottom!";
        break;
      case 75:
        weatherCondition = "heavy snow";
        recommendationText =
          "Perfect day to build that snow fortress you've been planning!";
        break;
      case 80:
        weatherCondition = "light rain showers";
        recommendationText =
          "Quick, dance between the raindrops before they stop!";
        break;
      case 81:
        weatherCondition = "moderate rain showers";
        recommendationText =
          "Rain boots and puddle-jumping time - splash contest!";
        break;
      case 82:
        weatherCondition = "violent rain showers";
        recommendationText = "Movie marathon day with extra-buttery popcorn!";
        break;
      case 85:
        weatherCondition = "light snow showers";
        recommendationText =
          "Perfect for making snow angels between the flurries!";
        break;
      case 86:
        weatherCondition = "heavy snow showers";
        recommendationText = "Hot chocolate and marshmallows - stat!";
        break;
      case 95:
        weatherCondition = "thunderstorms";
        recommendationText =
          "Nature's light show! Count the seconds between flashes from your cozy spot.";
        break;
      case 96:
        weatherCondition = "thunderstorms with light hail";
        recommendationText =
          "Indoor scavenger hunt time! First one to find a flashlight wins.";
        break;
      case 99:
        weatherCondition = "thunderstorms with heavy hail";
        recommendationText =
          "Perfect day to finally start that novel you've been thinking about!";
        break;
      default:
        weatherCondition = "";
    }
  }

  return weatherCondition
    ? `It's currently ${weatherCondition}, the temperature is ${temp}° with ${windString}. ${recommendationText}`
    : `Currently ${temp}° with ${windString}`;
}

function interpolateColor(color1: string, color2: string, t: number): string {
  const c1 = color1.startsWith("#") ? color1.slice(1) : color1;
  const c2 = color2.startsWith("#") ? color2.slice(1) : color2;
  const r1 = parseInt(c1.substring(0, 2), 16);
  const g1 = parseInt(c1.substring(2, 4), 16);
  const b1 = parseInt(c1.substring(4, 6), 16);
  const r2 = parseInt(c2.substring(0, 2), 16);
  const g2 = parseInt(c2.substring(2, 4), 16);
  const b2 = parseInt(c2.substring(4, 6), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function getTextColorForBackground(backgroundColor: string): string {
  const hex = backgroundColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const diff = max - min;

  const lightness = (max + min) / 2;

  let hue = 0;
  if (diff !== 0) {
    if (max === r / 255) {
      hue = 60 * (((g / 255 - b / 255) / diff) % 6);
    } else if (max === g / 255) {
      hue = 60 * ((b / 255 - r / 255) / diff + 2);
    } else {
      hue = 60 * ((r / 255 - g / 255) / diff + 4);
    }
    if (hue < 0) hue += 360;
  }

  const saturation = diff === 0 ? 0 : diff / (1 - Math.abs(2 * lightness - 1));

  const newLightness =
    lightness > 0.5
      ? Math.max(0, lightness - 0.6)
      : Math.min(1, lightness + 0.6);

  const c = (1 - Math.abs(2 * newLightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = newLightness - c / 2;

  let r1, g1, b1;

  if (0 <= hue && hue < 60) {
    [r1, g1, b1] = [c, x, 0];
  } else if (60 <= hue && hue < 120) {
    [r1, g1, b1] = [x, c, 0];
  } else if (120 <= hue && hue < 180) {
    [r1, g1, b1] = [0, c, x];
  } else if (180 <= hue && hue < 240) {
    [r1, g1, b1] = [0, x, c];
  } else if (240 <= hue && hue < 300) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }

  const contrastColor = `#${Math.round((r1 + m) * 255)
    .toString(16)
    .padStart(2, "0")}${Math.round((g1 + m) * 255)
    .toString(16)
    .padStart(2, "0")}${Math.round((b1 + m) * 255)
    .toString(16)
    .padStart(2, "0")}`;

  const luminance1 = calculateRelativeLuminance(r / 255, g / 255, b / 255);
  const luminance2 = calculateRelativeLuminance(r1 + m, g1 + m, b1 + m);

  const contrast = calculateContrastRatio(luminance1, luminance2);

  if (contrast < 4.5) {
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    return brightness > 160 ? "#000000" : "#FFFFFF";
  }

  return contrastColor;
}

function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

function calculateContrastRatio(
  luminance1: number,
  luminance2: number
): number {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

function bandColorForTemp(temp: number, tempUnit: string): string {
  if (tempUnit === "celsius") {
    temp = temp * (9 / 5) + 32;
  }
  for (let i = 0; i < TEMP_COLOR_STOPS.length - 1; i++) {
    const stop1 = TEMP_COLOR_STOPS[i];
    const stop2 = TEMP_COLOR_STOPS[i + 1];
    if (temp >= stop2.temp && temp <= stop1.temp) {
      const t = (temp - stop2.temp) / (stop1.temp - stop2.temp);
      return interpolateColor(stop2.color, stop1.color, t);
    }
  }
  if (temp > TEMP_COLOR_STOPS[0].temp) return TEMP_COLOR_STOPS[0].color;
  if (temp < TEMP_COLOR_STOPS[TEMP_COLOR_STOPS.length - 1].temp)
    return TEMP_COLOR_STOPS[TEMP_COLOR_STOPS.length - 1].color;
  return "#FF00FF";
}

function bandColorForWind(speed: number): string {
  for (let i = 0; i < WIND_COLOR_STOPS.length - 1; i++) {
    const stop1 = WIND_COLOR_STOPS[i];
    const stop2 = WIND_COLOR_STOPS[i + 1];
    if (speed >= stop1.speed && speed <= stop2.speed) {
      const t = (speed - stop1.speed) / (stop2.speed - stop1.speed);
      return interpolateColor(stop1.color, stop2.color, t);
    }
  }
  if (speed < WIND_COLOR_STOPS[0].speed) return WIND_COLOR_STOPS[0].color;
  if (speed > WIND_COLOR_STOPS[WIND_COLOR_STOPS.length - 1].speed)
    return WIND_COLOR_STOPS[WIND_COLOR_STOPS.length - 1].color;
  return "#FF00FF";
}

function getUVIndexDisplay(uvIndex: number): JSX.Element {
  switch (true) {
    case uvIndex >= 0.0 && uvIndex <= 2.0:
      const greenBg = "#4ade80";
      return (
        <HoverCard>
          <HoverCardTrigger
            className="flex flex-row items-center space-x-2 px-1"
            style={{
              backgroundColor: greenBg,
              color: getTextColorForBackground(greenBg),
            }}
          >
            <span>Low ({uvIndex})</span>
          </HoverCardTrigger>
          <HoverCardContent>
            UV index is low. No protection needed. You can safely stay outside
            using minimal sun protection.
          </HoverCardContent>
        </HoverCard>
      );
    case uvIndex > 2.0 && uvIndex <= 5.0:
      const yellowBg = "#fde047";
      return (
        <HoverCard>
          <HoverCardTrigger
            className="flex flex-row items-center space-x-2 px-1"
            style={{
              backgroundColor: yellowBg,
              color: getTextColorForBackground(yellowBg),
            }}
          >
            <span>Moderate ({uvIndex})</span>
          </HoverCardTrigger>
          <HoverCardContent>
            UV index is moderate. Protection needed. Seek shade during late
            morning through mid-afternoon. When outside, generously apply
            broad-spectrum SPF-15 or higher sunscreen on exposed skin, and wear
            protective clothing, a wide-brimmed hat, and sunglasses.
          </HoverCardContent>
        </HoverCard>
      );
    case uvIndex > 5.0 && uvIndex <= 7.0:
      const orangeBg = "#fb923c";
      return (
        <HoverCard>
          <HoverCardTrigger
            className="flex flex-row items-center space-x-2 px-1"
            style={{
              backgroundColor: orangeBg,
              color: getTextColorForBackground(orangeBg),
            }}
          >
            <span>High ({uvIndex})</span>
          </HoverCardTrigger>
          <HoverCardContent>
            UV index is high. Protection needed. Seek shade during late morning
            through mid-afternoon. When outside, generously apply broad-spectrum
            SPF-15 or higher sunscreen on exposed skin, and wear protective
            clothing, a wide-brimmed hat, and sunglasses.
          </HoverCardContent>
        </HoverCard>
      );
    case uvIndex > 7.0 && uvIndex <= 10.0:
      const redBg = "#ef4444";
      return (
        <HoverCard>
          <HoverCardTrigger
            className="flex flex-row items-center space-x-2 px-1"
            style={{
              backgroundColor: redBg,
              color: getTextColorForBackground(redBg),
            }}
          >
            <span>Very High ({uvIndex})</span>
          </HoverCardTrigger>
          <HoverCardContent>
            UV index is very high. Extra protection needed. Be careful outside,
            especially during late morning through mid-afternoon. If your shadow
            is shorter than you, seek shade and wear protective clothing, a
            wide-brimmed hat, and sunglasses, and generously apply a minimum of
            SPF-15, broad-spectrum sunscreen on exposed skin.
          </HoverCardContent>
        </HoverCard>
      );
    case uvIndex > 10.0:
      const purpleBg = "#a855f7";
      return (
        <HoverCard>
          <HoverCardTrigger
            className="flex flex-row items-center space-x-2 px-1"
            style={{
              backgroundColor: purpleBg,
              color: getTextColorForBackground(purpleBg),
            }}
          >
            <span>Extreme ({uvIndex})</span>
          </HoverCardTrigger>
          <HoverCardContent>
            UV index is extreme. Extra protection needed. Be careful outside,
            especially during late morning through mid-afternoon. If your shadow
            is shorter than you, seek shade and wear protective clothing, a
            wide-brimmed hat, and sunglasses, and generously apply a minimum of
            SPF-15, broad-spectrum sunscreen on exposed skin.
          </HoverCardContent>
        </HoverCard>
      );
    default:
      return (
        <span className="bg-gray-200 text-gray-900 px-1">
          Unknown ({uvIndex})
        </span>
      );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TempActiveDot(props: any) {
  const { cx, cy, value, tempUnit } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={bandColorForTemp(value, tempUnit)}
        role="img"
        aria-label={`Temperature data point: ${value}${
          tempUnit === "celsius" ? "°C" : "°F"
        }`}
      />
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WindSpeedActiveDot(props: any) {
  const { cx, cy, value, payload } = props;
  // Use the actual value from the payload to ensure exact match with the line
  const windSpeed =
    payload?.wind_speed !== undefined ? payload.wind_speed : value;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={bandColorForWind(windSpeed)}
        role="img"
        aria-label={`Wind speed data point: ${windSpeed} mph`}
      />
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WindGustActiveDot(props: any) {
  const { cx, cy, value, payload } = props;
  // Use the actual value from the payload to ensure exact match with the line
  const windGust =
    payload?.wind_gusts !== undefined ? payload.wind_gusts : value;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={bandColorForWind(windGust)}
        role="img"
        aria-label={`Wind gust data point: ${windGust} mph`}
      />
    </g>
  );
}

function WeatherCodeToIcon(weatherCode: number): [JSX.Element, string, string] {
  switch (weatherCode) {
    case 0:
      return [
        <Sun key="clear-sky-icon" aria-hidden="true" />,
        "Clear sky",
        "#a4acba",
      ];
    case 1:
      return [
        <Sun key="mainly-clear-icon" aria-hidden="true" />,
        "Mainly clear",
        "#b3b9c5",
      ];
    case 2:
      return [
        <CloudSun key="partly-cloudy-icon" aria-hidden="true" />,
        "Partly cloudy",
        "#969eaf",
      ];
    case 3:
      return [
        <Cloudy key="overcast-icon" aria-hidden="true" />,
        "Overcast",
        "#7b8495",
      ];
    case 45:
    case 48:
      return [<Haze key="foggy-icon" aria-hidden="true" />, "Foggy", "#a39e8f"];
    case 51:
      return [
        <CloudDrizzle key="light-drizzle-icon" aria-hidden="true" />,
        "Light drizzle",
        "#9bcbfc",
      ];
    case 53:
      return [
        <CloudDrizzle key="moderate-drizzle-icon" aria-hidden="true" />,
        "Moderate drizzle",
        "#51b4fe",
      ];
    case 55:
      return [
        <CloudDrizzle key="dense-drizzle-icon" aria-hidden="true" />,
        "Dense drizzle",
        "#039ae8",
      ];
    case 61:
      return [
        <CloudRain key="light-rain-icon" aria-hidden="true" />,
        "Light rain",
        "#8999f8",
      ];
    case 63:
      return [
        <CloudRain key="moderate-rain-icon" aria-hidden="true" />,
        "Moderate rain",
        "#5d7ef6",
      ];
    case 65:
      return [
        <CloudRain key="heavy-rain-icon" aria-hidden="true" />,
        "Heavy rain",
        "#2161df",
      ];
    case 71:
      return [
        <CloudSnow key="light-snow-icon" aria-hidden="true" />,
        "Light snow",
        "#f56abf",
      ];
    case 73:
      return [
        <CloudSnow key="moderate-snow-icon" aria-hidden="true" />,
        "Moderate snow",
        "#ed2aac",
      ];
    case 75:
      return [
        <CloudSnow key="heavy-snow-icon" aria-hidden="true" />,
        "Heavy snow",
        "#c0228c",
      ];
    case 80:
      return [
        <CloudRain key="light-rain-showers-icon" aria-hidden="true" />,
        "Light rain showers",
        "#79c0ff",
      ];
    case 81:
      return [
        <CloudRain key="moderate-rain-showers-icon" aria-hidden="true" />,
        "Moderate rain showers",
        "#02aaff",
      ];
    case 82:
      return [
        <CloudRain key="heavy-rain-showers-icon" aria-hidden="true" />,
        "Heavy rain showers",
        "#018cd4",
      ];
    case 85:
      return [
        <CloudSnow key="light-snow-showers-icon" aria-hidden="true" />,
        "Light snow showers",
        "#e2a3eb",
      ];
    case 86:
      return [
        <CloudSnow key="heavy-snow-showers-icon" aria-hidden="true" />,
        "Snow Showers",
        "#c652dc",
      ];
    case 95:
      return [
        <CloudLightning key="thunderstorm-icon" aria-hidden="true" />,
        "Thunderstorm",
        "#f7708e",
      ];
    default:
      return [
        <CircleQuestionMark key="unknown-weather-icon" aria-hidden="true" />,
        "Unknown weather condition, code: " + weatherCode,
        "#ffffff",
      ];
  }
}

type GradientStop = { offset: number; color: string };

export default function Page() {
  // Initialize with saved values from localStorage if they exist
  const [lat, setLat] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("latitude") || "44.3804303";
    }
    return "44.3804303"; // hackclub hq as fallback
  });
  const [lon, setLon] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("longitude") || "-73.2276389";
    }
    return "-73.2276389";
  });
  const [locationLat, setLocationLat] = useState<string | null>(null);
  const [locationLon, setLocationLon] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawData, setRawData] = useState<any>(null);
  const [weatherIcon, setWeatherIcon] = useState(<CircleQuestionMark />);
  const [weatherDescription, setWeatherDescription] = useState<string>("");
  const [weatherColor, setWeatherColor] = useState<string>("");
  const [locationSupported, setLocationSupported] = useState(true);
  const [preciseLocation, setPreciseLocation] = useState(true);
  const [shareURL, setShareURL] = useState("");
  const [shareIcon, setShareIcon] = useState(<Copy />);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pastDays, setPastDays] = useState("0");
  const [futureDays, setFutureDays] = useState("3");
  const [tempUnit, setTempUnit] = useState("fahrenheit");
  const [windSpeedUnit, setWindSpeedUnit] = useState("mph");
  const [precipitationUnit, setPrecipitationUnit] = useState("inch");
  const [elevation, setElevation] = useState(90);
  const [favoriteLocations, setFavoriteLocations] = useState<
    Array<{ lat: string; lon: string; name: string }>
  >([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("favoriteLocations");
      if (saved) {
        setFavoriteLocations(JSON.parse(saved));
        return;
      }
    }
    setFavoriteLocations([
      { name: "Hack Club HQ", lat: "44.3804303", lon: "-73.2276389" },
      { name: "Null Island", lat: "0", lon: "0" },
      { name: "Hell, Michigan", lat: "42.4337815", lon: "-83.9845105" },
      { name: "Alcatraz", lat: "37.826835", lon: "-122.4236893" },
    ]);
  }, []);
  const [comboxOpen, setComboxOpen] = useState(false);
  const [comboxValue, setComboxValue] = useState("");
  const [comboxPlaces, setComboxPlaces] = useState<
    Array<{ id: string; name: string; lat: string; lon: string }>
  >([]);
  const [comboxString, setComboxString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unitIndicator, setUnitIndicator] = useState("°F");

  type weatherDataType = Array<{
    time: Date;
    temp: number;
    precipitation: number;
    apparent_temp: number;
    wind_speed: number;
    wind_gusts: number;
    cloud_cover: number;
  }> | null;
  const [futureWeather, setFutureWeather] = useState<weatherDataType>(null);
  type weatherAlertType = Array<{
    title: string;
    description: string;
    start: Date;
    end: Date;
    severity: string;
    senderName: string;
    instuction: string;
  }>;
  const [weatherAlerts, setWeatherAlerts] = useState<weatherAlertType>([]);

  const fetchWeather = useCallback(() => {
    if (lat === null || lon === null) return;
    setIsLoading(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,windspeed_10m_max,windgusts_10m_max,uv_index_max&temperature_unit=${tempUnit}&wind_speed_unit=${windSpeedUnit}&precipitation_unit=${precipitationUnit}&current=precipitation,weathercode,windspeed,winddirection,temperature,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&past_days=${pastDays}&forecast_days=${futureDays}&minutely_15=temperature_2m,weather_code,precipitation_probability,precipitation,apparent_temperature,cloud_cover,wind_speed_10m,wind_gusts_10m,cloud_cover&elevation=${elevation}`
    )
      .then((response) => response.json())
      .then((data) => {
        setRawData(data);
        console.log("Weather data:", data);
      })
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
    fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
      headers: {
        "User-Agent": "tempestas (pythonatsea@duck.com)",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.features) {
          const alerts = data.features.map(
            (feature: {
              properties: {
                event: string;
                description: string;
                onset: string;
                ends: string;
                severity: string;
                senderName: string;
                instruction: string;
              };
            }) => ({
              title: feature.properties.event,
              description: feature.properties.description.replace(
                /([^\n])\n([^\n])/g,
                "$1 $2"
              ),
              start: new Date(feature.properties.onset),
              end: new Date(feature.properties.ends),
              severity: feature.properties.severity,
              senderName: feature.properties.senderName,
              instuction: feature.properties.instruction,
            })
          );
          setWeatherAlerts(alerts);
        } else {
          setWeatherAlerts([]);
        }
        console.log("Weather alerts:", data);
      })
      .catch((error) => {
        console.error("Error fetching weather alerts:", error);
      });
    setCurrentTime(new Date(Date.now()));
  }, [
    elevation,
    futureDays,
    lat,
    lon,
    pastDays,
    precipitationUnit,
    tempUnit,
    windSpeedUnit,
  ]);

  useEffect(() => {
    setUnitIndicator(tempUnit === "celsius" ? "°C" : "°F");
  }, [tempUnit]);

  const {
    gradientStops,
    windSpeedGradientStops,
    windGustGradientStops,
    yDomain,
  } = useMemo(() => {
    if (!futureWeather || futureWeather.length === 0) {
      return {
        gradientStops: [] as GradientStop[],
        windSpeedGradientStops: [] as GradientStop[],
        windGustGradientStops: [] as GradientStop[],
        yDomain: ["auto", "auto"] as const,
      };
    }

    let min = Infinity;
    let max = -Infinity;
    for (const d of futureWeather) {
      const temp = tempUnit === "celsius" ? d.temp * (9 / 5) + 32 : d.temp;
      if (temp < min) min = temp;
      if (temp > max) max = temp;
    }
    if (max === min) {
      max = max + 1;
      min = min - 1;
    }
    const denom = max - min;

    const included = [
      { temp: max, color: bandColorForTemp(max, "fahrenheit") },
      ...TEMP_COLOR_STOPS.filter((s) => s.temp <= max && s.temp >= min),
      { temp: min, color: bandColorForTemp(min, "fahrenheit") },
    ];

    const stops: GradientStop[] = included
      .map((s) => ({
        offset: (max - s.temp) / denom,
        color: s.color,
      }))
      .sort((a, b) => a.offset - b.offset);

    const clamped: GradientStop[] = [];
    for (const s of stops) {
      const off = Math.min(1, Math.max(0, s.offset));
      if (
        clamped.length === 0 ||
        Math.abs(clamped[clamped.length - 1].offset - off) > 0.001 ||
        clamped[clamped.length - 1].color !== s.color
      ) {
        clamped.push({ offset: off, color: s.color });
      }
    }

    let minWindSpeed = Infinity;
    let maxWindSpeed = -Infinity;
    let minWindGust = Infinity;
    let maxWindGust = -Infinity;

    for (const d of futureWeather) {
      if (d.wind_speed < minWindSpeed) minWindSpeed = d.wind_speed;
      if (d.wind_speed > maxWindSpeed) maxWindSpeed = d.wind_speed;
      if (d.wind_gusts < minWindGust) minWindGust = d.wind_gusts;
      if (d.wind_gusts > maxWindGust) maxWindGust = d.wind_gusts;
    }

    if (maxWindSpeed === minWindSpeed) {
      maxWindSpeed = maxWindSpeed + 1;
      minWindSpeed = Math.max(0, minWindSpeed - 1);
    }

    if (maxWindGust === minWindGust) {
      maxWindGust = maxWindGust + 1;
      minWindGust = Math.max(0, minWindGust - 1);
    }

    const windSpeedStops: GradientStop[] = [];
    for (let i = 0; i <= 10; i++) {
      const speed = minWindSpeed + (i / 10) * (maxWindSpeed - minWindSpeed);
      windSpeedStops.push({
        offset: i / 10,
        color: bandColorForWind(speed),
      });
    }

    const windGustStops: GradientStop[] = [];
    for (let i = 0; i <= 10; i++) {
      const speed = minWindGust + (i / 10) * (maxWindGust - minWindGust);
      windGustStops.push({
        offset: i / 10,
        color: bandColorForWind(speed),
      });
    }

    const domain: [number, number] = [Math.floor(min), Math.ceil(max)];
    return {
      gradientStops: clamped,
      windSpeedGradientStops: windSpeedStops,
      windGustGradientStops: windGustStops,
      yDomain: domain,
    };
  }, [futureWeather, tempUnit]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationSupported(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationLat(latitude.toFixed(6).toString());
        setLocationLon(longitude.toFixed(6).toString());
      },
      () => {
        setLocationSupported(false);
        setLocationLat(null);
        setLocationLon(null);
      }
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentTime(new Date()),
      5 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!lat || !lon) {
      setShareURL("");
      return;
    }
    const base = `${window.location.origin}/?lat=`;
    const latitude = preciseLocation
      ? Number(lat).toFixed(1)
      : Number(lat).toFixed(6);
    const longitude = preciseLocation
      ? Number(lon).toFixed(1)
      : Number(lon).toFixed(6);
    setShareURL(`${base}${latitude}&lon=${longitude}`);
  }, [lat, lon, preciseLocation]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLat = params.get("lat");
    const urlLon = params.get("lon");

    if (urlLat) setLat(urlLat);
    if (urlLon) setLon(urlLon);
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [lat, lon, locationSupported, fetchWeather]);

  useEffect(() => {
    const initialLat = "44.3804303";
    const initialLon = "-73.2276389";

    if (lat && lon) {
      const isInitialMount =
        document.visibilityState === "visible" &&
        !localStorage.getItem("hasSetLocation");

      if (!isInitialMount || lat !== initialLat || lon !== initialLon) {
        console.log("Saving to localStorage:", lat, lon);
        localStorage.setItem("latitude", lat);
        localStorage.setItem("longitude", lon);
        localStorage.setItem("hasSetLocation", "true");
      }
    }
  }, [lat, lon]);

  useEffect(() => {
    if (!rawData || !rawData.current) return;
    const [icon, description, color] = WeatherCodeToIcon(
      Number(rawData.current.weathercode)
    );
    setWeatherDescription(description);
    setWeatherIcon(icon);
    setWeatherColor(color);
    const futureTemps: weatherDataType = [];
    for (let i = 0; i < rawData.minutely_15.time.length; i++) {
      futureTemps.push({
        time: new Date(rawData.minutely_15.time[i]),
        temp: rawData.minutely_15.temperature_2m[i],
        precipitation: rawData.minutely_15.precipitation_probability[i],
        apparent_temp: rawData.minutely_15.apparent_temperature[i],
        wind_speed: rawData.minutely_15.wind_speed_10m[i],
        wind_gusts: Math.max(
          rawData.minutely_15.wind_gusts_10m[i],
          rawData.minutely_15.wind_speed_10m[i]
        ),
        cloud_cover: rawData.minutely_15.cloud_cover[i],
      });
    }
    setFutureWeather(futureTemps);
  }, [rawData]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:outline-2 focus:outline-offset-2"
      >
        Skip to main content
      </a>
      <header
        className="flex flex-row p-4 border-b border-border items-center justify-between"
        role="banner"
      >
        <h1 className="text-2xl font-bold">tempestas</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Share</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Share link to the weather at your location
              </DialogTitle>
              <DialogDescription>
                This link will allow others to view the weather information for
                your location.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-row items-center">
              <Checkbox
                id="precise-location"
                defaultChecked={preciseLocation}
                onCheckedChange={(checked) =>
                  setPreciseLocation(checked === true)
                }
                aria-describedby="precise-location-description"
              />
              <Label htmlFor="precise-location" className="ml-2 mb-4">
                Round to 1 decimal place (~6 mile accuracy)
              </Label>
              <span id="precise-location-description" className="sr-only">
                Check this to reduce the precision of your shared location for
                privacy
              </span>
            </div>
            <div className="flex flex-row space-x-2">
              <Input
                value={shareURL}
                readOnly
                aria-label="Shareable URL for current weather location"
              />
              <Button
                onClick={() => {
                  navigator.clipboard
                    .writeText(shareURL)
                    .then(() => {
                      setShareIcon(<Check />);
                      setTimeout(() => setShareIcon(<Copy />), 5000);
                    })
                    .catch((err) => {
                      console.error("Failed to copy: ", err);
                    });
                }}
                aria-label={
                  shareIcon.type === Copy
                    ? "Copy URL to clipboard"
                    : "URL copied to clipboard"
                }
              >
                {shareIcon}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <main
        id="main-content"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
        role="main"
      >
        {weatherAlerts.length > 0 &&
          weatherAlerts.map((alert, idx) => (
            <Card
              key={`alert-${idx}`}
              className={`${
                alert.severity === "Severe" || alert.severity === "Extreme"
                  ? "bg-destructive/10 border-destructive"
                  : "border-yellow-500 bg-yellow-500/10"
              } col-span-1 sm:col-span-2 lg:col-span-3`}
            >
              <CardHeader>
                <CardTitle
                  className={
                    alert.severity === "Severe" || alert.severity === "Extreme"
                      ? "text-destructive"
                      : "text-yellow-500"
                  }
                >
                  <div className="flex flex-row items-center space-x-2">
                    {alert.severity === "Severe" ||
                    alert.severity === "Extreme" ? (
                      <Siren />
                    ) : (
                      <TriangleAlert />
                    )}
                    <span>{alert.title}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">{alert.description}</p>
                <p>
                  <strong>{alert.instuction}</strong>
                </p>
                <p className="text-sm italic">
                  Effective:{" "}
                  {alert.start.toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {alert.end.toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <br />
                  Issued by: {alert.senderName}
                </p>
              </CardContent>
            </Card>
          ))}

        <Card className="col-span-1 sm:row-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 flex-grow">
            <div className="space-y-2">
              <div className="flex flex-col space-y-2 mb-6">
                <Label>Place Name:</Label>
                <Popover open={comboxOpen} onOpenChange={setComboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="justify-between"
                      aria-expanded={comboxOpen}
                      aria-controls="place-name-combobox"
                      aria-haspopup="listbox"
                      aria-label="Place Name"
                      tabIndex={0}
                      onClick={() => setComboxOpen((open) => !open)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setComboxOpen((open) => !open);
                        }
                      }}
                    >
                      {comboxValue || "Select place..."}
                      <ChevronDown
                        className="ml-2 h-4 w-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fill p-0" align="end">
                    <Command>
                      <CommandInput
                        placeholder="Shelburne, VT"
                        className="h-9"
                        aria-label="Search for a place"
                        aria-autocomplete="list"
                        aria-controls="place-search-results"
                        onValueChange={(text) => {
                          if (text.length < 3) {
                            setComboxPlaces([]);
                            setComboxString("");
                            return;
                          }
                          setComboxString(text);
                          fetch(
                            `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${text}&f=json`
                          )
                            .then((response) => response.json())
                            .then((data) => {
                              if (data && data.candidates) {
                                const seen = new Set<string>();
                                const places = data.candidates
                                  .filter((candidate: { address: string }) => {
                                    if (seen.has(candidate.address))
                                      return false;
                                    seen.add(candidate.address);
                                    return true;
                                  })
                                  .map(
                                    (candidate: {
                                      address: string;
                                      location: { y: number; x: number };
                                      attributes: { PlaceName: string };
                                    }) => ({
                                      id: candidate.address,
                                      name: candidate.address,
                                      lat: candidate.location.y
                                        .toFixed(6)
                                        .toString(),
                                      lon: candidate.location.x
                                        .toFixed(6)
                                        .toString(),
                                    })
                                  );
                                setComboxPlaces(places);
                              } else {
                                setComboxPlaces([]);
                              }
                            })
                            .catch((error) => {
                              console.error(
                                "Error fetching place data:",
                                error
                              );
                              setComboxPlaces([]);
                            });
                        }}
                      />
                      <CommandEmpty className="h-12 flex items-center justify-center">
                        {comboxString ? (
                          <Loader2
                            className="animate-spin"
                            aria-label="Loading search results"
                          />
                        ) : (
                          "Search for something!"
                        )}
                      </CommandEmpty>
                      <CommandGroup id="place-search-results">
                        {comboxPlaces.map((place) => (
                          <CommandItem
                            key={place.id}
                            onSelect={() => {
                              setComboxValue(place.name);
                              setLat(place.lat);
                              setLon(place.lon);
                              setComboxOpen(false);
                            }}
                            role="option"
                            aria-selected={comboxValue === place.name}
                            tabIndex={0}
                            className="flex items-center justify-between"
                          >
                            <span>{place.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {place.lat.substring(0, 7)},{" "}
                              {place.lon.substring(0, 7)}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col space-y-2 mb-6">
                <Label htmlFor="latitude">Latitude:</Label>
                <Input
                  id="latitude"
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-fill"
                  aria-label="Latitude"
                  aria-describedby="lat-hint"
                  min="-90"
                  max="90"
                  step="0.000001"
                />
              </div>
              <div className="flex flex-col space-y-2 mb-6">
                <Label htmlFor="longitude">Longitude:</Label>
                <Input
                  id="longitude"
                  type="number"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-fill"
                  aria-label="Longitude"
                  aria-describedby="lon-hint"
                  min="-180"
                  max="180"
                  step="0.000001"
                />
              </div>
              <Button
                disabled={!locationLat || !locationLon}
                className="w-full mb-6"
                variant={locationSupported ? "default" : "destructive"}
                onClick={() => {
                  if (locationLat) setLat(locationLat);
                  if (locationLon) setLon(locationLon);
                  setComboxValue("");
                }}
                aria-label={
                  locationSupported
                    ? "Use current location"
                    : "Location services disabled"
                }
              >
                {locationSupported &&
                  (!locationLat || !locationLon ? (
                    <Loader2
                      className="animate-spin"
                      aria-label="Loading location"
                    />
                  ) : (
                    <LocateFixed aria-label="Current location icon" />
                  ))}
                {locationSupported ? (
                  "Current Location"
                ) : (
                  <>
                    <OctagonAlert aria-label="Location services disabled icon" />{" "}
                    Location Services Disabled
                  </>
                )}
              </Button>
              <Label>Favorite Locations:</Label>
              <div className="flex flex-col space-y-2">
                {favoriteLocations.map((loc, idx) => (
                  <Button
                    key={`fav-loc-${idx}`}
                    variant="outline"
                    onClick={() => {
                      setLat(loc.lat);
                      setLon(loc.lon);
                      setComboxValue("");
                    }}
                    aria-label={`Select favorite location: ${loc.name}`}
                  >
                    {loc.name}
                  </Button>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Pencil />
                      Edit Favorites
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Favorite Locations</DialogTitle>
                      <DialogDescription>
                        Add or remove favorite locations for quick access.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4">
                      {favoriteLocations.map((loc, idx) => (
                        <div
                          key={`edit-fav-${idx}`}
                          className="flex flex-row space-x-2"
                        >
                          <Input
                            value={loc.name}
                            onChange={(e) => {
                              const newFavs = [...favoriteLocations];
                              newFavs[idx].name = e.target.value;
                              setFavoriteLocations(newFavs);
                              localStorage.setItem(
                                "favoriteLocations",
                                JSON.stringify(newFavs)
                              );
                            }}
                            placeholder="Location Name"
                          />
                          <Input
                            value={loc.lat}
                            onChange={(e) => {
                              const newFavs = [...favoriteLocations];
                              newFavs[idx].lat = e.target.value;
                              setFavoriteLocations(newFavs);
                              localStorage.setItem(
                                "favoriteLocations",
                                JSON.stringify(newFavs)
                              );
                            }}
                            placeholder="Latitude"
                          />
                          <Input
                            value={loc.lon}
                            onChange={(e) => {
                              const newFavs = [...favoriteLocations];
                              newFavs[idx].lon = e.target.value;
                              setFavoriteLocations(newFavs);
                              localStorage.setItem(
                                "favoriteLocations",
                                JSON.stringify(newFavs)
                              );
                            }}
                            placeholder="Longitude"
                          />
                          <Button
                            variant="secondary"
                            onClick={() => {
                              const newFavs = favoriteLocations.filter(
                                (_, i) => i !== idx
                              );
                              setFavoriteLocations(newFavs);
                              localStorage.setItem(
                                "favoriteLocations",
                                JSON.stringify(newFavs)
                              );
                            }}
                            aria-label={`Remove favorite location: ${loc.name}`}
                          >
                            <Trash aria-label="Remove" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={() => {
                          const newFavs = [
                            ...favoriteLocations,
                            {
                              name: comboxValue || "New Location",
                              lat: lat,
                              lon: lon,
                            },
                          ];
                          setFavoriteLocations(newFavs);
                          localStorage.setItem(
                            "favoriteLocations",
                            JSON.stringify(newFavs)
                          );
                        }}
                        aria-label="Add favorite location"
                      >
                        <Heart aria-label="Add" /> Add Favorite
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 row-span-1">
          <CardHeader>
            <CardTitle>Units</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            <div className="flex flex-col space-y-2">
              <Label>Temperature Unit:</Label>
              <Select
                value={tempUnit}
                onValueChange={(value) => setTempUnit(value)}
              >
                <SelectTrigger
                  className="w-full"
                  aria-label="Temperature unit selector"
                >
                  <SelectValue placeholder={`Temperature Unit`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Wind Speed Unit:</Label>
              <Select
                value={windSpeedUnit}
                onValueChange={(value) => setWindSpeedUnit(value)}
              >
                <SelectTrigger
                  className="w-full"
                  aria-label="Wind speed unit selector"
                >
                  <SelectValue placeholder={`Wind Speed Unit`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mph">Miles per hour (mph)</SelectItem>
                  <SelectItem value="kmh">
                    Kilometers per hour (km/h)
                  </SelectItem>
                  <SelectItem value="ms">Meters per second (m/s)</SelectItem>
                  <SelectItem value="kn">Knots (kn)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Precipitation Unit:</Label>
              <Select
                value={precipitationUnit}
                onValueChange={(value) => setPrecipitationUnit(value)}
              >
                <SelectTrigger
                  className="w-full"
                  aria-label="Precipitation unit selector"
                >
                  <SelectValue placeholder={`Precipitation Unit`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inch">Inches (in)</SelectItem>
                  <SelectItem value="mm">Millimeters (mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Forecast Options</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow justify-between space-y-6 ">
            <div className="flex flex-row items-center space-x-2">
              <div className="flex flex-col space-y-2 w-full">
                <Label htmlFor="pastDays" className="whitespace-nowrap">
                  Past days:
                </Label>
                <Select
                  onValueChange={(value) => setPastDays(value)}
                  value={pastDays}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label="Past days selector"
                  >
                    <SelectValue placeholder="Past days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 days</SelectItem>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                    <SelectItem value="60">2 months</SelectItem>
                    <SelectItem value="90">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2 w-full">
                <Label htmlFor="futureDays" className="whitespace-nowrap">
                  Future days:
                </Label>
                <Select
                  onValueChange={(value) => setFutureDays(value)}
                  value={futureDays}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label="Future days selector"
                  >
                    <SelectValue placeholder="Future days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 days</SelectItem>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                    <SelectItem value="16">16 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col space-y-2 w-full">
              <Label htmlFor="elevation" className="whitespace-nowrap">
                Elevation:
              </Label>
              <Input
                id="elevation"
                type="number"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                placeholder="Elevation in meters"
                aria-label="Elevation in meters"
                min="0"
                max="10000"
              />
            </div>
            <div className="flex-grow" />
            <Button
              onClick={fetchWeather}
              className="flex items-center gap-2"
              aria-label="Refresh current weather"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" aria-label="Loading" />
              ) : (
                <RefreshCcw aria-label="Refresh" />
              )}
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </Button>
          </CardContent>
        </Card>
        <Card className="col-span-1 sm:col-span-1 lg:col-span-2 sm:row-span-2">
          <CardHeader>
            <CardTitle>Future weather</CardTitle>
          </CardHeader>
          <CardContent className="">
            {futureWeather ? (
              <ChartContainer config={chartConfig}>
                <LineChart
                  data={futureWeather}
                  aria-labelledby="chart-description"
                >
                  <defs>
                    <linearGradient
                      id="tempGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      {gradientStops.map((s, i) => (
                        <stop
                          key={`gs-${i}-${s.offset}`}
                          offset={`${(s.offset * 100).toFixed(3)}%`}
                          stopColor={s.color}
                        />
                      ))}
                    </linearGradient>
                    <linearGradient
                      id="windSpeedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      {windSpeedGradientStops.map((s, i) => (
                        <stop
                          key={`ws-gs-${i}-${s.offset}`}
                          offset={`${(s.offset * 100).toFixed(3)}%`}
                          stopColor={s.color}
                        />
                      ))}
                    </linearGradient>
                    <linearGradient
                      id="windGustGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      {windGustGradientStops.map((s, i) => (
                        <stop
                          key={`wg-gs-${i}-${s.offset}`}
                          offset={`${(s.offset * 100).toFixed(3)}%`}
                          stopColor={s.color}
                        />
                      ))}
                    </linearGradient>
                  </defs>
                  <Line
                    animationDuration={200}
                    unit="mph"
                    type="monotone"
                    dataKey="wind_speed"
                    strokeWidth={2}
                    dot={false}
                    stroke="#6CADD6"
                    name="Wind Speed"
                    activeDot={{ r: 4, fill: "#6CADD6" }}
                    role="img"
                    aria-label="Wind speed data"
                  />
                  <Line
                    animationDuration={200}
                    unit="mph"
                    type="monotone"
                    dataKey="wind_gusts"
                    strokeWidth={2}
                    dot={false}
                    stroke="#E5A47A"
                    name="Wind Gusts"
                    activeDot={{ r: 4, fill: "#E5A47A" }}
                    role="img"
                    aria-label="Wind gusts data"
                  />
                  <Line
                    animationDuration={200}
                    unit="in"
                    type="monotone"
                    dataKey="precipitation"
                    strokeWidth={2}
                    dot={false}
                    stroke="#6699CC"
                    name="Precipitation"
                    activeDot={{
                      fill: "#6699CC",
                    }}
                    role="img"
                    aria-label="Precipitation data"
                  />
                  <Line
                    animationDuration={200}
                    unit="in"
                    type="monotone"
                    dataKey="cloud_cover"
                    strokeWidth={2}
                    dot={false}
                    stroke="#A0A0A0"
                    name="Cloud Cover"
                    activeDot={{
                      fill: "#A0A0A0",
                    }}
                    role="img"
                    aria-label="Cloud cover data"
                  />
                  <Line
                    animationDuration={200}
                    unit={unitIndicator}
                    type="monotone"
                    dataKey="temp"
                    name="Temperature"
                    strokeWidth={2}
                    dot={false}
                    stroke="url(#tempGradient)"
                    activeDot={<TempActiveDot tempUnit={tempUnit} />}
                    role="img"
                    aria-label="Temperature data"
                  />
                  <CartesianGrid />
                  <YAxis domain={yDomain as [number, number]} tickCount={10} />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(timeStr) => {
                      const date = new Date(timeStr);
                      return date.toLocaleTimeString([], {
                        day: "numeric",
                        hour: "2-digit",
                      });
                    }}
                  />
                  <ReferenceLine
                    x={(() => {
                      if (!futureWeather || futureWeather.length === 0)
                        return undefined;
                      let closest = futureWeather[0];
                      let minDiff = Math.abs(
                        currentTime.getTime() - new Date(closest.time).getTime()
                      );
                      for (let i = 1; i < futureWeather.length; i++) {
                        const diff = Math.abs(
                          currentTime.getTime() -
                            new Date(futureWeather[i].time).getTime()
                        );
                        if (diff < minDiff) {
                          minDiff = diff;
                          closest = futureWeather[i];
                        }
                      }
                      return new Date(closest.time).getTime();
                    })()}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeDasharray="15 30"
                  />
                  <ChartTooltip
                    animationDuration={0}
                    content={
                      <ChartTooltipContent
                        hideIndicator
                        labelFormatter={(value, payload) => {
                          if (
                            payload &&
                            payload.length > 0 &&
                            payload[0].payload
                          ) {
                            const date = payload[0].payload.time;
                            return date.toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          }
                          return value;
                        }}
                      />
                    }
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 row-span-1">
          <CardHeader>
            <CardTitle
              suppressHydrationWarning
              className="flex flex-row items-center text-sm sm:text-base"
            >
              Current Weather (as of{" "}
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
              ){" "}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rawData && rawData.current ? (
              <>
                <div
                  className="mb-4 text-center p-3 border shadow-sm"
                  style={{
                    background: `linear-gradient(to right, ${weatherColor}60, ${bandColorForTemp(
                      rawData.current.temperature,
                      tempUnit
                    )}60)`,
                  }}
                >
                  {currentWeatherText(
                    Number(rawData.current.temperature),
                    Number(rawData.current.wind_speed_10m),
                    Number(rawData.current.weathercode)
                  )}
                </div>
                <div className="flex items-center mb-2">
                  <Thermometer aria-hidden="true" className="mr-2" />
                  <span
                    className="px-1"
                    style={{
                      backgroundColor: bandColorForTemp(
                        rawData.current.temperature,
                        tempUnit
                      ),
                      color: getTextColorForBackground(
                        bandColorForTemp(rawData.current.temperature, tempUnit)
                      ),
                    }}
                  >
                    {Number(rawData.current.temperature).toFixed(1)}
                    {unitIndicator}
                  </span>
                  , feels like
                  <span
                    className="ml-2 px-1"
                    style={{
                      backgroundColor: bandColorForTemp(
                        rawData.current.apparent_temperature,
                        tempUnit
                      ),
                      color: getTextColorForBackground(
                        bandColorForTemp(
                          rawData.current.apparent_temperature,
                          tempUnit
                        )
                      ),
                    }}
                  >
                    {Number(rawData.current.apparent_temperature).toFixed(1)}
                    {unitIndicator}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span aria-hidden="true">{weatherIcon}</span>{" "}
                  <span
                    className="px-1"
                    style={{
                      backgroundColor: weatherColor,
                      color: getTextColorForBackground(weatherColor),
                    }}
                  >
                    {weatherDescription}
                  </span>
                </div>

                <div className="flex items-center mb-2">
                  <Wind aria-hidden="true" />
                  <span
                    className="px-1 ml-2"
                    style={{
                      backgroundColor: bandColorForWind(
                        rawData.current.wind_speed_10m
                      ),
                      color: getTextColorForBackground(
                        bandColorForWind(rawData.current.wind_speed_10m)
                      ),
                    }}
                  >
                    {Number(rawData.current.wind_speed_10m).toFixed(1)} mph
                  </span>
                  , gusting to
                  <span
                    className="ml-2 px-1"
                    style={{
                      backgroundColor: bandColorForWind(
                        rawData.current.wind_gusts_10m
                      ),
                      color: getTextColorForBackground(
                        bandColorForWind(rawData.current.wind_gusts_10m)
                      ),
                    }}
                  >
                    {Number(rawData.current.wind_gusts_10m).toFixed(1)} mph
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon iconNode={glassesSun} aria-hidden="true" />
                  {getUVIndexDisplay(
                    Number(Number(rawData.current.uv_index).toFixed(1))
                  )}
                </div>
              </>
            ) : (
              <Skeleton className="h-30" />
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 row-span-1">
          <CardHeader>
            <CardTitle>Daily weather</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {rawData && rawData.daily
                ? rawData.daily.time.map((date: string, idx: number) => (
                    <Card key={`daily-${idx}`} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>
                          {new Date(date).toLocaleDateString([], {
                            weekday: "long",
                            month: "short",
                            day: "2-digit",
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          {(() => {
                            const [icon, description, color] =
                              WeatherCodeToIcon(
                                rawData.daily.weather_code[idx]
                              );
                            return (
                              <>
                                <span aria-hidden="true">{icon}</span>
                                <span
                                  className="px-1"
                                  style={{
                                    backgroundColor: color,
                                    color: getTextColorForBackground(color),
                                  }}
                                >
                                  {description}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <ThermometerSnowflake />
                          <span
                            className="px-1"
                            style={{
                              backgroundColor: bandColorForTemp(
                                rawData.daily.temperature_2m_min[idx],
                                tempUnit
                              ),
                              color: getTextColorForBackground(
                                bandColorForTemp(
                                  rawData.daily.temperature_2m_min[idx].toFixed(
                                    1
                                  ),
                                  tempUnit
                                )
                              ),
                            }}
                          >
                            {Number(
                              rawData.daily.temperature_2m_min[idx]
                            ).toFixed(1)}
                            {unitIndicator}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ThermometerSun />
                          <span
                            className="px-1"
                            style={{
                              backgroundColor: bandColorForTemp(
                                rawData.daily.temperature_2m_max[idx],
                                tempUnit
                              ),
                              color: getTextColorForBackground(
                                bandColorForTemp(
                                  rawData.daily.temperature_2m_max[idx],
                                  tempUnit
                                )
                              ),
                            }}
                          >
                            {Number(
                              rawData.daily.temperature_2m_max[idx]
                            ).toFixed(1)}
                            {unitIndicator}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wind />
                          <span
                            className="px-1"
                            style={{
                              backgroundColor: bandColorForWind(
                                rawData.daily.windspeed_10m_max[idx]
                              ),
                              color: getTextColorForBackground(
                                bandColorForWind(
                                  rawData.daily.windspeed_10m_max[idx]
                                )
                              ),
                            }}
                          >
                            {Number(
                              rawData.daily.windspeed_10m_max[idx]
                            ).toFixed(1)}{" "}
                            mph
                          </span>
                          <span className="ml-1">Average</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wind />
                          <span
                            className="px-1"
                            style={{
                              backgroundColor: bandColorForWind(
                                rawData.daily.windgusts_10m_max[idx]
                              ),
                              color: getTextColorForBackground(
                                bandColorForWind(
                                  rawData.daily.windgusts_10m_max[idx]
                                )
                              ),
                            }}
                          >
                            {Number(
                              rawData.daily.windgusts_10m_max[idx]
                            ).toFixed(1)}{" "}
                            mph
                          </span>
                          <span className="ml-1">Gusts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon iconNode={glassesSun} aria-hidden="true" />
                          {getUVIndexDisplay(
                            Number(
                              Number(rawData.daily.uv_index_max[idx]).toFixed(1)
                            )
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <CloudRain />
                          <span>{rawData.daily.precipitation_sum[idx]} in</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sunrise />
                          <span>
                            {new Date(
                              rawData.daily.sunrise[idx]
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sunset />
                          <span>
                            {new Date(
                              rawData.daily.sunset[idx]
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : Array.from({
                    length: Number(pastDays) + Number(futureDays),
                  }).map((_, idx) => (
                    <Skeleton
                      key={`skeleton-${idx}`}
                      className="h-[278px] w-full"
                    />
                  ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 row-span-1">
          <CardHeader>
            <CardTitle>Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Weather data provided by{" "}
              <a
                href="https://open-meteo.com/"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Open-Meteo website (opens in new tab)"
              >
                Open-Meteo
              </a>
            </p>
            <p>
              Alert data provided by{" "}
              <a
                href="https://www.weather.gov/documentation/services-web-api#/"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit National Weather Service API documentation (opens in new tab)"
              >
                NWS
              </a>
            </p>
            <p>
              Geocoding provided by{" "}
              <a
                href="https://www.arcgis.com/index.html"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit ArcGIS website (opens in new tab)"
              >
                ArcGIS
              </a>
            </p>
            <p>
              Made with{" "}
              <Heart
                size={16}
                className="inline-block animate-pulse text-red-800 [animation-duration:3s]"
                aria-label="Heart icon"
              />{" "}
              by{" "}
              <a
                href="https://github.com/pythonatsea"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit pythonatsea's GitHub profile (opens in new tab)"
              >
                pythonatsea
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
      {/*<p>{JSON.stringify(rawData)}</p>*/}
    </>
  );
}
