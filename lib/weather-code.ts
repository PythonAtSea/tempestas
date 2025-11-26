export function getWeatherCodeDescription(
  code: number,
  day = true
): { weatherCondition: string; iconClass: string } {
  let weatherCondition: string;
  let iconClass: string;
  switch (code) {
    case 0:
      weatherCondition = "clear skies";
      iconClass = day ? "wi-day-sunny" : "wi-night-clear";
      break;
    case 1:
      weatherCondition = "mainly clear skies";
      iconClass = day ? "wi-day-sunny-overcast" : "wi-night-alt-cloudy";
      break;
    case 2:
      weatherCondition = "partly cloudy skies";
      iconClass = day ? "wi-day-cloudy" : "wi-night-alt-cloudy";
      break;
    case 3:
      weatherCondition = "overcast skies";
      iconClass = "wi-cloudy";
      break;
    case 45:
      weatherCondition = "fog";
      iconClass = day ? "wi-day-fog" : "wi-night-fog";
      break;
    case 48:
      weatherCondition = "depositing rime fog";
      iconClass = day ? "wi-day-fog" : "wi-night-fog";
      break;
    case 51:
      weatherCondition = "light drizzle";
      iconClass = day ? "wi-day-sprinkle" : "wi-night-alt-sprinkle";
      break;
    case 53:
      weatherCondition = "moderate drizzle";
      iconClass = day ? "wi-day-sprinkle" : "wi-night-alt-sprinkle";
      break;
    case 55:
      weatherCondition = "dense drizzle";
      iconClass = day ? "wi-day-rain" : "wi-night-alt-rain";
      break;
    case 61:
      weatherCondition = "light rain";
      iconClass = day ? "wi-day-rain" : "wi-night-alt-rain";
      break;
    case 63:
      weatherCondition = "moderate rain";
      iconClass = day ? "wi-day-rain" : "wi-night-alt-rain";
      break;
    case 65:
      weatherCondition = "heavy rain";
      iconClass = day ? "wi-day-rain-wind" : "wi-night-alt-rain-wind";
      break;
    case 71:
      weatherCondition = "light snow";
      iconClass = day ? "wi-day-snow" : "wi-night-alt-snow";
      break;
    case 73:
      weatherCondition = "moderate snow";
      iconClass = day ? "wi-day-snow" : "wi-night-alt-snow";
      break;
    case 75:
      weatherCondition = "heavy snow";
      iconClass = day ? "wi-day-snow-wind" : "wi-night-alt-snow-wind";
      break;
    case 80:
      weatherCondition = "light rain showers";
      iconClass = day ? "wi-day-showers" : "wi-night-alt-showers";
      break;
    case 81:
      weatherCondition = "moderate rain showers";
      iconClass = day ? "wi-day-showers" : "wi-night-alt-showers";
      break;
    case 82:
      weatherCondition = "violent rain showers";
      iconClass = day ? "wi-day-rain-wind" : "wi-night-alt-rain-wind";
      break;
    case 85:
      weatherCondition = "light snow showers";
      iconClass = day ? "wi-day-snow" : "wi-night-alt-snow";
      break;
    case 86:
      weatherCondition = "heavy snow showers";
      iconClass = day ? "wi-day-snow-wind" : "wi-night-alt-snow-wind";
      break;
    case 95:
      weatherCondition = "thunderstorms";
      iconClass = day ? "wi-day-thunderstorm" : "wi-night-alt-thunderstorm";
      break;
    case 96:
      weatherCondition = "thunderstorms with light hail";
      iconClass = day ? "wi-day-hail" : "wi-night-alt-hail";
      break;
    case 99:
      weatherCondition = "thunderstorms with heavy hail";
      iconClass = day ? "wi-day-hail" : "wi-night-alt-hail";
      break;
    default:
      weatherCondition = "";
      iconClass = "wi-na";
  }
  return { weatherCondition, iconClass };
}
