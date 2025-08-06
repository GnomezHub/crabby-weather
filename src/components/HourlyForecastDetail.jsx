import { Droplet, ChevronLeft, ChevronRight } from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import getWeatherIcon from "./getWeatherIcon";
import { useCallback, useState, useEffect, useRef } from "react";

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

  const scrollContainerRef = useRef(null); // Ref for the scrollable container
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Effect to update arrow visibility when dayHours or component mounts
  useEffect(() => {
    const checkArrows = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
      }
    };

    // Initial check and add event listener for scroll
    checkArrows();
    const currentRef = scrollContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkArrows);
    }

    // Cleanup event listener
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkArrows);
      }
    };
  }, []);

  const scrollHorizontally = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth; // Scroll by the width of the container
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const dayHours = getHourlyForSelectedDay();

  return (
    <div className=" p-3 bg-slate-200/70 dark:bg-slate-800/70">
      <div className="relative flex items-center">
        {showLeftArrow && (
          <button
            onClick={() => scrollHorizontally("left")} // w-12 h-full
            className="hidden md:block absolute left-0 z-10 p-2 bg-white dark:bg-slate-700 rounded-full
            shadow-md opacity-70 hover:opacity-100 border-2 border-gray-500/70 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Scrolla vänster"
          >
            <ChevronLeft
              size={24}
              className="text-gray-700 dark:text-gray-200"
            />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex space-x-4 md:overflow-x-hidden overflow-x-auto pb-2 "
        >
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

        {showRightArrow && (
          <button
            onClick={() => scrollHorizontally("right")}
            className="hidden md:block absolute right-0 z-10 p-2 bg-white dark:bg-slate-700 rounded-full
             shadow-md opacity-70 border-2 border-gray-500/70 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Scrolla höger"
          >
            <ChevronRight
              size={24}
              className="text-gray-700 dark:text-gray-200"
            />
          </button>
        )}
      </div>
    </div>
  );
};
export default HourlyForecastDetail;
