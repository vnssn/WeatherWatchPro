import { Skeleton } from "@/components/ui/skeleton";

export default function DeviceInfo({ type, value, isLoading }) {
  // Determine label based on type
  const getLabel = () => {
    switch (type) {
      case "id":
        return "Device ID";
      case "uptime":
        return "Uptime";
      case "signal":
        return "Signal Strength";
      default:
        return "Info";
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{getLabel()}</div>
      {isLoading ? (
        <Skeleton className="h-5 w-32" />
      ) : (
        <div className="font-medium text-gray-800 dark:text-gray-200">{value}</div>
      )}
    </div>
  );
} 