import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
// import foodRoutes from "./routes/foodRoutes.js";
// import ewasteRoutes from "./routes/ewasteRoutes.js";
// import volunteerRoutes from "./routes/volunteerRoutes.js";
// import donationRoutes from "./routes/donationRoutes.js";
// import impactRoutes from "./routes/impactRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/food", foodRoutes);
// app.use("/api/ewaste", ewasteRoutes);
// app.use("/api/volunteers", volunteerRoutes);
// app.use("/api/donations", donationRoutes);
// app.use("/api/impact", impactRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

export default app;
