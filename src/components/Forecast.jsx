
import {
  Droplet,
  ChevronDown,
} from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import HourlyForecastDetail from "./HourlyForecastDetail";

export default function Forecast ({ data, hourlyData, selectedDate, onDaySelect }) {
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
              className="bg-slate-100 dark:bg-slate-700/50 rounded-lg transition-all duration-500"
            >
              <div
                onClick={() => onDaySelect(day.date)}
                className="flex rounded-lg items-center justify-between p-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600"
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
                  className={`transition-transform duration-300 ${
                    isSelected ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div
                className={`transition-all duration-500 ease-in-out grid ${
                  isSelected
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <HourlyForecastDetail
                    hourlyData={hourlyData}
                    selectedDate={day.date}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};