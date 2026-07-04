import { storage } from "./storage.js";
import { insertWeatherDataSchema } from "../shared/schema.js";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app) {
  // Get current weather data
  app.get("/api/weather/current", async (_req, res) => {
    try {
      const data = await storage.getCurrentWeatherData();
      
      if (!data) {
        return res.status(404).json({ message: "No weather data available" });
      }
      
      return res.json(data);
    } catch (error) {
      console.error("Error fetching current weather data:", error);
      return res.status(500).json({ message: "Failed to fetch current weather data" });
    }
  });

  // Get historical weather data (24 hours by default)
  app.get("/api/weather/history", async (req, res) => {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours) : 24;
      
      // Validate hours parameter
      if (isNaN(hours) || hours <= 0 || hours > 72) {
        return res.status(400).json({ message: "Hours must be a number between 1 and 72" });
      }
      
      const data = await storage.getHistoricalData(hours);
      return res.json(data);
    } catch (error) {
      console.error("Error fetching historical weather data:", error);
      return res.status(500).json({ message: "Failed to fetch historical weather data" });
    }
  });

  // Receive weather data from ESP8266
  app.post("/api/weather", async (req, res) => {
    try {
      // Validate request body
      const result = insertWeatherDataSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Save weather data
      const savedData = await storage.saveWeatherData(result.data);
      
      console.log(`Received weather data from ${savedData.device_id}`);
      
      return res.status(201).json({
        message: "Weather data saved successfully",
        data: savedData,
      });
    } catch (error) {
      console.error("Error saving weather data:", error);
      return res.status(500).json({ message: "Failed to save weather data" });
    }
  });
} 