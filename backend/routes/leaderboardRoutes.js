// routes/leaderboardRoutes.js
import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/leaderboard?limit=20
router.get("/", protect, getLeaderboard);

export default router;
