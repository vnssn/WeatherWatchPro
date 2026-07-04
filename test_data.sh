#!/bin/bash

# Get the server URL from command-line argument or use default
SERVER_URL=${1:-"http://localhost:5000/api/weather"}

echo "Sending test data to $SERVER_URL"

# Send a POST request with test weather data
curl -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP8266-TEST",
    "temperature_dht": 24.5,
    "temperature_bmp": 24.2,
    "humidity": 55.5,
    "pressure": 1013.25,
    "signal_strength": -65,
    "uptime": "1 hour, 25 minutes"
  }'

echo -e "\n\nSent test data. Check your dashboard to see if it appears."