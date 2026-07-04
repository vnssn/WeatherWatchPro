#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>
#include <Adafruit_SH110X.h>
#include <DHT.h>

// === WiFi configuration ===
const char* ssid = "YOUR_WIFI_SSID";     // Replace with your WiFi SSID
const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password

// === Server configuration ===
const char* serverUrl = "http://YOUR_SERVER_URL:5000/api/weather"; // Replace with your server URL

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
  
  // Read sensor data and display on OLED
  readAndDisplaySensorData();
  
  // Check if it's time to send data to the server
  if (currentMillis - lastSendTime >= sendInterval) {
    lastSendTime = currentMillis;
    sendDataToServer();
  }
  
  delay(2000);  // Small delay between readings for display updates
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
  // Only proceed if WiFi is connected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Cannot send data.");
    return;
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
  
  // Create HTTP client
  WiFiClient client;
  HTTPClient http;
  
  // Begin HTTP request
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  // Check response
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
    
    // Display success on OLED
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Data sent successfully!");
    display.println("Response code: " + String(httpResponseCode));
    display.display();
  } else {
    Serial.println("Error on HTTP request: " + String(httpResponseCode));
    
    // Display error on OLED
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("HTTP Error!");
    display.println("Code: " + String(httpResponseCode));
    display.display();
  }
  
  http.end();
}
