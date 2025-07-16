import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Wind,
  Droplet,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  LoaderCircle,
  Moon,
  CloudFog,
  Clock,
  ChevronDown,
} from "lucide-react";
import WeatherIcon from "./components/WeatherIcon";
import Header from "./components/Header";
// --- Komponent för temaväxling ---
const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Växla tema"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

// --- Hjälpfunktioner för Open-Meteo API ---
const getWeatherDescription = (code) => {
  const descriptions = {
    0: "Klart",
    1: "Mestadels klart",
    2: "Delvis molnigt",
    3: "Mulet",
    45: "Dimma",
    48: "Rimfrost",
    51: "Lätt duggregn",
    53: "Måttligt duggregn",
    55: "Tätt duggregn",
    61: "Lätt regn",
    63: "Måttligt regn",
    65: "Starkt regn",
    71: "Lätt snöfall",
    73: "Måttligt snöfall",
    75: "Starkt snöfall",
    80: "Lätta regnskurar",
    81: "Måttliga regnskurar",
    82: "Kraftiga regnskurar",
    85: "Lätta snöbyar",
    86: "Kraftiga snöbyar",
    95: "Åskväder",
    96: "Åska med lätt hagel",
    99: "Åska med kraftigt hagel",
  };
  return descriptions[code] || "Okänt väder";
};

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

