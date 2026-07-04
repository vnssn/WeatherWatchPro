import { weatherData } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, gte } from "drizzle-orm";

export class DatabaseStorage {
  async saveWeatherData(data) {
    // Drizzle should handle number to numeric conversion for PostgreSQL.    
    const [result] = await db
      .insert(weatherData)
      .values([data]) // Use original data with numbers
      .returning();
      
    return result;
  }

  async getCurrentWeatherData() {
    // Get the most recent data
    const results = await db
      .select()
      .from(weatherData)
      .orderBy(desc(weatherData.timestamp))
      .limit(1);
      
    return results.length > 0 ? results[0] : undefined;
  }

  async getHistoricalData(hours = 24) {
    const now = new Date();
    const earliestTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    // Get data within the time range
    const results = await db
      .select()
      .from(weatherData)
      .where(gte(weatherData.timestamp, earliestTime))
      .orderBy(weatherData.timestamp);
      
    return results;
  }
}

export const storage = new DatabaseStorage(); 