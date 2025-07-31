import {
  MapPin,
  Wind,
  Droplet,
} from "lucide-react";
import WeatherIcon from "./WeatherIcon";

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
      <div className="grid grid-cols-4 gap-2">
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


const WeatherDetails = ({ data }) => {
  if (!data) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 px-2">Väderdetaljer</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-center gap-3 transition-colors">
          <Wind className="text-slate-500 dark:text-slate-400 min-w-4" size={24} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Vind</p>
            <p className="font-bold text-lg">{data.wind} m/s</p>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-center gap-3 transition-colors">
          <Droplet className="text-slate-500 dark:text-slate-400 min-w-4" size={24} />
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

export { CurrentWeather, DayPartForecast, WeatherDetails };