import express from "express";
import {
  getAllEwaste,
  createEwaste,
  claimEwaste,
  updateEwaste,
  deleteEwaste,
} from "../controllers/ewasteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Get all ewaste posts
router.get("/", protect, getAllEwaste);

// 🔹 Create a new ewaste post
router.post("/", protect, createEwaste);

// 🔹 Claim an ewaste item
router.patch("/:id/claim", protect, claimEwaste);

// 🔹 Update an ewaste post (only creator can update)
router.put("/:id", protect, updateEwaste);

// 🔹 Delete an ewaste post (only creator can delete)
router.delete("/:id", protect, deleteEwaste);

export default router;
