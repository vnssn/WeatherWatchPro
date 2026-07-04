// This script simulates an ESP8266 sending weather data to the server
// Run with: node simulate_esp8266.js [server_url]

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuration
const SERVER_URL = process.argv[2] || 'http://localhost:5000/api/weather';
const INTERVAL_SECONDS = 30;
const DEVICE_ID = 'ESP8266-SIM';

// Time tracking
let uptime = 0;

// Function to generate random sensor readings with slight variations
function generateReadings() {
  // Base values
  const baseTempDHT = 23.5;
  const baseTempBMP = 23.2;
  const baseHumidity = 55;
  const basePressure = 1013.25;
  
  // Add small random variations
  return {
    temperature_dht: baseTempDHT + (Math.random() * 2 - 1),
    temperature_bmp: baseTempBMP + (Math.random() * 2 - 1),
    humidity: baseHumidity + (Math.random() * 10 - 5),
    pressure: basePressure + (Math.random() * 2 - 1),
  };
}

// Format uptime
function formatUptime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} days, ${hours % 24} hours`;
  } else if (hours > 0) {
    return `${hours} hours, ${minutes % 60} minutes`;
  } else {
    return `${minutes} minutes, ${seconds % 60} seconds`;
  }
}

// Function to send data to the server
async function sendData() {
  try {
    // Generate sensor readings
    const readings = generateReadings();
    
    // Prepare data payload
    const data = {
      device_id: DEVICE_ID,
      ...readings,
      signal_strength: -60 - Math.floor(Math.random() * 30),
      uptime: formatUptime(uptime)
    };
    
    console.log('Sending data:', data);
    
    // Send data to server
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log('Server response:', response.status, result);
  } catch (error) {
    console.error('Error sending data:', error);
  }
  
  // Increment uptime
  uptime += INTERVAL_SECONDS;
}

// Send data immediately, then at regular intervals
console.log(`Starting ESP8266 simulator, sending data to ${SERVER_URL} every ${INTERVAL_SECONDS} seconds...`);
sendData();
setInterval(sendData, INTERVAL_SECONDS * 1000);