import { cn } from "@/lib/utils.js"
import React, { useEffect, useRef } from "react"

function Gauge({ value, min, max, label, unit, color, className, ...props }) {
  const gaugeRef = useRef(null)
  const valueTextRef = useRef(null)

  useEffect(() => {
    if (gaugeRef.current) {
      // Calculate rotation (0 to 180 degrees)
      const percentage = (value - min) / (max - min)
      const rotation = percentage * 180
      
      // Update gauge needle rotation
      gaugeRef.current.style.transform = `rotate(${rotation}deg)`
    }

    if (valueTextRef.current) {
      valueTextRef.current.textContent = `${Number(value).toFixed(1)}${unit}`
    }
  }, [value, min, max, unit])

  return (
    <div className={cn("relative w-32 h-32 flex flex-col items-center", className)} {...props}>
      {/* Gauge dial background */}
      <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-t-full overflow-hidden">
        <div
          className="w-full h-full absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-red-500 rounded-t-full origin-bottom opacity-30"
          style={{ background: color }}
        />
      </div>
      
      {/* Gauge needle */}
      <div className="relative w-full">
        <div 
          ref={gaugeRef}
          className="absolute left-1/2 bottom-0 w-1 h-16 bg-gray-800 dark:bg-gray-100 origin-bottom transform -translate-x-1/2 transition-transform duration-500"
        />
      </div>
      
      {/* Value and label display */}
      <div className="mt-2 text-center">
        <div ref={valueTextRef} className="text-xl font-bold">
          {value.toFixed(1)}{unit}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  )
}

export { Gauge } 