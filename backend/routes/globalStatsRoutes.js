// routes/globalStatsRoutes.js
import express from "express";
import { getGlobalStats } from "../controllers/globalStatsController.js";

const router = express.Router();

// keep this public - global stats can be public
router.get("/", getGlobalStats);

export default router;
