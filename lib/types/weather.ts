export interface WeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: CurrentUnits;
  current: CurrentData;
  hourly_units: HourlyUnits;
  hourly: HourlyData;
  daily_units: DailyUnits;
  daily: DailyData;
}

export interface CurrentUnits {
  time: "iso8601" | string;
  interval: "seconds" | string;
  temperature_2m: "°F" | string;
  relative_humidity_2m: "%" | string;
  apparent_temperature: "°F" | string;
  is_day: "" | string;
  weather_code: "wmo code" | string;
  wind_speed_10m: "mp/h" | string;
  wind_direction_10m: "°" | string;
  wind_gusts_10m: "mp/h" | string;
  precipitation: "inch" | string;
  rain: "inch" | string;
  showers: "inch" | string;
  snowfall: "inch" | string;
  cloud_cover: "%" | string;
  pressure_msl: "hPa" | string;
  surface_pressure: "hPa" | string;
}

export interface CurrentData {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: 0 | 1;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  cloud_cover: number;
  pressure_msl: number;
  surface_pressure: number;
}

export interface HourlyUnits {
  time: "iso8601" | string;
  temperature_2m: "°F" | string;
  weather_code: "wmo code" | string;
  apparent_temperature: "°F" | string;
  relative_humidity_2m: "%" | string;
  dew_point_2m: "°F" | string;
  pressure_msl: "hPa" | string;
  cloud_cover: "%" | string;
  visibility: "ft" | string;
  precipitation: "inch" | string;
  precipitation_probability: "%" | string;
  rain: "inch" | string;
  showers: "inch" | string;
  snowfall: "inch" | string;
  snow_depth: "ft" | string;
  wind_speed_10m: "mp/h" | string;
  wind_gusts_10m: "mp/h" | string;
  surface_pressure: "hPa" | string;
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  apparent_temperature: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  pressure_msl: number[];
  cloud_cover: number[];
  visibility: number[];
  precipitation: number[];
  precipitation_probability: number[];
  rain: number[];
  showers: number[];
  snowfall: number[];
  snow_depth: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  surface_pressure: number[];
}

export interface DailyUnits {
  time: "iso8601" | string;
  weather_code: "wmo code" | string;
  temperature_2m_max: "°F" | string;
  temperature_2m_min: "°F" | string;
  apparent_temperature_max: "°F" | string;
  apparent_temperature_min: "°F" | string;
  sunrise: "iso8601" | string;
  sunset: "iso8601" | string;
  wind_speed_10m_max: "mp/h" | string;
  wind_direction_10m_dominant: "°" | string;
  wind_gusts_10m_max: "mp/h" | string;
  daylight_duration: "s" | string;
  sunshine_duration: "s" | string;
  uv_index_max: "" | string;
  uv_index_clear_sky_max: "" | string;
  showers_sum: "inch" | string;
  snowfall_sum: "inch" | string;
  rain_sum: "inch" | string;
  precipitation_sum: "inch" | string;
  precipitation_hours: "h" | string;
  precipitation_probability_max: "%" | string;
}

export interface DailyData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  wind_speed_10m_max: number[];
  wind_direction_10m_dominant: number[];
  wind_gusts_10m_max: number[];
  daylight_duration: number[];
  sunshine_duration: number[];
  uv_index_max: number[];
  uv_index_clear_sky_max: number[];
  showers_sum: number[];
  snowfall_sum: number[];
  rain_sum: number[];
  precipitation_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
}
