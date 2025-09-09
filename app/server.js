// Import tracing setup first (only once!)
import "./tracing.js";

import express from "express";
import pino from "pino";
import client from "prom-client";

const app = express();
const logger = pino();

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// 🔹 Custom metrics
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});
register.registerMetric(httpRequestCounter);

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5], // buckets in seconds
});
register.registerMetric(httpRequestDuration);

// Middleware to track requests
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get("/", (req, res) => {
  logger.info("Hello endpoint hit");
  res.send("Hello from Observability App 🚀");
});

app.get("/work", async (req, res) => {
  logger.info("Work endpoint hit");
  await new Promise((resolve) => setTimeout(resolve, 500));
  res.send("Work done ✅");
});

app.get("/error", (req, res) => {
  logger.error("Error endpoint hit");
  throw new Error("Simulated error ❌");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`server on :${PORT}`);
});
