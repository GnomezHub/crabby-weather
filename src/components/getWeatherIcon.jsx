
const getWeatherIcon = (code, isDay = true) => {
  if (code <= 1) return isDay ? "sun" : "moon";
  if (code <= 3) return "cloud";
  if (code <= 48) return "fog";
  if (code <= 57 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 67) return "rain";
  if (code <= 77 || (code >= 85 && code <= 86)) return "snow";
  if (code >= 95) return "storm";
  return "sun";
};
export default getWeatherIcon;