const express = require("express");
const cors = require("cors");
const { FRONTEND_URL, NODE_ENV } = require("./config/env");

// Route modules
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const designRoutes = require("./routes/designRoutes");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Pola-Tech API is running.",
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/designs", designRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Prisma known request errors
  if (err.code && err.code.startsWith("P")) {
    return res.status(400).json({
      status: "error",
      message: "Database operation failed.",
      detail: NODE_ENV === "development" ? err.message : undefined,
    });
  }

  return res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error.",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
