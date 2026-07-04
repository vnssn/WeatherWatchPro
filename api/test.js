// Simple test API endpoint
export default function handler(req, res) {
  res.status(200).json({
    message: "API is working!",
    env: process.env.DATABASE_URL ? "Database URL is set" : "Database URL is not set",
    timestamp: new Date().toISOString()
  });
} 