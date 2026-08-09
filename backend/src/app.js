import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: false
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api", apiRouter);
  app.use("/", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
