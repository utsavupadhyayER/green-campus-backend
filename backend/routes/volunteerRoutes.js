import express from "express";
import { getAllVolunteers, createVolunteer } from "../controllers/volunteerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllVolunteers);
router.post("/", protect, createVolunteer);

export default router;

