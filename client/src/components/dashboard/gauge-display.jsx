import { Skeleton } from "@/components/ui/skeleton";
import { Gauge } from "@/components/ui/gauge";

export default function GaugeDisplay({ type, value, min, max, label, unit, isLoading }) {
  // Determine color gradient based on type
  const getColorGradient = () => {
    switch (type) {
      case "temperature_dht":
        return "linear-gradient(90deg, #FF9800, #FFCC80)";
      case "temperature_bmp":
        return "linear-gradient(90deg, #00BCD4, #80DEEA)";
      case "humidity":
        return "linear-gradient(90deg, #29B6F6, #81D4FA)";
      case "pressure":
        return "linear-gradient(90deg, #1E88E5, #64B5F6)";
      default:
        return "linear-gradient(90deg, #1E88E5, #64B5F6)";
    }
  };

  return (
    <div className="flex flex-col items-center">
      {isLoading || typeof value === 'undefined' ? (
        <div className="flex flex-col items-center">
          <Skeleton className="h-[120px] w-[160px] rounded-t-full" />
          <Skeleton className="h-4 w-24 mt-6" />
        </div>
      ) : (
        <Gauge
          value={value}
          min={min}
          max={max}
          label={label}
          unit={unit}
          color={getColorGradient()}
        />
      )}
    </div>
  );
} 