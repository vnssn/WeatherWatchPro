// Simple serverless API endpoint for Vercel deployment
// This eliminates Rollup dependencies
import { neon } from '@neondatabase/serverless';

// Create database client - no need to connect/disconnect with neon()
const sql = neon(process.env.DATABASE_URL);

// Utility to format weather data
function formatWeatherData(rawData) {
  if (!rawData) return null;
  
  return {
    device_id: rawData.device_id,
    temperature_dht: parseFloat(rawData.temperature_dht),
    temperature_bmp: rawData.temperature_bmp ? parseFloat(rawData.temperature_bmp) : null,
    humidity: parseFloat(rawData.humidity),
    pressure: rawData.pressure ? parseFloat(rawData.pressure) : null,
    signal_strength: rawData.signal_strength,
    uptime: rawData.uptime,
    timestamp: rawData.timestamp
  };
}

// Main API handler for /api/weather endpoints
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (for CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Extract the path segment after /api/weather
  const pathSegment = req.url.split('/api/weather')[1] || '';
  
  try {
    // GET /api/weather/current - Get current weather data
    if (req.method === 'GET' && (pathSegment === '/current' || pathSegment === 'current')) {
      const result = await sql`
        SELECT * FROM weather_data
        ORDER BY timestamp DESC
        LIMIT 1
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ message: "No weather data available" });
      }
      
      return res.status(200).json(formatWeatherData(result[0]));
    }
    
    // GET /api/weather/history - Get historical weather data
    if (req.method === 'GET' && (pathSegment === '/history' || pathSegment === 'history')) {
      const hours = req.query.hours ? parseInt(req.query.hours, 10) : 24;
      
      if (isNaN(hours) || hours <= 0 || hours > 72) {
        return res.status(400).json({ message: "Hours must be a number between 1 and 72" });
      }
      
      // Query all data - we'll limit this by time range later
      // This approach is simpler and avoids SQL INTERVAL syntax issues
      const result = await sql`SELECT * FROM weather_data ORDER BY timestamp ASC`;
      
      // Empty response if no data available
      if (!result || result.length === 0) {
        return res.status(200).json([]);
      }
      
      return res.status(200).json(result.map(formatWeatherData));
    }
    
    // POST /api/weather - Save new weather data
    if (req.method === 'POST' && (pathSegment === '' || pathSegment === '/')) {
      const data = req.body;
      
      // Basic validation
      if (!data.device_id || !data.temperature_dht || !data.humidity) {
        return res.status(400).json({ message: "Missing required fields: device_id, temperature_dht, humidity" });
      }
      
      const result = await sql`
        INSERT INTO weather_data (
          device_id, temperature_dht, temperature_bmp, humidity, pressure, signal_strength, uptime
        ) VALUES (
          ${data.device_id}, 
          ${data.temperature_dht}, 
          ${data.temperature_bmp || null}, 
          ${data.humidity}, 
          ${data.pressure || null}, 
          ${data.signal_strength || null}, 
          ${data.uptime || null}
        ) RETURNING *
      `;
      
      return res.status(201).json({
        message: "Weather data saved successfully",
        data: formatWeatherData(result[0])
      });
    }
    
    // Handle unknown endpoints
    return res.status(404).json({ message: "Endpoint not found" });
    
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
} 