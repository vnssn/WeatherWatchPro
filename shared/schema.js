import { pgTable, text, serial, integer, numeric, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Weather data table schema
export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  device_id: varchar("device_id", { length: 50 }).notNull(),
  temperature_dht: numeric("temperature_dht").notNull(),
  temperature_bmp: numeric("temperature_bmp"),
  humidity: numeric("humidity").notNull(),
  pressure: numeric("pressure"),
  signal_strength: integer("signal_strength"),
  uptime: varchar("uptime", { length: 50 }),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Schema for inserting weather data
export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  timestamp: true,
}).extend({
  // Allow number values for these fields instead of string
  temperature_dht: z.number(),
  temperature_bmp: z.number().optional(),
  humidity: z.number(),
  pressure: z.number().optional(),
  signal_strength: z.number().optional(),
}); 