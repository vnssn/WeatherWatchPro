import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer } from "lucide-react";

export default function TemperatureCard({ sensor, temperature, isLoading, sensorType = "primary" }) {
  const colorClass = sensorType === "primary" ? "text-[#FF9800]" : "text-[#00BCD4]";
  const sensorDescription = sensorType === "primary" ? "Primary temperature sensor" : "Secondary temperature sensor";

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Temperature ({sensor})</h3>
          <Thermometer className={colorClass} />
        </div>
      </div>
      <div className="px-4 py-6 flex flex-col items-center bg-gray-50 dark:bg-gray-900">
        {isLoading || typeof temperature === 'undefined' ? (
          <Skeleton className="h-10 w-28 mb-1" />
        ) : (
          <div className={`text-4xl font-bold ${colorClass} mb-1`}>
            {temperature.toFixed(1)}°C
          </div>
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400">{sensorDescription}</div>
      </div>
    </Card>
  );
} 