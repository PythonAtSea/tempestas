export function getWeatherCodeDescription(
  code: number,
  day = true
): { weatherCondition: string; iconClass: string } {
  let weatherCondition: string;
  let iconClass: string;
  switch (code) {
    case 0:
      weatherCondition = "Clear skies";
      iconClass = day ? "wi-day-sunny" : "wi-night-clear";
      break;
    case 1:
      weatherCondition = "Mainly clear skies";
      iconClass = day ? "wi-day-sunny-overcast" : "wi-night-alt-cloudy";
      break;
    case 2:
      weatherCondition = "Partly cloudy skies";
      iconClass = day ? "wi-day-cloudy" : "wi-night-alt-cloudy";
      break;
    case 3:
      weatherCondition = "Overcast skies";
      iconClass = "wi-cloudy";
      break;
    case 45:
      weatherCondition = "Fog";
      iconClass = day ? "wi-day-fog" : "wi-night-fog";
      break;
    case 48:
      weatherCondition = "Depositing rime fog";
      iconClass = day ? "wi-day-fog" : "wi-night-fog";
      break;
    case 51:
      weatherCondition = "Light drizzle";
      iconClass = day ? "wi-day-sprinkle" : "wi-night-alt-sprinkle";
      break;
    case 53:
      weatherCondition = "Moderate drizzle";
      iconClass = day ? "wi-day-sprinkle" : "wi-night-alt-sprinkle";
      break;
    case 55:
      weatherCondition = "Dense drizzle";
      iconClass = day ? "wi-day-rain" : "wi-night-alt-rain";
      break;
    case 61:
      weatherCondition = "Light rain";
      iconClass = day ? "wi-day-rain" : "wi-night-alt-rain";
      break;
    case 63:
      weatherCondition = "Moderate rain";
      iconClass = day ? "wi-day-rain" : "wi-night-alt-rain";
      break;
    case 65:
      weatherCondition = "Heavy rain";
      iconClass = day ? "wi-day-rain-wind" : "wi-night-alt-rain-wind";
      break;
    case 71:
      weatherCondition = "Light snow";
      iconClass = day ? "wi-day-snow" : "wi-night-alt-snow";
      break;
    case 73:
      weatherCondition = "Moderate snow";
      iconClass = day ? "wi-day-snow" : "wi-night-alt-snow";
      break;
    case 75:
      weatherCondition = "Heavy snow";
      iconClass = day ? "wi-day-snow-wind" : "wi-night-alt-snow-wind";
      break;
    case 80:
      weatherCondition = "Light rain showers";
      iconClass = day ? "wi-day-showers" : "wi-night-alt-showers";
      break;
    case 81:
      weatherCondition = "Moderate rain showers";
      iconClass = day ? "wi-day-showers" : "wi-night-alt-showers";
      break;
    case 82:
      weatherCondition = "Violent rain showers";
      iconClass = day ? "wi-day-rain-wind" : "wi-night-alt-rain-wind";
      break;
    case 85:
      weatherCondition = "Light snow showers";
      iconClass = day ? "wi-day-snow" : "wi-night-alt-snow";
      break;
    case 86:
      weatherCondition = "Heavy snow showers";
      iconClass = day ? "wi-day-snow-wind" : "wi-night-alt-snow-wind";
      break;
    case 95:
      weatherCondition = "Thunderstorms";
      iconClass = day ? "wi-day-thunderstorm" : "wi-night-alt-thunderstorm";
      break;
    case 96:
      weatherCondition = "Thunderstorms with light hail";
      iconClass = day ? "wi-day-hail" : "wi-night-alt-hail";
      break;
    case 99:
      weatherCondition = "Thunderstorms with heavy hail";
      iconClass = day ? "wi-day-hail" : "wi-night-alt-hail";
      break;
    default:
      weatherCondition = "Unknown";
      iconClass = "wi-na";
  }
  return { weatherCondition, iconClass };
}
