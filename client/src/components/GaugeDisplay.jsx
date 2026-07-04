import { useEffect, useRef } from "react";

export default function GaugeDisplay({ 
  title, 
  value, 
  min, 
  max, 
  suffix,
  color = "from-blue-500 to-red-500"
}) {
  const gaugeRef = useRef(null);
  const valueRef = useRef(null);

  useEffect(() => {
    if (gaugeRef.current) {
      // Calculate rotation (0 to 180 degrees)
      const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
      const rotation = percentage * 180;
      
      // Update gauge fill rotation
      gaugeRef.current.style.transform = `rotate(${rotation}deg)`;
    }

    if (valueRef.current) {
      // Update text value
      valueRef.current.textContent = value ? `${Number(value.toFixed(1))}${suffix}` : `${min}${suffix}`;
    }
  }, [value, min, max, suffix]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[120px] w-[160px] mx-auto mb-4">
        {/* Gauge background */}
        <div className="absolute rounded-t-full h-[80px] w-[160px] bg-gray-200 dark:bg-gray-700"></div>
        
        {/* Gauge fill */}
        <div 
          ref={gaugeRef}
          className={`absolute rounded-t-full h-[80px] w-[160px] bg-gradient-to-r ${color} origin-bottom transform rotate-0 transition-transform duration-1000 ease-out`}
        ></div>
        
        {/* Gauge value */}
        <div 
          ref={valueRef}
          className="absolute w-full text-center bottom-0 text-2xl font-medium text-foreground"
        >
          {value ? `${Number(value.toFixed(1))}${suffix}` : `${min}${suffix}`}
        </div>
        
        {/* Gauge label */}
        <div className="absolute w-full text-center bottom-[-25px] text-sm font-normal text-muted-foreground">
          {title}
        </div>
      </div>
    </div>
  );
} 