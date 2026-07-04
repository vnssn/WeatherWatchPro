import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConnectionStatus from "@/components/ConnectionStatus";
import ReadingCard from "@/components/ReadingCard";
import GaugeDisplay from "@/components/GaugeDisplay";
import HistoryChart from "@/components/HistoryChart";
import WeatherIndicator from "@/components/WeatherIndicator";
import DeviceInfo from "@/components/DeviceInfo";
import { extractHistoricalData, getTimeAgo, interpretWeatherData } from "@/lib/utils.js";
import { ThermometerIcon, Droplets, GaugeIcon, CircleOff } from "lucide-react";

export default function Dashboard() {
  // Fetch latest weather data
  const { data: latestData, isLoading, isError } = useQuery({
    queryKey: ['/api/weather/latest'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Fetch historical data
  const { data: historicalDataRaw } = useQuery({
    queryKey: ['/api/weather/history'],
    refetchInterval: 60000 // Refetch every minute
  });

  const [historicalData, setHistoricalData] = useState({
    temperatureDHT: [],
    temperatureBMP: [],
    humidity: [],
    pressure: []
  });

  const [weatherInterpretation, setWeatherInterpretation] = useState({
    comfort: { level: 'Unknown', description: 'Waiting for data...' },
    humidityStatus: { status: 'Unknown', description: 'Waiting for data...' },
    pressureTrend: { trend: 'Unknown', description: 'Waiting for data...' },
    weatherIndication: { indication: 'Unknown', description: 'Waiting for data...' }
  });

  const [lastUpdate, setLastUpdate] = useState('Never');

  // Update historical data when raw data changes
  useEffect(() => {
    if (historicalDataRaw && historicalDataRaw.length > 0) {
      setHistoricalData(extractHistoricalData(historicalDataRaw));
    }
  }, [historicalDataRaw]);

  // Update weather interpretation when latest data changes
  useEffect(() => {
    if (latestData) {
      setWeatherInterpretation(interpretWeatherData(latestData));
      setLastUpdate(getTimeAgo(latestData.timestamp));
    }
  }, [latestData]);

  // Refresh last update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (latestData) {
        setLastUpdate(getTimeAgo(latestData.timestamp));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [latestData]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Connection Status */}
        <ConnectionStatus 
          isConnected={!isError && !!latestData} 
          lastUpdate={lastUpdate} 
        />

        {/* Current Readings */}
        <h2 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-6">Current Readings</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-card rounded-lg shadow-md p-6 mb-8 text-center border-red-100 dark:border-red-900">
            <CircleOff className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-medium text-foreground mb-2">Unable to load sensor data</h3>
            <p className="text-muted-foreground">
              Please check your connection to the ESP8266 device or ensure it's powered on and connected to the network.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ReadingCard 
              title="Temperature (DHT11)"
              value={latestData?.temperatureDHT}
              unit="°C"
              description="Primary temperature sensor"
              icon={<ThermometerIcon className="text-amber-500" />}
              colorBasedOnValue={true}
            />
            
            <ReadingCard 
              title="Temperature (BMP180)"
              value={latestData?.temperatureBMP}
              unit="°C"
              description="Secondary temperature sensor"
              icon={<ThermometerIcon className="text-cyan-500" />}
              colorBasedOnValue={true}
            />
            
            <ReadingCard 
              title="Humidity"
              value={latestData?.humidity}
              unit="%"
              description="Relative humidity"
              icon={<Droplets className="text-blue-500" />}
            />
            
            <ReadingCard 
              title="Pressure"
              value={latestData?.pressure}
              unit="hPa"
              description="Atmospheric pressure"
              icon={<GaugeIcon className="text-primary" />}
            />
          </div>
        )}

        {/* Gauges Section */}
        <h2 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-6">Sensor Visualizations</h2>
        <div className="bg-card rounded-lg shadow-lg p-6 mb-8 border-blue-100 dark:border-blue-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <GaugeDisplay 
              title="Temperature (DHT11)"
              value={latestData?.temperatureDHT ?? 0}
              min={0}
              max={50}
              suffix="°C"
              color="from-blue-500 to-red-500"
            />
            
            <GaugeDisplay 
              title="Temperature (BMP180)"
              value={latestData?.temperatureBMP ?? 0}
              min={0}
              max={50}
              suffix="°C"
              color="from-cyan-500 to-amber-500"
            />
            
            <GaugeDisplay 
              title="Humidity"
              value={latestData?.humidity ?? 0}
              min={0}
              max={100}
              suffix="%"
              color="from-blue-300 to-blue-600"
            />
            
            <GaugeDisplay 
              title="Pressure"
              value={latestData?.pressure ?? 1000}
              min={980}
              max={1040}
              suffix="hPa"
              color="from-indigo-500 to-purple-600"
            />
          </div>
        </div>

        {/* Historical Data Section */}
        <h2 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-6">24-Hour History</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HistoryChart 
            title="Temperature History"
            datasets={[
              {
                label: "DHT11 Temperature (°C)",
                data: historicalData.temperatureDHT,
                borderColor: "#FF9800",
                backgroundColor: "rgba(255, 152, 0, 0.1)",
              },
              {
                label: "BMP180 Temperature (°C)",
                data: historicalData.temperatureBMP,
                borderColor: "#00BCD4",
                backgroundColor: "rgba(0, 188, 212, 0.1)",
              }
            ]}
          />
          
          <HistoryChart 
            title="Humidity & Pressure History"
            datasets={[
              {
                label: "Humidity (%)",
                data: historicalData.humidity,
                borderColor: "#29B6F6",
                backgroundColor: "rgba(41, 182, 246, 0.1)",
                yAxisID: "y"
              },
              {
                label: "Pressure (hPa)",
                data: historicalData.pressure,
                borderColor: "#1E88E5",
                backgroundColor: "rgba(30, 136, 229, 0.1)",
                yAxisID: "y1"
              }
            ]}
            dualAxis={true}
            y1Min={980}
            y1Max={1040}
          />
        </div>

        {/* Weather Information */}
        <h2 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-6">Weather Interpretation</h2>
        <div className="bg-card rounded-lg shadow-lg p-6 mb-8 border-green-100 dark:border-green-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <WeatherIndicator 
              title="Comfort Level"
              value={weatherInterpretation.comfort.level}
              description={weatherInterpretation.comfort.description}
              icon="thermostat"
              color="text-primary"
            />
            
            <WeatherIndicator 
              title="Humidity Status"
              value={weatherInterpretation.humidityStatus.status}
              description={weatherInterpretation.humidityStatus.description}
              icon="water_drop"
              color="text-blue-500"
            />
            
            <WeatherIndicator 
              title="Pressure Trend"
              value={weatherInterpretation.pressureTrend.trend}
              description={weatherInterpretation.pressureTrend.description}
              icon="trending_up"
              color="text-primary"
            />
            
            <WeatherIndicator 
              title="Weather Indication"
              value={weatherInterpretation.weatherIndication.indication}
              description={weatherInterpretation.weatherIndication.description}
              icon="wb_sunny"
              color="text-amber-500"
            />
          </div>
        </div>

        {/* Device Information */}
        <h2 className="text-2xl font-bold text-foreground dark:text-gray-100 mb-6">Device Information</h2>
        <div className="bg-card rounded-lg shadow-lg p-6 border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DeviceInfo 
              title="Device ID"
              value={latestData?.deviceId || "Unknown"}
            />
            
            <DeviceInfo 
              title="Uptime"
              value={latestData?.uptime ? `${latestData.uptime} seconds` : "Unknown"}
            />
            
            <DeviceInfo 
              title="Signal Strength"
              value={latestData?.signalStrength ? `${latestData.signalStrength} dBm` : "Unknown"}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 