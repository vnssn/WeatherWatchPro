import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env file into process.env

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set in the environment.");
  console.error("Please ensure it is defined in your .env file or as an environment variable.");
  throw new Error("DATABASE_URL not found. Ensure the database is provisioned and URL is set.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true, // Optional: for more detailed output from drizzle-kit
  strict: true,  // Optional: for stricter checks
}); 