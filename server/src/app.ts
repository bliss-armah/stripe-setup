import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import transactionRoutes from "./routes/transactionRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { handleStripeWebhook } from "./controllers/transactionController";

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

app.use("/api/transactions/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/transactions", transactionRoutes);

// Error handling
app.use(errorHandler);

// Start server only if DB connects successfully
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
