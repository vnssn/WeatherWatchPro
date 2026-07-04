import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gauge } from "lucide-react";

export default function PressureCard({ pressure, isLoading }) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Pressure</h3>
          <Gauge className="text-purple-500" />
        </div>
      </div>
      <div className="px-4 py-6 flex flex-col items-center bg-gray-50 dark:bg-gray-900">
        {isLoading || typeof pressure === 'undefined' ? (
          <Skeleton className="h-10 w-36 mb-1" />
        ) : (
          <div className="text-4xl font-bold text-purple-500 mb-1">
            {pressure.toFixed(2)} hPa
          </div>
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400">Atmospheric pressure</div>
      </div>
    </Card>
  );
} 