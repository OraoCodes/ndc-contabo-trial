// vite.config.ts
import { defineConfig, Plugin } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"
import { createServer } from "./server/index.ts"

let app: any = null

function expressPlugin(): Plugin {
  return {
    name: "express-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (!app) {
            console.log("Starting Express server...")
            app = await createServer()
            console.log("Express server ready")
          }
          app(req, res, next)
        } catch (err) {
          console.error("Express server error:", err)
          next(err)
        }
      })
    },
  }
}

/** Prevents 404 from cached PWA service workers / extensions that request this path. */
function stubPwaPlugin(): Plugin {
  return {
    name: "stub-pwa-entry",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/@vite-plugin-pwa/pwa-entry-point-loaded" || req.url?.startsWith("/@vite-plugin-pwa/")) {
          res.setHeader("Content-Type", "application/javascript")
          res.statusCode = 200
          res.end("/* PWA plugin not used */")
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  },

  // THIS IS THE FIX FOR DEPLOYMENT
  build: {
    outDir: "dist/spa",      // Vite will now output client files here
    emptyOutDir: true,       // Clean the folder on each build
  },

  plugins: [stubPwaPlugin(), react(), expressPlugin()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
})
