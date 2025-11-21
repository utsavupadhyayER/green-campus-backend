import express from "express";
import {
  getAllFood,
  createFood,
  claimFood,
  updateFood,
  deleteFood
} from "../controllers/foodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllFood);
router.post("/", protect, createFood);

router.patch("/:id/claim", protect, claimFood);   // ⭐ NEW
router.put("/:id", protect, updateFood);          // ⭐ NEW
router.delete("/:id", protect, deleteFood);       // ⭐ NEW

export default router;
