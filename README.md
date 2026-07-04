# WeatherWatchPro

This application is a weather monitoring dashboard that receives data from an ESP8266 sensor and displays it.

## Prerequisites

- Node.js (v20 or later recommended)
- npm
- A PostgreSQL database
- Vercel Account & Vercel CLI (for deployment)

## Environment Variables

When deploying to Vercel, set these in your Vercel project settings. For local development, you can use a `.env` file (ensure it's in `.gitignore`).

- `DATABASE_URL`: The connection string for your PostgreSQL database. Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`
- `NODE_ENV`: Vercel automatically sets this to `production` for deployments. For local, set to `development`.
- `PORT`: (For local development) The port the server should listen on. Defaults to 5000. Vercel handles port assignment automatically.

## Getting Started (Local Development)

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd WeatherWatchPro
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your PostgreSQL database** and ensure the `DATABASE_URL` is correctly configured in your environment or a `.env` file.

4.  **Run database migrations (if you are setting up the schema for the first time):**
    The project uses Drizzle ORM. To push schema changes (after defining them in `shared/schema.ts`):
    ```bash
    npm run db:push
    ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server for the client and the Express server for the backend with hot reloading, typically on `http://localhost:5000`.

## Building for Production (Manual)

While Vercel handles the build automatically during deployment, if you need to build locally for production:

```bash
npm run build
```
This command will:
- Build the client-side application using Vite (output to `dist/public`).
- Build the server-side application using esbuild (output to `dist`).

To run this local production build:
```bash
NODE_ENV=production npm start
```
Ensure your `DATABASE_URL` environment variable is set.

## Deployment to Vercel

1.  **Install Vercel CLI (if you haven't already):**
    ```bash
    npm install -g vercel
    ```

2.  **Login to Vercel (if you haven't already):**
    ```bash
    vercel login
    ```

3.  **Deploy from the project root:**
    Simply run:
    ```bash
    vercel --yes
    ```
    Or, to deploy to production directly (e.g., from your main branch):
    ```bash
    vercel --prod --yes
    ```
    Vercel will automatically detect the project type, use the `vercel.json` for configuration, build your client and server, and deploy them.

4.  **Configure Environment Variables in Vercel:**
    After the first deployment, or by linking to a Git repository, go to your project settings on the Vercel dashboard. Add your `DATABASE_URL` under "Environment Variables".

## ESP8266 Configuration

Remember to update your ESP8266 device (`arduino_code.ino` or similar) to send data to your deployed Vercel app's API endpoint (e.g., `https://<your-vercel-project-name>.vercel.app/api/weather`).

## Project Structure

- `client/`: Frontend React application (Vite)
- `server/`: Backend Express.js API (Node.js, TypeScript)
- `shared/`: Shared code/types between client and server (e.g., Drizzle schema)
- `dist/`: Local build output directory (client in `dist/public`, server in `dist`)
- `vercel.json`: Configuration file for Vercel deployment. 