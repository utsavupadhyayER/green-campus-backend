import express from "express";
import { getAllFood, createFood } from "../controllers/foodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllFood);
router.post("/", protect, createFood);

export default router;
