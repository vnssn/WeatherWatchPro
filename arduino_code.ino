#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>
#include <Adafruit_SH110X.h>
#include <DHT.h>
#include <WiFiClient.h>

// === WiFi configuration ===
const char* ssid = "wpa";     // Replace with your WiFi SSID
const char* password = "1234567890"; // Replace with your WiFi password

// === Server configuration ===
// Important: This URL must match your latest deployed Vercel URL
const char* serverUrl = "https://weatherwatchpro-lkqrb2gq4-webrookie0s-projects.vercel.app/api/weather";

// === Pin configuration ===
#define DHTPIN D5        // GPIO14 on ESP8266
#define DHTTYPE DHT11
#define OLED_I2C_ADDRESS 0x3C  // Most SH1106 OLEDs use 0x3C

// === Sensor objects ===
DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);
Adafruit_SH1106G display = Adafruit_SH1106G(128, 64, &Wire, -1);  // -1 means no reset pin

// === Device information ===
const char* deviceId = "ESP8266-WS001";  // Unique identifier for this device
unsigned long bootTime;                   // Store boot time for uptime calculation
bool bmp_available = false;

// === Other variables ===
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000; // Send data every 30 seconds
unsigned long lastDisplayTime = 0;
const unsigned long displayInterval = 2000; // Update display every 2 seconds
bool isSending = false; // Flag to prevent multiple sends at once

WiFiClient client;
HTTPClient http;

void setup() {
  Serial.begin(115200);
  delay(100);  // Let Serial stabilize

  // Initialize I2C with custom pins (D2 = SDA, D1 = SCL)
  Wire.begin(D2, D1);
  delay(100);  // Let I2C stabilize

  // Record boot time
  bootTime = millis();

  // === Initialize OLED Display ===
  if (!display.begin(OLED_I2C_ADDRESS, true)) {
    Serial.println("OLED initialization failed. Check wiring and address!");
    while (1);  // Halt
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SH110X_WHITE);
  display.setCursor(0, 0);
  display.println("Weather Station");
  display.println("Initializing...");
  display.display();
  delay(1000);

  // === Initialize DHT Sensor ===
  dht.begin();
  display.println("DHT11 initialized");
  display.display();

  // === Initialize BMP180 Sensor ===
  if (!bmp.begin()) {
    bmp_available = false;
    Serial.println("BMP180 not found.");
    display.println("BMP180 not found!");
  } else {
    bmp_available = true;
    Serial.println("BMP180 initialized.");
    display.println("BMP180 initialized");
  }
  display.display();
  delay(1000);

  // === Connect to WiFi ===
  display.println("Connecting to WiFi...");
  display.display();
  
  WiFi.begin(ssid, password);
  
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: " + WiFi.localIP().toString());
    
    display.println("WiFi connected!");
    display.println(WiFi.localIP().toString());
  } else {
    Serial.println("");
    Serial.println("WiFi connection failed");
    
    display.println("WiFi connection failed!");
  }
  
  display.display();
  delay(2000);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Update the display more frequently than sending data
  if (currentMillis - lastDisplayTime >= displayInterval) {
    lastDisplayTime = currentMillis;
    readAndDisplaySensorData();
  }
  
  // Check if it's time to send data to the server and not already sending
  if (!isSending && currentMillis - lastSendTime >= sendInterval) {
    isSending = true; // Set flag to prevent multiple sends
    lastSendTime = currentMillis;
    sendDataToServer();
    isSending = false; // Clear flag after send complete
  }
  
  // Keep the main loop running without long delays
  delay(100);
}

void readAndDisplaySensorData() {
  // Read DHT11 values
  float humidity = dht.readHumidity();
  float temp_dht = dht.readTemperature();

  // Initialize BMP180 values
  float temp_bmp = NAN;
  float pressure = NAN;

  if (bmp_available) {
    sensors_event_t event;
    bmp.getEvent(&event);
    if (!isnan(event.pressure)) {
      pressure = event.pressure;
      bmp.getTemperature(&temp_bmp);
    } else {
      Serial.println("Failed to read pressure from BMP180.");
    }
  }

  // Display data
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Weather Station:");

  display.print("Temp (DHT): ");
  display.print(temp_dht);
  display.println(" C");

  display.print("Humidity: ");
  display.print(humidity);
  display.println(" %");

  if (!isnan(temp_bmp)) {
    display.print("Temp (BMP): ");
    display.print(temp_bmp);
    display.println(" C");
  } else {
    display.println("BMP Temp: N/A");
  }

  if (!isnan(pressure)) {
    display.print("Pressure: ");
    display.print(pressure);
    display.println(" hPa");
  } else {
    display.println("Pressure: N/A");
  }

  // Display WiFi status
  display.print("WiFi: ");
  display.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  
  display.display();
}

