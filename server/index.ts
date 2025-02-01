import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { stakingMonitor } from './services/monitoring'; // Added staking monitoring service

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

const startServer = async (port: number) => {
  try {
    const server = registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    return new Promise((resolve, reject) => {
      server.listen(port, "0.0.0.0")
        .once('listening', () => {
          log(`Server started successfully on port ${port}`);
          stakingMonitor.start(); // Start monitoring after server starts
          resolve(server);
        })
        .once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            log(`Port ${port} is in use, trying next port`);
            resolve(startServer(port + 1));
          } else {
            reject(err);
          }
        });
    });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    throw error;
  }
};

(async () => {
  try {
    const initialPort = 5000;
    await startServer(initialPort);
  } catch (error) {
    log(`Fatal error starting server: ${error}`);
    process.exit(1);
  }
})();

// Add the following in a new file named 'services/monitoring.ts' or similar:
// export const stakingMonitor = {
//   start: () => {
//     //Implementation for starting the staking monitoring process.  This would include
//     //logic to check the PIVX node's status, wallet balance, and transaction history,
//     //and possibly send alerts based on predefined thresholds.  
//     console.log("Staking monitor started.");
//   }
// };

//  Further implementation is needed for wallet permissions, RPC access and more robust monitoring.  
//  These should be added to this file or other relevant services files.