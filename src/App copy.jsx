import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Sun,
  LoaderCircle,
  Moon,
} from "lucide-react";
import Header from "./components/Header";
import getWeatherIcon from "./components/getWeatherIcon";
import Forecast from "./components/Forecast";
import {
  CurrentWeather,
  DayPartForecast,
  WeatherDetails,
} from "./components/CurrentDayStuff";

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

export default function App() {
  const [location, setLocation] = useState("Malmö");
  const [searchTerm, setSearchTerm] = useState("Malmö");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyForecastData, setHourlyForecastData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");

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
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&wind_speed_unit=ms&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,is_day,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
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
        wind: weatherData.current.wind_speed_10m,
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
      getPart("Fm", findHourIndex(9)),
      getPart("Em", findHourIndex(15)),
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
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4 font-sans transition-colors transition-duration-500">
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-slate-800 dark:text-slate-200 transition-colors">
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
        <Header />
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
