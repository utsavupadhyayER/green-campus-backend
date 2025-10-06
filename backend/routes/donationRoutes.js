import express from "express";
import { getAllDonations, createDonation } from "../controllers/donationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllDonations);
router.post("/", protect, createDonation);

export default router;

