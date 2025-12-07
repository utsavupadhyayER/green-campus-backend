// routes/volunteerRoutes.js
import express from "express";
import {
  getAllVolunteers,
  createVolunteer,
  registerForEvent,
  completeEvent,
  markAttendance,
  deleteVolunteer, // <- add this
} from "../controllers/volunteerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllVolunteers);
router.post("/", protect, createVolunteer);
router.post("/:id/register", protect, registerForEvent);
router.post("/:id/complete", protect, completeEvent);
router.post("/:id/attendance/:userId", protect, markAttendance);

// DELETE event
router.delete("/:id", protect, deleteVolunteer);

export default router;
