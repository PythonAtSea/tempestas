"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo, useCallback } from "react";

import {
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
} from "lucide-react";
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
import zipcodes from "zipcodes-us";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

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

function bandColorForTemp(temp: number): string {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TempActiveDot(props: any) {
  const { cx, cy, value } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill={bandColorForTemp(value)} />
    </g>
  );
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
  const [locationSupported, setLocationSupported] = useState(true);
  const [preciseLocation, setPreciseLocation] = useState(true);
  const [shareURL, setShareURL] = useState("");
  const [shareIcon, setShareIcon] = useState(<Copy />);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [zip, setZip] = useState("");
  const [pastDays, setPastDays] = useState("0");
  const [futureDays, setFutureDays] = useState("3");
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
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,windspeed_10m_max,windgusts_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&current=precipitation,weathercode,windspeed,winddirection,temperature,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m&past_days=${pastDays}&forecast_days=${futureDays}&minutely_15=temperature_2m,weather_code,precipitation_probability,precipitation,apparent_temperature,cloud_cover,wind_speed_10m,wind_gusts_10m,cloud_cover`
    )
      .then((response) => response.json())
      .then((data) => {
        setRawData(data);
        console.log("Weather data:", data);
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
  }, [futureDays, lat, lon, pastDays]);

  const { gradientStops, yDomain } = useMemo(() => {
    if (!futureWeather || futureWeather.length === 0) {
      return {
        gradientStops: [] as GradientStop[],
        yDomain: ["auto", "auto"] as const,
      };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const d of futureWeather) {
      if (d.temp < min) min = d.temp;
      if (d.temp > max) max = d.temp;
    }
    if (max === min) {
      max = max + 1;
      min = min - 1;
    }
    const denom = max - min;

    const included = [
      { temp: max, color: bandColorForTemp(max) },
      ...TEMP_COLOR_STOPS.filter((s) => s.temp <= max && s.temp >= min),
      { temp: min, color: bandColorForTemp(min) },
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
    const domain: [number, number] = [Math.floor(min), Math.ceil(max)];
    return { gradientStops: clamped, yDomain: domain };
  }, [futureWeather]);

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
    const info = zipcodes.find(zip);
    if (zip.length === 5 && info.isValid) {
      setLat(info.latitude.toFixed(6).toString());
      setLon(info.longitude.toFixed(6).toString());
      setZip("");
    }
  }, [zip]);

  useEffect(() => {
    if (!rawData || !rawData.current) return;
    const weatherCode = Number(rawData.current.weathercode);
    let description = "";
    let icon = <CircleQuestionMark />;

    switch (weatherCode) {
      case 0:
        description = "Clear sky";
        icon = <Sun />;
        break;
      case 1:
        description = "Mainly clear";
        icon = <Sun />;
        break;
      case 2:
        description = "Partly cloudy";
        icon = <CloudSun />;
        break;
      case 3:
        description = "Overcast";
        icon = <Cloudy />;
        break;
      case 45:
      case 48:
        description = "Foggy";
        icon = <Haze />;
        break;
      case 51:
        description = "Light drizzle";
        icon = <CloudDrizzle />;
        break;
      case 53:
        description = "Moderate drizzle";
        icon = <CloudDrizzle />;
        break;
      case 55:
        description = "Dense drizzle";
        icon = <CloudDrizzle />;
        break;
      case 61:
        description = "Light rain";
        icon = <CloudRain />;
        break;
      case 63:
        description = "Moderate rain";
        icon = <CloudRain />;
        break;
      case 65:
        description = "Heavy rain";
        icon = <CloudRain />;
        break;
      case 71:
        description = "Light snow";
        icon = <CloudSnow />;
        break;
      case 73:
        description = "Moderate snow";
        icon = <CloudSnow />;
        break;
      case 75:
        description = "Heavy snow";
        icon = <CloudSnow />;
        break;
      case 80:
        description = "Light rain showers";
        icon = <CloudRain />;
        break;
      case 81:
        description = "Moderate rain showers";
        icon = <CloudRain />;
        break;
      case 82:
        description = "Heavy rain showers";
        icon = <CloudRain />;
        break;
      case 85:
        description = "Light snow showers";
        icon = <CloudSnow />;
        break;
      case 86:
        description = "Heavy snow showers";
        icon = <CloudSnow />;
        break;
      case 95:
        description = "Thunderstorm";
        icon = <CloudLightning />;
        break;
      default:
        description = "Unknown weather condition, code: " + weatherCode;
    }
    setWeatherDescription(description);
    setWeatherIcon(icon);
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
      <header className="flex flex-row p-4 border-b border-border items-center justify-between">
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
            <div className="flex flex-row">
              <Checkbox
                id="precise-location"
                defaultChecked={preciseLocation}
                onCheckedChange={(checked) =>
                  setPreciseLocation(checked === true)
                }
              />
              <Label htmlFor="precise-location" className="ml-2 mb-4">
                Round to 1 decimal place (~6 mile accuracy)
              </Label>
            </div>
            <div className="flex flex-row space-x-2">
              <Input value={shareURL} readOnly />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareURL);
                  setShareIcon(<Check />);
                  setTimeout(() => setShareIcon(<Copy />), 5000);
                }}
              >
                {shareIcon}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 flex-grow">
            <div className="space-y-2">
              <div className="flex flex-col space-y-2 mb-6">
                <Label htmlFor="zip">ZIP Code:</Label>
                <Input
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-fill"
                  placeholder="US Zip code"
                />
              </div>
              <div className="flex flex-col space-y-2 mb-6">
                <Label htmlFor="latitude">Latitude:</Label>
                <Input
                  id="latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-fill"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="longitude">Longitude:</Label>
                <Input
                  id="longitude"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-fill"
                />
              </div>
              <Button
                disabled={!locationLat || !locationLon}
                className="w-full"
                variant={locationSupported ? "default" : "destructive"}
                onClick={() => {
                  if (locationLat) setLat(locationLat);
                  if (locationLon) setLon(locationLon);
                }}
              >
                {locationSupported &&
                  (!locationLat || !locationLon ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <LocateFixed />
                  ))}
                {locationSupported ? (
                  "Current Location"
                ) : (
                  <>
                    <OctagonAlert /> Location Services Disabled
                  </>
                )}
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setLat("44.3804303");
                  setLon("-73.2276389");
                }}
              >
                Hack Club HQ
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setLat("0");
                  setLon("0");
                }}
              >
                Null Island
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setLat("42.4337815");
                  setLon("-83.9845105");
                }}
              >
                Hell, Michigan
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setLat("37.826835");
                  setLon("-122.4236893");
                }}
              >
                Alcatraz
              </Button>
              <div className="flex flex-row items-center space-x-2 mt-4">
                <div className="flex flex-col space-y-2 w-full">
                  <Label htmlFor="pastDays" className="whitespace-nowrap">
                    Past days:
                  </Label>
                  <Select
                    onValueChange={(value) => setPastDays(value)}
                    value={pastDays}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Past days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Future days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-1 lg:col-span-2 sm:row-span-2">
          <CardHeader>
            <CardTitle>Future weather</CardTitle>
          </CardHeader>
          <CardContent className="">
            {futureWeather ? (
              <ChartContainer config={chartConfig}>
                <LineChart data={futureWeather}>
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
                  </defs>
                  <Line
                    animationDuration={200}
                    unit="mph"
                    type="monotone"
                    dataKey="wind_speed"
                    strokeWidth={2}
                    dot={false}
                    stroke="#8ABAD3"
                    activeDot={{
                      fill: "#8ABAD3",
                    }}
                  />
                  <Line
                    animationDuration={200}
                    unit="mph"
                    type="monotone"
                    dataKey="wind_gusts"
                    strokeWidth={2}
                    dot={false}
                    stroke="#5D8AA8"
                    activeDot={{
                      fill: "#5D8AA8",
                    }}
                  />
                  <Line
                    animationDuration={200}
                    unit="in"
                    type="monotone"
                    dataKey="precipitation"
                    strokeWidth={2}
                    dot={false}
                    stroke="#6699CC"
                    activeDot={{
                      fill: "#6699CC",
                    }}
                  />
                  <Line
                    animationDuration={200}
                    unit="in"
                    type="monotone"
                    dataKey="cloud_cover"
                    strokeWidth={2}
                    dot={false}
                    stroke="#A0A0A0"
                    activeDot={{
                      fill: "#A0A0A0",
                    }}
                  />
                  <Line
                    animationDuration={200}
                    unit="°F"
                    type="monotone"
                    dataKey="temp"
                    strokeWidth={2}
                    dot={false}
                    stroke="url(#tempGradient)"
                    activeDot={<TempActiveDot />}
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
              <Button
                onClick={fetchWeather}
                variant="link"
                className="ml-auto p-0 h-auto"
              >
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rawData && rawData.current ? (
              <>
                <div className="flex items-center space-x-2 mb-2">
                  <Thermometer />
                  <span>{`${rawData.current.temperature}°F, feels like ${rawData.current.apparent_temperature}°F`}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  {weatherIcon} <span>{weatherDescription}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind />
                  <span>{`${rawData.current.wind_speed_10m} mph, gusting to ${rawData.current.wind_gusts_10m}`}</span>
                </div>
              </>
            ) : (
              <Skeleton className="h-14" />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2 row-span-1">
          <CardHeader>
            <CardTitle>Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Weather data provided by{" "}
              <a
                href="https://open-meteo.com/"
                className="text-blue-500 hover:underline"
              >
                Open-Meteo
              </a>
            </p>
            <p>
              Alert data provided by{" "}
              <a
                href="https://www.weather.gov/documentation/services-web-api#/"
                className="text-blue-500 hover:underline"
              >
                NWS
              </a>
            </p>
            <p>
              Made with{" "}
              <Heart
                size={14}
                className="inline-block animate-pulse text-red-800 [animation-duration:3s]"
              />{" "}
              by{" "}
              <a
                href="https://github.com/pythonatsea"
                className="text-blue-500 hover:underline"
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
