import { useEffect, useState } from "react";

export default function Header() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Update time and date immediately
    updateDateTime();
    
    // Update time every second
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  function updateDateTime() {
    const now = new Date();
    
    // Format time as HH:MM:SS
    setCurrentTime(now.toLocaleTimeString());
    
    // Format date as Day, Month Date, Year
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString(undefined, options));
  }

  return (
    <header className="bg-primary-dark dark:bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-3 md:mb-0">
          <span className="material-icons text-4xl mr-2">storm</span>
          <h1 className="text-2xl font-bold">ESP8266 Weather Station</h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xl font-medium">{currentTime}</div>
          <div className="text-sm opacity-90">{currentDate}</div>
        </div>
      </div>
    </header>
  );
} 