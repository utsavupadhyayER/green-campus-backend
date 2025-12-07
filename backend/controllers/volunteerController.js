// controllers/volunteerController.js
import VolunteerEvent from "../models/volunteerModel.js";
import User from "../models/userModel.js";

/* ---------------------------------------------------------
   Helper: Check if current user is the creator OR admin
--------------------------------------------------------- */
function isEventCreatorOrAdmin(event, user) {
  const userId = user._id.toString();
  const createdBy = event.created_by?._id?.toString() || event.created_by?.toString();

  const isCreator = createdBy === userId;
  const isAdmin = user.role === "admin";

  return isCreator || isAdmin;
}

/* ---------------------------------------------------------
   Delete Event
--------------------------------------------------------- */
export const deleteVolunteer = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await VolunteerEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!isEventCreatorOrAdmin(event, req.user)) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("deleteVolunteer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------------------------
   Get All Events
--------------------------------------------------------- */
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

/* ---------------------------------------------------------
   Create Event
--------------------------------------------------------- */
export const createVolunteer = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.user._id,
    };

    const event = await VolunteerEvent.create(payload);
    res.status(201).json(event);

  } catch (err) {
    console.error("createVolunteer error:", err);
    res.status(400).json({ message: "Invalid data or missing fields" });
  }
};

/* ---------------------------------------------------------
   Student Register For Event
--------------------------------------------------------- */
export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id.toString();

    const event = await VolunteerEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!["upcoming", "ongoing"].includes(event.status)) {
      return res.status(400).json({ message: "Cannot register for this event" });
    }

    const already = event.registered.find(r => r.user.toString() === userId);
    if (already) return res.status(400).json({ message: "Already registered" });

    if (event.max_volunteers && event.registered_count >= event.max_volunteers) {
      return res.status(400).json({ message: "Event is full" });
    }

    event.registered.push({ user: userId });
    event.registered_count = (event.registered_count || 0) + 1;

    await event.save();

    const populated = await VolunteerEvent.findById(eventId)
      .populate("registered.user", "full_name email role volunteer_points");

    res.status(200).json({ message: "Registered", data: populated });

  } catch (err) {
    console.error("registerForEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------------------------
   Mark Event as Completed + Award Points to All Registered
--------------------------------------------------------- */
export const completeEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await VolunteerEvent.findById(eventId)
      .populate("registered.user", "full_name volunteer_points role");

    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only event creator or admin
    if (!isEventCreatorOrAdmin(event, req.user)) {
      return res.status(403).json({ message: "Not authorized to complete this event" });
    }

    if (event.status === "completed") {
      return res.status(400).json({ message: "Event already completed" });
    }

    const reward = event.points_reward || 0;

    for (const entry of event.registered) {
      if (!entry.points_awarded) {
        entry.points_awarded = true;

        await User.findByIdAndUpdate(entry.user._id || entry.user, {
          $inc: { volunteer_points: reward },
        });
      }
    }

    event.status = "completed";
    await event.save();

    const updated = await VolunteerEvent.findById(eventId)
      .populate("registered.user", "full_name volunteer_points role");

    res.status(200).json({ message: "Event completed", data: updated });

  } catch (err) {
    console.error("completeEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------------------------
   Mark a Single User's Attendance
--------------------------------------------------------- */
export const markAttendance = async (req, res) => {
  try {
    const { id: eventId, userId } = req.params;

    const event = await VolunteerEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!isEventCreatorOrAdmin(event, req.user)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const entry = event.registered.find(r => r.user.toString() === userId);
    if (!entry) return res.status(404).json({ message: "User not registered" });

    if (entry.points_awarded) {
      return res.status(400).json({ message: "Points already awarded" });
    }

    entry.points_awarded = true;

    await User.findByIdAndUpdate(userId, {
      $inc: { volunteer_points: event.points_reward || 0 },
    });

    await event.save();

    res.status(200).json({ message: "Attendance marked & points awarded" });

  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
