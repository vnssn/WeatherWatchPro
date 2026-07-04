import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // Exclude TypeScript files from processing
      exclude: ["**/*.ts", "**/*.tsx"]
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
    // Only process JavaScript files
    extensions: ['.js', '.jsx', '.json']
  },
  root: "client",
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  // Disable TypeScript checking
  esbuild: {
    loader: 'jsx',
    include: /\.jsx?$/,
    exclude: /\.tsx?$/,
  }
}); 