void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Attempting to reconnect...");
    WiFi.begin(ssid, password);
    
    // Wait up to 5 seconds for reconnection
    int reconnectAttempts = 0;
    while (WiFi.status() != WL_CONNECTED && reconnectAttempts < 10) {
      delay(500);
      Serial.print(".");
      reconnectAttempts++;
    }
    
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi reconnection failed. Cannot send data.");
      return;
    } else {
      Serial.println("WiFi reconnected!");
    }
  }
  
  // Read sensor data
  float humidity = dht.readHumidity();
  float temp_dht = dht.readTemperature();
  
  // Initialize BMP180 values
  float temp_bmp = NAN;
  float pressure = NAN;
  
  if (bmp_available) {
    sensors_event_t event;
    bmp.getEvent(&event);
    if (!isnan(event.pressure)) {
      pressure = event.pressure;
      bmp.getTemperature(&temp_bmp);
    }
  }
  
  // Check if DHT readings failed
  if (isnan(humidity) || isnan(temp_dht)) {
    Serial.println("Failed to read from DHT sensor! Skipping this transmission.");
    return;
  }
  
  // Calculate uptime
  unsigned long uptimeMillis = millis() - bootTime;
  unsigned long uptimeSeconds = uptimeMillis / 1000;
  unsigned long uptimeMinutes = uptimeSeconds / 60;
  unsigned long uptimeHours = uptimeMinutes / 60;
  unsigned long uptimeDays = uptimeHours / 24;
  
  String uptimeStr;
  if (uptimeDays > 0) {
    uptimeStr = String(uptimeDays) + " days, " + String(uptimeHours % 24) + " hours";
  } else if (uptimeHours > 0) {
    uptimeStr = String(uptimeHours) + " hours, " + String(uptimeMinutes % 60) + " minutes";
  } else {
    uptimeStr = String(uptimeMinutes) + " minutes, " + String(uptimeSeconds % 60) + " seconds";
  }
  
  // Get WiFi signal strength
  long rssi = WiFi.RSSI();
  
  // Create JSON document
  DynamicJsonDocument jsonDoc(1024);
  jsonDoc["device_id"] = deviceId;
  jsonDoc["temperature_dht"] = temp_dht;
  jsonDoc["humidity"] = humidity;
  jsonDoc["signal_strength"] = rssi;
  jsonDoc["uptime"] = uptimeStr;
  
  // Add BMP data if available
  if (!isnan(temp_bmp)) {
    jsonDoc["temperature_bmp"] = temp_bmp;
  }
  
  if (!isnan(pressure)) {
    jsonDoc["pressure"] = pressure;
  }
  
  // Serialize JSON to string
  String jsonString;
  serializeJson(jsonDoc, jsonString);
  
  Serial.println("Sending data to server: " + jsonString);
  
  // Use WiFiClientSecure for HTTPS connections
  WiFiClientSecure secureClient;
  // Skip certificate verification
  secureClient.setInsecure();
  
  HTTPClient https;
  
  // Start connection and send HTTP header
  https.setTimeout(15000); // 15 second timeout
  
  // Begin HTTP session
  bool success = https.begin(secureClient, serverUrl);
  if (!success) {
    Serial.println("HTTPS setup failed");
    return;
  }
  
  // Add headers
  https.addHeader("Content-Type", "application/json");
  
  // Send the request
  Serial.println("Sending HTTPS POST request...");
  int httpCode = https.POST(jsonString);
  Serial.println("HTTPS status code: " + String(httpCode));
  
  // Check for successful response (200 or 201)
  if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
    String response = https.getString();
    Serial.println("Success! Response: " + response);
    
    // Update display with success
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Data sent OK!");
    display.println("Temp: " + String(temp_dht) + "C");
    display.println("Humidity: " + String(humidity) + "%");
    display.display();
  }
  else {
    Serial.println("HTTP Error: " + String(httpCode));
    
    if (httpCode > 0) {
      // Response received but with error
      String response = https.getString();
      Serial.println("Response: " + response);
    } else {
      // No response
      Serial.println("Connection failed: " + https.errorToString(httpCode));
    }
    
    // Show error on display
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("HTTP Error");
    display.println("Code: " + String(httpCode));
    display.display();
  }
  
  // Clean up
  https.end();
  Serial.println("HTTPS connection closed");
  
  // Small delay after sending to prevent freezing
  delay(500);
}