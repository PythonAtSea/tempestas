import { WeatherResponse } from "./types/weather";
import { getWeatherCodeDescription } from "./weather-code";

export function formatWeatherForLLM(weatherData: WeatherResponse): string {
  const { current, hourly } = weatherData;
  const cond = getWeatherCodeDescription(
    current.weather_code,
    current.is_day === 1
  );

  let output = `NOW: ${Math.round(
    current.temperature_2m
  )}°F, feels ${Math.round(current.apparent_temperature)}°F. ${
    cond.weatherCondition
  }. `;
  output += `Humidity ${current.relative_humidity_2m}%, Wind ${Math.round(
    current.wind_speed_10m
  )}mph (gusts ${Math.round(current.wind_gusts_10m)}mph), `;
  output += `Clouds ${current.cloud_cover}%, Pressure ${Math.round(
    current.pressure_msl
  )}hPa`;

  if (current.precipitation > 0 || current.rain > 0 || current.snowfall > 0) {
    output += `. Precip: ${current.precipitation.toFixed(2)}"`;
  }

  output += `\n\nNEXT 12HR:\n`;

  const now = new Date();
  const startIdx = hourly.time.findIndex(
    (t) => new Date(t).getTime() > now.getTime()
  );
  const start = startIdx >= 0 ? startIdx : 0;
  const end = Math.min(start + 12, hourly.time.length);

  for (let i = start; i < end; i++) {
    const t = new Date(hourly.time[i]);
    const hr = t.toLocaleTimeString(undefined, {
      hour: "numeric",
      hour12: true,
    });
    const isToday = t.getDate() === now.getDate();
    const cnd = getWeatherCodeDescription(hourly.weather_code[i], true);

    output += `${
      isToday
        ? hr
        : t.toLocaleDateString(undefined, { weekday: "short" }) + " " + hr
    }: `;
    output += `${Math.round(hourly.temperature_2m[i])}°F (${Math.round(
      hourly.apparent_temperature[i]
    )}°), `;
    output += `${cnd.weatherCondition}, ${hourly.relative_humidity_2m[i]}% hum, `;
    output += `${Math.round(hourly.wind_speed_10m[i])}mph wind`;

    if (hourly.precipitation_probability[i] > 0) {
      output += `, ${hourly.precipitation_probability[i]}% precip chance`;
    }
    output += `\n`;
  }

  return output;
}