export default function App() {
  const [location, setLocation] = useState("Malmö");
  const [searchTerm, setSearchTerm] = useState("Malmö");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecastData, setHourlyForecastData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const fetchWeatherData = useCallback(async (city) => {
    setLoading(true);
    setError("");
    setCurrentWeather(null);
    setSelectedDate(null);

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1&accept-language=sv`
      );
      if (!geoResponse.ok) throw new Error("Kunde inte nå geocoding-tjänsten.");

      const geoData = await geoResponse.json();
      if (geoData.length === 0)
        throw new Error(`Staden "${city}" hittades inte.`);

      const { lat, lon, display_name } = geoData[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,is_day,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
      );
      if (!weatherResponse.ok) throw new Error("Kunde inte hämta väderdata.");

      const weatherData = await weatherResponse.json();

      setHourlyForecastData(weatherData.hourly);

      const formattedWeather = {
        location: display_name.split(",")[0],
        temp: Math.round(weatherData.current.temperature_2m),
        condition: getWeatherDescription(weatherData.current.weather_code),
        icon: getWeatherIcon(
          weatherData.current.weather_code,
          weatherData.current.is_day
        ),
        high: Math.round(weatherData.daily.temperature_2m_max[0]),
        low: Math.round(weatherData.daily.temperature_2m_min[0]),
        wind: Math.round(weatherData.current.wind_speed_10m * 3.6),
        humidity: weatherData.current.relative_humidity_2m,
        currentTime: weatherData.current.time,
        dayParts: formatDayPartForecast(weatherData.hourly),
        forecast: formatForecast(weatherData.daily),
      };

      setCurrentWeather(formattedWeather);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDayPartForecast = (hourlyData) => {
    const findHourIndex = (h) =>
      hourlyData.time.findIndex((t) => new Date(t).getHours() === h);
    const getPart = (label, index) =>
      index === -1
        ? null
        : {
            label,
            temp: Math.round(hourlyData.temperature_2m[index]),
            icon: getWeatherIcon(
              hourlyData.weather_code[index],
              hourlyData.is_day[index]
            ),
          };
    return [
      getPart("Förmiddag", findHourIndex(9)),
      getPart("Eftermiddag", findHourIndex(15)),
      getPart("Kväll", findHourIndex(21)),
      getPart("Natt", findHourIndex(3)),
    ].filter(Boolean);
  };

  const formatForecast = (dailyData) => {
    return dailyData.time.slice(0, 5).map((date, index) => ({
      date: date,
      fullDate: new Date(date).toLocaleDateString("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      icon: getWeatherIcon(dailyData.weather_code[index]),
      high: Math.round(dailyData.temperature_2m_max[index]),
      low: Math.round(dailyData.temperature_2m_min[index]),
      precipitation: dailyData.precipitation_sum[index].toFixed(1),
    }));
  };

  useEffect(() => {
    fetchWeatherData(location);
  }, [location, fetchWeatherData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm && searchTerm.toLowerCase() !== location.toLowerCase()) {
      setLocation(searchTerm);
    }
  };

  const handleDaySelect = (date) => {
    setSelectedDate((prevDate) => (prevDate === date ? null : date));
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4 font-sans transition-colors">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-slate-800 dark:text-slate-200 transition-colors">
        <Header />
        <div className="flex items-center gap-2 mb-4">
          <form
            onSubmit={handleSearch}
            className="flex-grow flex items-center gap-2"
          >
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Sök efter en stad..."
                className="w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg py-2 pl-10 pr-4 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400 dark:disabled:bg-slate-600"
              disabled={loading}
            >
              Sök
            </button>
          </form>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center h-96">
            <LoaderCircle className="animate-spin text-blue-500" size={48} />
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Hämtar väderdata...
            </p>
          </div>
        )}
        {error && !loading && (
          <p className="text-red-500 text-center my-8 h-96 flex items-center justify-center">
            {error}
          </p>
        )}
        {currentWeather && !loading && (
          <div className="animate-fade-in">
            <CurrentWeather data={currentWeather} />
            <DayPartForecast data={currentWeather.dayParts} />
            <Forecast
              data={currentWeather.forecast}
              hourlyData={hourlyForecastData}
              selectedDate={selectedDate}
              onDaySelect={handleDaySelect}
            />
            <WeatherDetails data={currentWeather} />
          </div>
        )}
      </div>
    </div>
  );
}

const CurrentWeather = ({ data }) => {
  if (!data) return null;
  const time = new Date(data.currentTime).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-2">
        <MapPin size={20} className="text-slate-500 dark:text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
          {data.location}
        </h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
        Gäller för kl. {time}
      </p>
      <div className="flex items-center justify-center gap-4">
        <div className="w-24 h-24 flex items-center justify-center">
          <WeatherIcon iconName={data.icon} size={96} />
        </div>
        <div>
          <p className="text-7xl font-extrabold text-slate-900 dark:text-white">
            {data.temp}°
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {data.condition}
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-2 text-md">
        <span>H: {data.high}°</span>
        <span>L: {data.low}°</span>
      </div>
    </div>
  );
};

const DayPartForecast = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.map((part, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center"
          >
            <p className="font-semibold text-md">{part.label}</p>
            <div className="my-2">
              <WeatherIcon iconName={part.icon} size={32} />
            </div>
            <p className="text-lg font-bold">{part.temp}°</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Forecast = ({ data, hourlyData, selectedDate, onDaySelect }) => {
  if (!data) return null;
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 px-2">5-dagarsprognos</h2>
      <div className="space-y-2">
        {data.map((day, index) => {
          const isSelected = day.date === selectedDate;
          return (
            <div
              key={index}
              className="bg-slate-100 dark:bg-slate-700/50 rounded-lg transition-all overflow-hidden"
            >
              <div
                onClick={() => onDaySelect(day.date)}
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                <div className="w-1/3 font-semibold text-sm">
                  {day.fullDate}
                </div>
                <div className="flex items-center gap-3">
                  <WeatherIcon iconName={day.icon} size={32} />
                  <div className="text-sm w-12 text-right">
                    <span className="font-bold">{day.high}°</span> /{" "}
                    <span>{day.low}°</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400 w-16 justify-end">
                  <Droplet size={14} />
                  <span className="font-semibold">{day.precipitation} mm</span>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    isSelected ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isSelected && (
                <HourlyForecastDetail
                  hourlyData={hourlyData}
                  selectedDate={day.date}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HourlyForecastDetail = ({ hourlyData, selectedDate }) => {
  const getHourlyForSelectedDay = () => {
    if (!selectedDate || !hourlyData) return [];
    const startIndex = hourlyData.time.findIndex((t) =>
      t.startsWith(selectedDate)
    );
    if (startIndex === -1) return [];
    const hourlyForDay = [];
    for (let i = startIndex; i < hourlyData.time.length; i++) {
      if (hourlyData.time[i].startsWith(selectedDate)) {
        hourlyForDay.push({
          time: hourlyData.time[i],
          temp: Math.round(hourlyData.temperature_2m[i]),
          icon: getWeatherIcon(
            hourlyData.weather_code[i],
            hourlyData.is_day[i]
          ),
          precipitation: hourlyData.precipitation[i].toFixed(1),
        });
      } else {
        break;
      }
    }
    return hourlyForDay;
  };

  const dayHours = getHourlyForSelectedDay();

  return (
    <div className="p-3 bg-slate-200 dark:bg-slate-800 animate-fade-in">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {dayHours.map((hour, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex flex-col items-center bg-white dark:bg-slate-700 p-3 rounded-lg w-24 text-center"
          >
            <p className="font-semibold text-sm">
              {new Date(hour.time).toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="my-1">
              <WeatherIcon iconName={hour.icon} size={28} />
            </div>
            <p className="font-bold text-md">{hour.temp}°</p>
            <div className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 mt-1">
              <Droplet size={12} />
              <span>{hour.precipitation} mm</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeatherDetails = ({ data }) => {
  if (!data) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 px-2">Väderdetaljer</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-center gap-3 transition-colors">
          <Wind className="text-slate-500 dark:text-slate-400" size={24} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Vind</p>
            <p className="font-bold text-lg">{data.wind} km/h</p>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-center gap-3 transition-colors">
          <Droplet className="text-slate-500 dark:text-slate-400" size={24} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Luftfuktighet
            </p>
            <p className="font-bold text-lg">{data.humidity}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
