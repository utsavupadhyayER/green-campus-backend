import express from "express";
import {
  getAllDonations,
  createDonation,
  claimDonation,
  unclaimDonation,
} from "../controllers/donationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ====== Donation CRUD ====== */
router.get("/", protect, getAllDonations);
router.post("/", protect, createDonation);

/* ====== Claim / Unclaim Donation ====== */
router.patch("/:id/claim", protect, claimDonation);
router.patch("/:id/unclaim", protect, unclaimDonation);

export default router;
