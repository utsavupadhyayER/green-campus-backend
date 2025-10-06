import express from "express";
import { getAllEwaste, createEwaste } from "../controllers/ewasteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllEwaste);
router.post("/", protect, createEwaste);

export default router;
