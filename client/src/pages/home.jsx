import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/dashboard/header";
import Footer from "@/components/dashboard/footer";
import ConnectionStatus from "@/components/dashboard/connection-status";
import TemperatureCard from "@/components/dashboard/temperature-card";
import HumidityCard from "@/components/dashboard/humidity-card";
import PressureCard from "@/components/dashboard/pressure-card";
import GaugeDisplay from "@/components/dashboard/gauge-display";
import HistoryChart from "@/components/dashboard/history-chart";
import WeatherIndicator from "@/components/dashboard/weather-indicator";
import DeviceInfo from "@/components/dashboard/device-info";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Thermometer, Droplets, Gauge, Info, Signal, Clock, RefreshCw } from "lucide-react";

export default function Home() {
  // Fetch latest weather data
  const { data: currentData, isLoading: isLoadingCurrent, refetch: refetchCurrent, isFetching: isRefreshingCurrent } = useQuery({
    queryKey: ['/api/weather/current'],
  });

  // Fetch historical weather data
  const { data: historicalData, isLoading: isLoadingHistory, isFetching: isRefreshingHistory } = useQuery({
    queryKey: ['/api/weather/history'],
  });

  const [lastUpdate, setLastUpdate] = useState(null);

  // Update lastUpdate time when we get new data
  useEffect(() => {
    if (currentData) {
      setLastUpdate(new Date());
    }
  }, [currentData]);
  
  // No sensor reading indicator
  const noSensorData = !currentData || isLoadingCurrent;

  // Calculate comfort level based on temperature and humidity
  const getComfortLevel = () => {
    if (!currentData) return "Unknown";
    
    const temp = Number(currentData.temperature_dht);
    const humidity = Number(currentData.humidity);
    
    if (temp < 18) return "Cold";
    if (temp > 28) return "Hot";
    if (humidity < 30) return "Dry";
    if (humidity > 70) return "Humid";
    return "Comfortable";
  };

  // Get humidity status text
  const getHumidityStatus = () => {
    if (!currentData) return "Unknown";
    
    const humidity = Number(currentData.humidity);
    
    if (humidity < 30) return "Very Dry";
    if (humidity < 40) return "Dry";
    if (humidity < 60) return "Normal";
    if (humidity < 70) return "Humid";
    return "Very Humid";
  };

  // Get pressure trend based on latest readings
  const getPressureTrend = () => {
    if (!historicalData || historicalData.length < 2) return "Unknown";
    
    const latest = historicalData[historicalData.length - 1].pressure ? Number(historicalData[historicalData.length - 1].pressure) : 0;
    const previous = historicalData[historicalData.length - 2].pressure ? Number(historicalData[historicalData.length - 2].pressure) : 0;
    
    if (Math.abs(latest - previous) < 1) return "Stable";
    return latest > previous ? "Rising" : "Falling";
  };

  // Get weather indication based on pressure and trend
  const getWeatherIndication = () => {
    if (!currentData || !currentData.pressure) return "Unknown";
    
    const pressure = Number(currentData.pressure);
    const trend = getPressureTrend();
    
    if (pressure > 1022 && trend === "Rising") return "Clear Weather";
    if (pressure > 1022 && trend === "Falling") return "Clear, Changing";
    if (pressure > 1009 && pressure <= 1022 && trend === "Rising") return "Fair Weather";
    if (pressure > 1009 && pressure <= 1022 && trend === "Falling") return "Possible Rain";
    if (pressure <= 1009 && trend === "Rising") return "Clearing";
    if (pressure <= 1009 && trend === "Falling") return "Rain Likely";
    
    return "Moderate Conditions";
  };

  // Get weather icon based on indication
  const getWeatherIcon = () => {
    const weather = getWeatherIndication();
    
    if (weather.includes("Clear")) return <Sun className="h-8 w-8 text-yellow-500" />;
    if (weather.includes("Rain")) return <CloudRain className="h-8 w-8 text-blue-500" />;
    return <Cloud className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Connection Status with Auto-refresh Indicator */}
        <div className="flex items-center justify-between mb-6">
          <ConnectionStatus 
            isConnected={!!currentData && !isLoadingCurrent}
            lastUpdate={lastUpdate}
          />
          <div className="flex items-center gap-2 text-sm">
            <span className={`${isRefreshingCurrent || isRefreshingHistory ? 'text-blue-500' : 'text-gray-400'}`}>
              Auto-refreshing
            </span>
            <RefreshCw 
              className={`h-4 w-4 ${isRefreshingCurrent || isRefreshingHistory ? 'animate-spin text-blue-500' : 'text-gray-400'}`} 
            />
            <button 
              onClick={() => {
                refetchCurrent();
                setLastUpdate(new Date());
              }}
              className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">WeatherWatchPro Dashboard</h1>
              <p className="text-blue-100 max-w-md">
                Real-time weather monitoring with ESP8266, DHT11, and BMP180 sensors.
                Updated {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'recently'}.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getWeatherIcon()}
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {currentData?.temperature_dht ? `${Number(currentData.temperature_dht).toFixed(1)}°C` : '--°C'}
                </div>
                <div className="text-blue-100">{getWeatherIndication()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Readings */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Current Readings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TemperatureCard 
            sensor="DHT11" 
            temperature={currentData?.temperature_dht ? Number(currentData.temperature_dht) : undefined} 
            isLoading={isLoadingCurrent} 
          />
          <TemperatureCard 
            sensor="BMP180" 
            temperature={currentData?.temperature_bmp ? Number(currentData.temperature_bmp) : undefined} 
            isLoading={isLoadingCurrent} 
            sensorType="secondary"
          />
          <HumidityCard 
            humidity={currentData?.humidity ? Number(currentData.humidity) : undefined} 
            isLoading={isLoadingCurrent} 
          />
          <PressureCard 
            pressure={currentData?.pressure ? Number(currentData.pressure) : undefined} 
            isLoading={isLoadingCurrent} 
          />
        </div>

        {/* Gauges Section */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Sensor Visualizations</h2>
        <Card className="p-6 mb-8 shadow-lg border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <GaugeDisplay
              type="temperature_dht"
              value={currentData?.temperature_dht ? Number(currentData.temperature_dht) : undefined}
              min={0}
              max={50}
              label="Temperature (DHT11)"
              unit="°C"
              isLoading={isLoadingCurrent}
            />
            <GaugeDisplay
              type="temperature_bmp"
              value={currentData?.temperature_bmp ? Number(currentData.temperature_bmp) : undefined}
              min={0}
              max={50}
              label="Temperature (BMP180)"
              unit="°C"
              isLoading={isLoadingCurrent}
            />
            <GaugeDisplay
              type="humidity"
              value={currentData?.humidity ? Number(currentData.humidity) : undefined}
              min={0}
              max={100}
              label="Humidity"
              unit="%"
              isLoading={isLoadingCurrent}
            />
            <GaugeDisplay
              type="pressure"
              value={currentData?.pressure ? Number(currentData.pressure) : undefined}
              min={980}
              max={1040}
              label="Pressure"
              unit="hPa"
              isLoading={isLoadingCurrent}
            />
          </div>
        </Card>

        {/* Historical Data Section */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">24-Hour History</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HistoryChart
            type="temperature"
            data={historicalData || []}
            isLoading={isLoadingHistory}
          />
          <HistoryChart
            type="humidity_pressure"
            data={historicalData || []}
            isLoading={isLoadingHistory}
          />
        </div>

        {/* Weather Information */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Weather Interpretation</h2>
        <Card className="p-6 mb-8 shadow-lg border-green-100 dark:border-green-900 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <WeatherIndicator
              type="comfort"
              value={getComfortLevel()}
              isLoading={isLoadingCurrent}
            />
            <WeatherIndicator
              type="humidity_status"
              value={getHumidityStatus()}
              isLoading={isLoadingCurrent}
            />
            <WeatherIndicator
              type="pressure_trend"
              value={getPressureTrend()}
              isLoading={isLoadingHistory}
            />
            <WeatherIndicator
              type="forecast"
              value={getWeatherIndication()}
              isLoading={isLoadingCurrent || isLoadingHistory}
            />
          </div>
        </Card>

        {/* ESP8266 Info Section */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Device Information</h2>
        <Card className="p-6 shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DeviceInfo
              type="id"
              value={currentData?.device_id || "Unknown"}
              isLoading={isLoadingCurrent}
            />
            <DeviceInfo
              type="uptime"
              value={currentData?.uptime || "Unknown"}
              isLoading={isLoadingCurrent}
            />
            <DeviceInfo
              type="signal"
              value={currentData?.signal_strength ? `${currentData.signal_strength} dBm` : "Unknown"}
              isLoading={isLoadingCurrent}
            />
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
} 