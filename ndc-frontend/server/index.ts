import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

/**
 * Create and return an Express app for serving the SPA.
 * All data operations use Supabase directly from the frontend via client/lib/supabase-api.ts
 * This server only handles static file serving in production.
 */
export async function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // In production the built SPA can be served from the `spa` folder.
  if (process.env.NODE_ENV === "production") {
    const __dirname = import.meta.dirname;
    const distPath = path.join(__dirname, "../spa");

    app.use(express.static(distPath));

    app.get(/^(?!\/api\/).*$/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

/**
 * Start the server (listen on a port). Useful for starting the production server.
 */
export async function startServer() {
  try {
    const app = await createServer();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
