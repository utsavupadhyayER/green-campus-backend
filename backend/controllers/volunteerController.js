// controllers/volunteerController.js
import VolunteerEvent from "../models/volunteerModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

/**
 * GET /api/volunteers
 * returns list of events with registered info populated
 */

export const deleteVolunteer = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await VolunteerEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const currentUserId = req.user._id.toString();
    const isCreator = event.created_by?.toString() === currentUserId;
    const isAdmin = req.user.role === "admin"; // <-- only admin + creator
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteVolunteer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllVolunteers = async (req, res) => {
  try {
    const events = await VolunteerEvent.find()
      .populate("created_by", "full_name email role")
      .populate("registered.user", "full_name email role volunteer_points");
    res.json(events);
  } catch (err) {
    console.error("getAllVolunteers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/volunteers
 * create volunteer event (creator must be authenticated)
 */
export const createVolunteer = async (req, res) => {
  try {
    const payload = { ...req.body, created_by: req.user._id };
    const event = await VolunteerEvent.create(payload);
    res.status(201).json(event);
  } catch (err) {
    console.error("createVolunteer error:", err);
    res.status(400).json({ message: "Invalid data or missing fields" });
  }
};

/**
 * POST /api/volunteers/:id/register
 * student registration for an event
 * - only students (or authenticated users) should call this
 * - prevents duplicate registration
 */
export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await VolunteerEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // prevent registering if event is not upcoming
    if (event.status !== "upcoming" && event.status !== "ongoing") {
      return res.status(400).json({ message: "Cannot register for this event" });
    }

    // check duplicates
    const already = event.registered.find(r => r.user.toString() === userId.toString());
    if (already) return res.status(400).json({ message: "Already registered" });

    // prevent overflow of max volunteers
    if (event.max_volunteers && event.registered_count >= event.max_volunteers) {
      return res.status(400).json({ message: "Event is full" });
    }

    // push registration
    event.registered.push({ user: userId });
    event.registered_count = (event.registered_count || 0) + 1;
    await event.save();

    const populated = await VolunteerEvent.findById(eventId).populate("registered.user", "full_name email role volunteer_points");

    res.status(200).json({ message: "Registered", data: populated });
  } catch (err) {
    console.error("registerForEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/volunteers/:id/complete
 * Mark entire event as completed and award points to attendees (registered entries)
 * - can be called by event organizer (created_by) or admin/ngo (you can adjust)
 * - awards `points_reward` to registered users where points_awarded === false
 * - uses mongoose transaction when available (optional)
 */
export const completeEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await VolunteerEvent.findById(eventId).populate("registered.user", "full_name volunteer_points role");
    if (!event) return res.status(404).json({ message: "Event not found" });

    const currentUserId = req.user._id.toString();
    const isCreator = event.created_by?.toString() === currentUserId;
    const isAdmin = req.user.role === "admin"; // <-- admin allowed
    // NOTE: Previously we allowed ngo also; now only event creator or admin.

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to complete this event" });
    }

    // ... rest of awarding logic remains the same ...
  } catch (err) {
    console.error("completeEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * POST /api/volunteers/:id/attendance/:userId
 * Mark a single registered user's attendance and award points (useful when you want to award individually)
 * - authorized: creator or admin/ngo
 */
export const markAttendance = async (req, res) => {
  try {
    const { id: eventId, userId } = req.params;
    const event = await VolunteerEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const currentUserId = req.user._id.toString();
    const isCreator = event.created_by?.toString() === currentUserId;
    const isAdmin = req.user.role === "admin"; // <-- only admin + creator
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ... award single user logic remains the same ...
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
