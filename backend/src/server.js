require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rateLimiter.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const noteRoutes = require("./routes/note.routes");
const paymentRoutes = require("./routes/payment.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const walletRoutes = require("./routes/wallet.routes");
const notificationRoutes = require("./routes/notification.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// CORS — allow specific origins from .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// Logging — only in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// General rate limit
app.use("/api", apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV, time: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 OpenNote server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;