// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import ewasteRoutes from "./routes/ewasteRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import impactRoutes from "./routes/impactRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import globalStatsRoutes from "./routes/globalStatsRoutes.js";


dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ewaste", ewasteRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/global-stats", globalStatsRoutes);

// fallback handlers
app.use(notFound);
app.use(errorHandler);

export default app;
