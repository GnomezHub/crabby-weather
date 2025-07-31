import { Droplet } from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import getWeatherIcon from "./getWeatherIcon";
import { useCallback } from "react";

const HourlyForecastDetail = ({ hourlyData, selectedDate }) => {
  const getHourlyForSelectedDay = useCallback(() => {
    if (!selectedDate || !hourlyData) return [];
    const startIndex = hourlyData.time.findIndex((t) =>
      t.startsWith(selectedDate)
    );
    if (startIndex === -1) return [];
    let hourlyForDay = [];
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

    // Kontrollera om den valda dagen är idag
    const today = new Date();
    const selected = new Date(selectedDate);
    const isToday = today.toDateString() === selected.toDateString();

    // Om det är idag, filtrera bort passerade timmar
    if (isToday) {
      const now = new Date();
      hourlyForDay = hourlyForDay.filter((hour) => new Date(hour.time) >= now);
    }
    return hourlyForDay;
  }, [hourlyData, selectedDate]);

  const dayHours = getHourlyForSelectedDay();

  return (
    <div className="p-3 bg-slate-200/70 dark:bg-slate-800/70">
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
export default HourlyForecastDetail;
