import express from "express";
import { getImpactStats } from "../controllers/impactController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getImpactStats);

export default router;
