import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Add metadata for SEO
document.title = "ESP8266 Weather Station Dashboard";

// Add meta description
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Real-time weather monitoring dashboard for ESP8266 with DHT11 and BMP180 sensors showing temperature, humidity, and pressure data.';
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")).render(<App />); 