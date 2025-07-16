import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Moon,
  CloudFog,
} from "lucide-react";

// --- Komponent för väderikon ---
const WeatherIcon = ({ iconName, size = 48 }) => {
  const iconMap = {
    sun: <Sun size={size} className="text-yellow-400" />,
    moon: <Moon size={size} className="text-slate-400" />,
    cloud: <Cloud size={size} className="text-slate-400" />,
    fog: <CloudFog size={size} className="text-slate-500" />,
    rain: <CloudRain size={size} className="text-blue-400" />,
    snow: <CloudSnow size={size} className="text-blue-200" />,
    storm: <CloudLightning size={size} className="text-yellow-300" />,
  };
  return iconMap[iconName] || <Sun size={size} className="text-yellow-400" />;
};
export default WeatherIcon;
